/**
 * @leaven-graphql/nestjs - Subscriptions Support
 *
 * Provides WebSocket-based GraphQL subscriptions integration for NestJS.
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { Injectable, Inject, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { LEAVEN_MODULE_OPTIONS, LEAVEN_DRIVER } from './module';
import { LeavenDriver } from './driver';
import type { LeavenModuleOptions, GqlContext } from './types';

/**
 * Subscription configuration
 */
export interface SubscriptionConfig {
  /**
   * WebSocket path for subscriptions
   * @default '/graphql'
   */
  path?: string;

  /**
   * Keep-alive interval in milliseconds
   * @default 12000
   */
  keepAlive?: number;

  /**
   * Connection initialization timeout in milliseconds
   * @default 3000
   */
  connectionInitWaitTimeout?: number;

  /**
   * Maximum number of subscriptions per connection
   * @default 100
   */
  maxSubscriptionsPerConnection?: number;

  /**
   * Context factory for subscription connections
   */
  context?: (ctx: SubscriptionContext) => GqlContext | Promise<GqlContext>;

  /**
   * Connection callback - called when a client connects
   */
  onConnect?: (ctx: SubscriptionContext) => boolean | Promise<boolean>;

  /**
   * Disconnect callback - called when a client disconnects
   */
  onDisconnect?: (ctx: SubscriptionContext) => void | Promise<void>;

  /**
   * Subscribe callback - called when a subscription starts
   */
  onSubscribe?: (ctx: SubscriptionContext, message: SubscribeMessage) => void | Promise<void>;

  /**
   * Operation callback - called for each subscription operation
   */
  onOperation?: (
    ctx: SubscriptionContext,
    message: SubscribeMessage,
    args: ExecutionArgs
  ) => ExecutionArgs | Promise<ExecutionArgs>;

  /**
   * Complete callback - called when a subscription completes
   */
  onComplete?: (ctx: SubscriptionContext, message: CompleteMessage) => void | Promise<void>;
}

/**
 * Subscription context
 */
export interface SubscriptionContext {
  /**
   * The WebSocket connection
   */
  socket: WebSocket;

  /**
   * Connection parameters from client
   */
  connectionParams: Record<string, unknown> | undefined;

  /**
   * Extra data attached to the connection
   */
  extra?: Record<string, unknown>;

  /**
   * Request object (if available)
   */
  request: Request | undefined;
}

/**
 * Subscribe message
 */
export interface SubscribeMessage {
  id: string;
  type: 'subscribe';
  payload: {
    query: string;
    variables?: Record<string, unknown>;
    operationName?: string;
    extensions?: Record<string, unknown>;
  };
}

/**
 * Complete message
 */
export interface CompleteMessage {
  id: string;
  type: 'complete';
}

/**
 * Execution args for GraphQL
 */
export interface ExecutionArgs {
  schema: unknown;
  document: unknown;
  rootValue?: unknown;
  contextValue?: unknown;
  variableValues?: Record<string, unknown>;
  operationName?: string;
}

/**
 * Subscription manager
 *
 * Manages WebSocket connections and GraphQL subscriptions.
 */
@Injectable()
export class SubscriptionManager implements OnModuleInit, OnModuleDestroy {
  private connections = new Map<WebSocket, ConnectionState>();
  private config: SubscriptionConfig;

  constructor(
    @Inject(LEAVEN_MODULE_OPTIONS) private readonly options: LeavenModuleOptions,
    @Inject(LEAVEN_DRIVER) private readonly driver: LeavenDriver
  ) {
    this.config = this.normalizeConfig();
  }

  /**
   * Initialize subscription manager
   */
  public async onModuleInit(): Promise<void> {
    // Initialization logic
  }

  /**
   * Cleanup on module destroy
   */
  public async onModuleDestroy(): Promise<void> {
    // Close all connections
    for (const [socket] of this.connections) {
      socket.close(1000, 'Server shutdown');
    }
    this.connections.clear();
  }

  /**
   * Normalize subscription configuration
   */
  private normalizeConfig(): SubscriptionConfig {
    return {
      path: this.options.path ?? '/graphql',
      keepAlive: 12000,
      connectionInitWaitTimeout: 3000,
      maxSubscriptionsPerConnection: 100,
    };
  }

