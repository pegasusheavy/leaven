/**
 * @leaven-graphql/ws - WebSocket handler
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { GraphQLSchema } from 'graphql';
import type { ServerWebSocket } from 'bun';
import type { GraphQLRequest } from '@leaven-graphql/core';

import { SubscriptionManager, type SubscriptionManagerConfig } from './manager';
import {
  MessageType,
  parseMessage,
  formatMessage,
  createConnectionAck,
  createNextMessage,
  createErrorMessage,
  createCompleteMessage,
  createPongMessage,
  type Message,
  type SubscribeMessage,
} from './protocol';

/**
 * WebSocket context data
 */
export interface WebSocketContext {
  /** Connection ID */
  connectionId: string;
  /** Connection parameters from init */
  connectionParams?: Record<string, unknown>;
  /** Whether the connection is initialized */
  initialized: boolean;
  /** Active subscription IDs */
  subscriptions: Set<string>;
}

/**
 * Context factory for WebSocket connections
 */
export type WebSocketContextFactory<TContext> = (
  socket: ServerWebSocket<WebSocketContext>,
  request: GraphQLRequest
) => TContext | Promise<TContext>;

/**
 * WebSocket handler configuration
 */
export interface WebSocketHandlerConfig<TContext = unknown> {
  /** GraphQL schema */
  schema: GraphQLSchema;
  /** Context factory */
  context?: WebSocketContextFactory<TContext>;
  /** Connection initialization timeout (ms) */
  connectionInitTimeout?: number;
  /** Keep alive interval (ms) */
  keepAliveInterval?: number;
  /** Subscription manager config */
  subscriptionManager?: Omit<SubscriptionManagerConfig, 'schema'>;
  /** Called when a connection is initialized */
  onConnect?: (
    socket: ServerWebSocket<WebSocketContext>,
    params?: Record<string, unknown>
  ) => boolean | Promise<boolean>;
  /** Called when a connection is closed */
  onDisconnect?: (socket: ServerWebSocket<WebSocketContext>) => void | Promise<void>;
  /** Called on subscription start */
  onSubscribe?: (
    socket: ServerWebSocket<WebSocketContext>,
    id: string,
    request: GraphQLRequest
  ) => void | Promise<void>;
  /** Called on subscription end */
  onComplete?: (
    socket: ServerWebSocket<WebSocketContext>,
    id: string
  ) => void | Promise<void>;
}

/**
 * WebSocket handler for Bun
 */
export class WebSocketHandler<TContext = unknown> {
  private readonly schema: GraphQLSchema;
  private readonly contextFactory?: WebSocketContextFactory<TContext>;
  private readonly connectionInitTimeout: number;
  private readonly keepAliveInterval: number;
  private readonly subscriptionManager: SubscriptionManager;
  private readonly onConnect?: WebSocketHandlerConfig<TContext>['onConnect'];
  private readonly onDisconnect?: WebSocketHandlerConfig<TContext>['onDisconnect'];
  private readonly onSubscribe?: WebSocketHandlerConfig<TContext>['onSubscribe'];
  private readonly onComplete?: WebSocketHandlerConfig<TContext>['onComplete'];

  private readonly initTimeouts: Map<string, ReturnType<typeof setTimeout>>;
  private readonly keepAliveTimers: Map<string, ReturnType<typeof setInterval>>;

  constructor(config: WebSocketHandlerConfig<TContext>) {
    this.schema = config.schema;
    this.contextFactory = config.context;
    this.connectionInitTimeout = config.connectionInitTimeout ?? 3000;
    this.keepAliveInterval = config.keepAliveInterval ?? 12000;
    this.subscriptionManager = new SubscriptionManager({
      schema: config.schema,
      ...config.subscriptionManager,
    });
    this.onConnect = config.onConnect;
    this.onDisconnect = config.onDisconnect;
    this.onSubscribe = config.onSubscribe;
    this.onComplete = config.onComplete;

    this.initTimeouts = new Map();
    this.keepAliveTimers = new Map();
  }

  /**
   * Generate a unique connection ID
   */
  private generateConnectionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle WebSocket open
   */
  public handleOpen(socket: ServerWebSocket<WebSocketContext>): void {
    const connectionId = this.generateConnectionId();

    socket.data = {
      connectionId,
      initialized: false,
      subscriptions: new Set(),
    };

    // Set connection init timeout
    const timeout = setTimeout(() => {
      if (!socket.data.initialized) {
        socket.close(4408, 'Connection initialization timeout');
      }
    }, this.connectionInitTimeout);

    this.initTimeouts.set(connectionId, timeout);
  }

  /**
   * Handle WebSocket message
   */
  public async handleMessage(
    socket: ServerWebSocket<WebSocketContext>,
    message: string | Buffer
  ): Promise<void> {
    try {
      const parsed = parseMessage(message);
      await this.processMessage(socket, parsed);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid message';
      socket.close(4400, errorMessage);
    }
  }

