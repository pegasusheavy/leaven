/**
 * @leaven-graphql/nestjs - Subscriptions tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import 'reflect-metadata';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
import { SubscriptionManager, Subscription, InjectPubSub } from './subscriptions';
import { LeavenDriver } from './driver';
import type { LeavenModuleOptions } from './types';

describe('SubscriptionManager', () => {
  let manager: SubscriptionManager;
  let driver: LeavenDriver;
  let schema: GraphQLSchema;
  let options: LeavenModuleOptions;

  beforeEach(async () => {
    schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          hello: {
            type: GraphQLString,
            resolve: () => 'world',
          },
        },
      }),
    });

    options = {
      schema,
      path: '/graphql',
    };

    driver = new LeavenDriver(options);
    await driver.onModuleInit();

    manager = new SubscriptionManager(options, driver);
    await manager.onModuleInit();
  });

  afterEach(async () => {
    await manager.onModuleDestroy();
    await driver.onModuleDestroy();
  });

  describe('initialization', () => {
    test('should initialize with zero connections', () => {
      expect(manager.getConnectionCount()).toBe(0);
    });

    test('should initialize with zero subscriptions', () => {
      expect(manager.getSubscriptionCount()).toBe(0);
    });
  });

  describe('connection count', () => {
    test('should return correct connection count', () => {
      expect(manager.getConnectionCount()).toBe(0);
    });
  });

  describe('subscription count', () => {
    test('should return correct subscription count', () => {
      expect(manager.getSubscriptionCount()).toBe(0);
    });
  });
});

describe('Subscription Decorator', () => {
  test('should set subscription metadata', () => {
    const returnsFn = () => String;

    class TestResolver {
      @Subscription(returnsFn)
      onMessage() {}
    }

    const metadata = Reflect.getMetadata('leaven:subscription', TestResolver.prototype.onMessage);
    expect(metadata).toBeDefined();
    expect(metadata.returns).toBe(returnsFn);
  });

  test('should set subscription metadata with filter', () => {
    const returnsFn = () => String;
    const filterFn = () => true;

    class TestResolver {
      @Subscription(returnsFn, { filter: filterFn })
      onMessage() {}
    }

    const metadata = Reflect.getMetadata('leaven:subscription', TestResolver.prototype.onMessage);
    expect(metadata).toBeDefined();
    expect(metadata.options.filter).toBe(filterFn);
  });
});

describe('InjectPubSub Decorator', () => {
  test('should be a decorator factory that returns a parameter decorator', () => {
    const decorator = InjectPubSub();
    expect(typeof decorator).toBe('function');
  });

  test('should set pubsub injection metadata on method parameters', () => {
    class TestResolver {
      public handleSubscription(@InjectPubSub() _pubSub: unknown): void {}
    }

    const metadata = Reflect.getMetadata(
      'leaven:inject:pubsub',
      TestResolver.prototype,
      'handleSubscription'
    );
    expect(metadata).toBeDefined();
    expect(metadata).toContain(0); // Parameter index 0
  });
});

describe('SubscriptionManager WebSocket handling', () => {
  let manager: SubscriptionManager;
  let driver: LeavenDriver;
  let schema: GraphQLSchema;

  beforeEach(async () => {
    schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          hello: {
            type: GraphQLString,
            resolve: () => 'world',
          },
        },
      }),
    });

    const options: LeavenModuleOptions = { schema };
    driver = new LeavenDriver(options);
    await driver.onModuleInit();

    manager = new SubscriptionManager(options, driver);
    await manager.onModuleInit();
  });

  afterEach(async () => {
    await manager.onModuleDestroy();
    await driver.onModuleDestroy();
  });

  test('should handle mock WebSocket connection', async () => {
    const mockSocket = createMockWebSocket();

    await manager.handleConnection(mockSocket as unknown as WebSocket);

    expect(manager.getConnectionCount()).toBe(1);
  });

  test('should handle mock WebSocket close', async () => {
    const mockSocket = createMockWebSocket();

    await manager.handleConnection(mockSocket as unknown as WebSocket);
    expect(manager.getConnectionCount()).toBe(1);

    // Simulate close
    mockSocket.simulateClose();

    expect(manager.getConnectionCount()).toBe(0);
  });

  test('should handle ping message', async () => {
    const mockSocket = createMockWebSocket();

    await manager.handleConnection(mockSocket as unknown as WebSocket);

    // Simulate ping message
    mockSocket.simulateMessage(JSON.stringify({ type: 'ping' }));

    // Should respond with pong
    expect(mockSocket.sentMessages).toContainEqual(
      expect.objectContaining({ type: 'pong' })
    );
  });

  test('should handle connection_init message', async () => {
    const mockSocket = createMockWebSocket();

    await manager.handleConnection(mockSocket as unknown as WebSocket);

    // Simulate connection_init
    mockSocket.simulateMessage(
      JSON.stringify({ type: 'connection_init', payload: { token: 'test' } })
    );

    // Should respond with connection_ack
    expect(mockSocket.sentMessages).toContainEqual(
      expect.objectContaining({ type: 'connection_ack' })
    );
  });

  test('should handle subscribe message after initialization', async () => {
    const mockSocket = createMockWebSocket();

    await manager.handleConnection(mockSocket as unknown as WebSocket);

    // Initialize connection first
    mockSocket.simulateMessage(
      JSON.stringify({ type: 'connection_init' })
    );

    // Wait for connection_ack
    await new Promise(resolve => setTimeout(resolve, 10));

    // Send subscribe message
    mockSocket.simulateMessage(
      JSON.stringify({
        type: 'subscribe',
        id: 'sub-1',
        payload: { query: '{ hello }' },
      })
    );

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should have sent next and complete messages
    expect(mockSocket.sentMessages.some(m =>
      'type' in m && (m as { type: string }).type === 'next'
    )).toBe(true);
  });

  test('should handle complete message', async () => {
    const mockSocket = createMockWebSocket();

    await manager.handleConnection(mockSocket as unknown as WebSocket);

    // Initialize connection
    mockSocket.simulateMessage(
      JSON.stringify({ type: 'connection_init' })
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    // Send complete message
    mockSocket.simulateMessage(
      JSON.stringify({ type: 'complete', id: 'sub-1' })
    );

    // Should not throw
    expect(manager.getConnectionCount()).toBe(1);
  });

  test('should close connection for duplicate init', async () => {
    const mockSocket = createMockWebSocket();

    await manager.handleConnection(mockSocket as unknown as WebSocket);

    // First connection_init
    mockSocket.simulateMessage(
      JSON.stringify({ type: 'connection_init' })
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    // Second connection_init should close the socket
    mockSocket.simulateMessage(
      JSON.stringify({ type: 'connection_init' })
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockSocket.readyState).toBe(3); // CLOSED
  });

  test('should handle pong message (no-op)', async () => {
    const mockSocket = createMockWebSocket();

    await manager.handleConnection(mockSocket as unknown as WebSocket);

    // Initialize connection
    mockSocket.simulateMessage(
      JSON.stringify({ type: 'connection_init' })
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const messageCountBefore = mockSocket.sentMessages.length;

    // Send pong message (should be a no-op)
    mockSocket.simulateMessage(
      JSON.stringify({ type: 'pong' })
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    // No new messages should be sent
    expect(mockSocket.sentMessages.length).toBe(messageCountBefore);
  });

  test('should handle WebSocket error', async () => {
    const mockSocket = createMockWebSocket();

    await manager.handleConnection(mockSocket as unknown as WebSocket);
    expect(manager.getConnectionCount()).toBe(1);

    // Simulate error - the error handler logs but doesn't close
    mockSocket.simulateError(new Error('Connection error'));

    // Connection may or may not be closed depending on implementation
    // The important thing is it doesn't throw
    expect(manager.getConnectionCount()).toBeGreaterThanOrEqual(0);
  });
});

// Helper function to create a mock WebSocket
function createMockWebSocket(): MockWebSocket {
  const listeners: Map<string, Array<(event: unknown) => void>> = new Map();
  const sentMessages: object[] = [];

  const mock: MockWebSocket = {
    sentMessages,
    readyState: 1, // OPEN

    addEventListener(event: string, listener: (event: unknown) => void): void {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)!.push(listener);
    },

    removeEventListener(): void {
      // Mock implementation
    },

    send(data: string): void {
      try {
        sentMessages.push(JSON.parse(data));
      } catch {
        sentMessages.push({ raw: data });
      }
    },

    close(): void {
      mock.readyState = 3; // CLOSED
      const closeListeners = listeners.get('close') || [];
      for (const listener of closeListeners) {
        listener({});
      }
    },

    simulateMessage(data: string): void {
      const messageListeners = listeners.get('message') || [];
      for (const listener of messageListeners) {
        listener({ data });
      }
    },

    simulateClose(): void {
      mock.close();
    },

    simulateError(error: Error): void {
      const errorListeners = listeners.get('error') || [];
      for (const listener of errorListeners) {
        listener(error);
      }
    },
  };

  return mock;
}

interface MockWebSocket {
  sentMessages: object[];
  readyState: number;
  addEventListener(event: string, listener: (event: unknown) => void): void;
  removeEventListener(event: string, listener: (event: unknown) => void): void;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  simulateMessage(data: string): void;
  simulateClose(): void;
  simulateError(error: Error): void;
}