  /**
   * Handle new WebSocket connection
   */
  public async handleConnection(socket: WebSocket, request?: Request): Promise<void> {
    const state: ConnectionState = {
      socket,
      request: request,
      subscriptions: new Map(),
      initialized: false,
      connectionParams: undefined,
      context: undefined,
      keepAliveInterval: undefined,
    };

    this.connections.set(socket, state);

    socket.addEventListener('message', (event) => {
      this.handleMessage(socket, event.data as string);
    });

    socket.addEventListener('close', () => {
      this.handleClose(socket);
    });

    socket.addEventListener('error', (error) => {
      this.handleError(socket, error);
    });

    // Set connection init timeout
    setTimeout(() => {
      if (!state.initialized) {
        socket.close(4408, 'Connection initialization timeout');
      }
    }, this.config.connectionInitWaitTimeout);
  }

  /**
   * Handle incoming WebSocket message
   */
  private async handleMessage(socket: WebSocket, data: string): Promise<void> {
    const state = this.connections.get(socket);
    if (!state) return;

    try {
      const message = JSON.parse(data) as GraphQLWSMessage;

      switch (message.type) {
        case 'connection_init':
          await this.handleConnectionInit(socket, state, message);
          break;
        case 'ping':
          this.send(socket, { type: 'pong' });
          break;
        case 'pong':
          // Client responded to keep-alive
          break;
        case 'subscribe':
          await this.handleSubscribe(socket, state, message as SubscribeMessage);
          break;
        case 'complete':
          await this.handleComplete(socket, state, message as CompleteMessage);
          break;
        default:
          // Unknown message type
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  /**
   * Handle connection initialization
   */
  private async handleConnectionInit(
    socket: WebSocket,
    state: ConnectionState,
    message: { type: 'connection_init'; payload?: Record<string, unknown> }
  ): Promise<void> {
    if (state.initialized) {
      socket.close(4429, 'Too many initialization requests');
      return;
    }

    state.connectionParams = message.payload ?? {};

    const ctx: SubscriptionContext = {
      socket,
      connectionParams: message.payload ?? {},
      request: state.request,
    };

    // Call onConnect callback if provided
    if (this.config.onConnect) {
      const allowed = await this.config.onConnect(ctx);
      if (!allowed) {
        socket.close(4401, 'Unauthorized');
        return;
      }
    }

    state.initialized = true;
    state.context = ctx;

    this.send(socket, { type: 'connection_ack' });

    // Start keep-alive
    if (this.config.keepAlive) {
      state.keepAliveInterval = setInterval(() => {
        this.send(socket, { type: 'ping' });
      }, this.config.keepAlive);
    }
  }

  /**
   * Handle subscribe message
   */
  private async handleSubscribe(
    socket: WebSocket,
    state: ConnectionState,
    message: SubscribeMessage
  ): Promise<void> {
    if (!state.initialized) {
      socket.close(4401, 'Unauthorized');
      return;
    }

    // Check subscription limit
    if (state.subscriptions.size >= (this.config.maxSubscriptionsPerConnection ?? 100)) {
      this.sendError(socket, message.id, 'Too many subscriptions');
      return;
    }

    // Call onSubscribe callback
    if (this.config.onSubscribe && state.context) {
      await this.config.onSubscribe(state.context, message);
    }

    // Execute the subscription
    try {
      const schema = this.driver.getSchema();
      if (!schema) {
        this.sendError(socket, message.id, 'Schema not available');
        return;
      }

      // Create context for the subscription
      let context: GqlContext = {
        req: state.request as unknown as Request,
        res: {} as Response,
        ...state.connectionParams,
      };

      if (this.config.context && state.context) {
        context = await this.config.context(state.context);
      }

      // Execute the subscription query
      const result = await this.driver.execute(
        message.payload.query,
        message.payload.variables,
        context,
        message.payload.operationName
      );

      // For regular queries/mutations, send result and complete
      if (result.data || result.errors) {
        this.send(socket, {
          id: message.id,
          type: 'next',
          payload: result,
        });
        this.send(socket, { id: message.id, type: 'complete' });
        return;
      }

      // For actual subscriptions, we'd need AsyncIterator support
      // This would integrate with @leaven-graphql/ws PubSub
      state.subscriptions.set(message.id, {
        message,
        context,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Subscription failed';
      this.sendError(socket, message.id, errorMessage);
    }
  }

  /**
   * Handle complete message
   */
  private async handleComplete(
    socket: WebSocket,
    state: ConnectionState,
    message: CompleteMessage
  ): Promise<void> {
    const subscription = state.subscriptions.get(message.id);
    if (subscription) {
      state.subscriptions.delete(message.id);

      if (this.config.onComplete && state.context) {
        await this.config.onComplete(state.context, message);
      }
    }
  }

/**
   * Handle WebSocket close
   */
  private async handleClose(ws: WebSocket): Promise<void> {
    const state = this.connections.get(ws);
    if (!state) return;

    // Clear keep-alive interval
    if (state.keepAliveInterval) {
      clearInterval(state.keepAliveInterval);
    }

    // Call onDisconnect callback
    if (this.config.onDisconnect && state.context) {
      await this.config.onDisconnect(state.context);
    }

    // Cleanup subscriptions
    state.subscriptions.clear();
    this.connections.delete(ws);
  }

  /**
   * Handle WebSocket error
   */
  private handleError(ws: WebSocket, _error: Event): void {
    const state = this.connections.get(ws);
    if (state) {
      this.handleClose(ws);
    }
  }

  /**
   * Send message to client
   */
  private send(socket: WebSocket, message: GraphQLWSMessage): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  /**
   * Send error to client
   */
  private sendError(socket: WebSocket, id: string, message: string): void {
    this.send(socket, {
      id,
      type: 'error',
      payload: [{ message }],
    });
  }

  /**
   * Publish to subscription
   */
  public publish(id: string, payload: unknown): void {
    for (const [socket, state] of this.connections) {
      const subscription = state.subscriptions.get(id);
      if (subscription) {
        this.send(socket, {
          id,
          type: 'next',
          payload: { data: payload },
        });
      }
    }
  }

  /**
   * Get connection count
   */
  public getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Get total subscription count
   */
  public getSubscriptionCount(): number {
    let count = 0;
    for (const [_, state] of this.connections) {
      count += state.subscriptions.size;
    }
    return count;
  }
}

/**
 * Connection state
 */
interface ConnectionState {
  socket: WebSocket;
  request: Request | undefined;
  subscriptions: Map<string, SubscriptionState>;
  initialized: boolean;
  connectionParams: Record<string, unknown> | undefined;
  context: SubscriptionContext | undefined;
  keepAliveInterval: ReturnType<typeof setInterval> | undefined;
}

/**
 * Subscription state
 */
interface SubscriptionState {
  message: SubscribeMessage;
  context: GqlContext;
}

/**
 * GraphQL WS protocol messages
 */
type GraphQLWSMessage =
  | { type: 'connection_init'; payload?: Record<string, unknown> }
  | { type: 'connection_ack' }
  | { type: 'ping' }
  | { type: 'pong' }
  | { type: 'subscribe'; id: string; payload: SubscribeMessage['payload'] }
  | { type: 'next'; id: string; payload: unknown }
  | { type: 'error'; id: string; payload: unknown[] }
  | { type: 'complete'; id?: string };

/**
 * Create a subscription decorator for NestJS resolvers
 */
export function Subscription(
  returns: () => unknown,
  options?: { filter?: (payload: unknown, variables: unknown, context: unknown) => boolean }
): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    if (descriptor.value) {
      Reflect.defineMetadata('leaven:subscription', { returns, options }, descriptor.value);
    }
    return descriptor;
  };
}

/**
 * PubSub decorator for injecting PubSub instance
 */
export function InjectPubSub(): ParameterDecorator {
  return (_target, propertyKey, parameterIndex) => {
    if (_target && propertyKey !== undefined) {
      const existingParams: number[] =
        Reflect.getMetadata('leaven:inject:pubsub', _target, propertyKey as string) || [];
      existingParams.push(parameterIndex);
      Reflect.defineMetadata('leaven:inject:pubsub', existingParams, _target, propertyKey as string);
    }
  };
}