  /**
   * Process a parsed message
   */
  private async processMessage(
    socket: ServerWebSocket<WebSocketContext>,
    message: Message
  ): Promise<void> {
    switch (message.type) {
      case MessageType.ConnectionInit:
        await this.handleConnectionInit(socket, message.payload);
        break;

      case MessageType.Ping:
        socket.send(formatMessage(createPongMessage(message.payload)));
        break;

      case MessageType.Pong:
        // Client responded to our ping
        break;

      case MessageType.Subscribe:
        if (!socket.data.initialized) {
          socket.close(4401, 'Unauthorized');
          return;
        }
        await this.handleSubscribe(socket, message);
        break;

      case MessageType.Complete:
        if (!socket.data.initialized) {
          return;
        }
        this.handleComplete(socket, message.id);
        break;

      default:
        socket.close(4400, 'Invalid message');
    }
  }

  /**
   * Handle connection init message
   */
  private async handleConnectionInit(
    socket: ServerWebSocket<WebSocketContext>,
    params?: Record<string, unknown>
  ): Promise<void> {
    // Clear init timeout
    const timeout = this.initTimeouts.get(socket.data.connectionId);
    if (timeout) {
      clearTimeout(timeout);
      this.initTimeouts.delete(socket.data.connectionId);
    }

    // Check onConnect hook
    if (this.onConnect) {
      const allowed = await this.onConnect(socket, params);
      if (!allowed) {
        socket.close(4403, 'Forbidden');
        return;
      }
    }

    socket.data.connectionParams = params;
    socket.data.initialized = true;

    // Send ack
    socket.send(formatMessage(createConnectionAck()));

    // Start keep-alive
    if (this.keepAliveInterval > 0) {
      const timer = setInterval(() => {
        socket.send(formatMessage({ type: MessageType.Ping }));
      }, this.keepAliveInterval);

      this.keepAliveTimers.set(socket.data.connectionId, timer);
    }
  }

  /**
   * Handle subscribe message
   */
  private async handleSubscribe(
    socket: ServerWebSocket<WebSocketContext>,
    message: SubscribeMessage
  ): Promise<void> {
    const { id, payload } = message;

    // Check if subscription ID already exists
    if (socket.data.subscriptions.has(id)) {
      socket.close(4409, `Subscriber for ${id} already exists`);
      return;
    }

    const request: GraphQLRequest = {
      query: payload.query,
      operationName: payload.operationName,
      variables: payload.variables,
      extensions: payload.extensions,
    };

    // Call onSubscribe hook
    await this.onSubscribe?.(socket, id, request);

    // Build context
    let context: TContext | undefined;
    if (this.contextFactory) {
      context = await this.contextFactory(socket, request);
    }

    socket.data.subscriptions.add(id);

    // Create subscription
    await this.subscriptionManager.subscribe(
      socket.data.connectionId,
      id,
      request,
      context,
      (result) => {
        socket.send(formatMessage(createNextMessage(id, result.data, result.errors)));
      },
      () => {
        socket.send(formatMessage(createCompleteMessage(id)));
        socket.data.subscriptions.delete(id);
        this.onComplete?.(socket, id);
      },
      (errors) => {
        socket.send(formatMessage(createErrorMessage(id, errors)));
        socket.data.subscriptions.delete(id);
        this.onComplete?.(socket, id);
      }
    );
  }

  /**
   * Handle complete message (client unsubscribe)
   */
  private handleComplete(
    socket: ServerWebSocket<WebSocketContext>,
    subscriptionId: string
  ): void {
    socket.data.subscriptions.delete(subscriptionId);
    this.subscriptionManager.unsubscribe(subscriptionId);
    this.onComplete?.(socket, subscriptionId);
  }

  /**
   * Handle WebSocket close
   */
  public async handleClose(socket: ServerWebSocket<WebSocketContext>): Promise<void> {
    const { connectionId } = socket.data;

    // Clear timeouts/timers
    const initTimeout = this.initTimeouts.get(connectionId);
    if (initTimeout) {
      clearTimeout(initTimeout);
      this.initTimeouts.delete(connectionId);
    }

    const keepAliveTimer = this.keepAliveTimers.get(connectionId);
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      this.keepAliveTimers.delete(connectionId);
    }

    // Unsubscribe all subscriptions
    this.subscriptionManager.unsubscribeConnection(connectionId);

    // Call onDisconnect hook
    await this.onDisconnect?.(socket);
  }

  /**
   * Get Bun WebSocket handler config
   */
  public getWebSocketConfig(): {
    open: (socket: ServerWebSocket<WebSocketContext>) => void;
    message: (socket: ServerWebSocket<WebSocketContext>, message: string | Buffer) => void;
    close: (socket: ServerWebSocket<WebSocketContext>) => void;
  } {
    return {
      open: (socket: ServerWebSocket<WebSocketContext>) => this.handleOpen(socket),
      message: (socket: ServerWebSocket<WebSocketContext>, message: string | Buffer) =>
        this.handleMessage(socket, message),
      close: (socket: ServerWebSocket<WebSocketContext>) => this.handleClose(socket),
    };
  }
}

/**
 * Create a WebSocket handler
 */
export function createWebSocketHandler<TContext = unknown>(
  config: WebSocketHandlerConfig<TContext>
): WebSocketHandler<TContext> {
  return new WebSocketHandler(config);
}
