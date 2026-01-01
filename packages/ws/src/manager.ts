/**
 * @leaven-graphql/ws - Subscription manager
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { GraphQLSchema } from 'graphql';
import { LeavenExecutor, type GraphQLRequest, type GraphQLResponse } from '@leaven-graphql/core';

/**
 * Subscription status
 */
export type SubscriptionStatus = 'pending' | 'active' | 'completed' | 'error';

/**
 * Active subscription
 */
export interface Subscription {
  /** Unique subscription ID */
  id: string;
  /** Connection ID */
  connectionId: string;
  /** The original request */
  request: GraphQLRequest;
  /** Subscription status */
  status: SubscriptionStatus;
  /** When the subscription was created */
  createdAt: number;
  /** Async iterator */
  iterator?: AsyncIterableIterator<GraphQLResponse>;
  /** Cleanup function */
  cleanup?: () => void;
}

/**
 * Subscription manager configuration
 */
export interface SubscriptionManagerConfig {
  /** GraphQL schema */
  schema: GraphQLSchema;
  /** Maximum subscriptions per connection */
  maxSubscriptionsPerConnection?: number;
  /** Subscription timeout in milliseconds */
  subscriptionTimeout?: number;
}

/**
 * Manages GraphQL subscriptions
 */
export class SubscriptionManager {
  private readonly executor: LeavenExecutor;
  private readonly subscriptions: Map<string, Subscription>;
  private readonly connectionSubscriptions: Map<string, Set<string>>;
  private readonly maxSubscriptionsPerConnection: number;
  private readonly subscriptionTimeout: number;

  constructor(config: SubscriptionManagerConfig) {
    this.executor = new LeavenExecutor({ schema: config.schema });
    this.subscriptions = new Map();
    this.connectionSubscriptions = new Map();
    this.maxSubscriptionsPerConnection = config.maxSubscriptionsPerConnection ?? 100;
    this.subscriptionTimeout = config.subscriptionTimeout ?? 0;
  }

  /**
   * Create a new subscription
   */
  public async subscribe<TContext = unknown>(
    connectionId: string,
    subscriptionId: string,
    request: GraphQLRequest,
    context: TContext,
    onNext: (result: GraphQLResponse) => void,
    onComplete: () => void,
    onError: (errors: readonly { message: string }[]) => void
  ): Promise<Subscription> {
    // Check subscription limit
    const connectionSubs = this.connectionSubscriptions.get(connectionId);
    if (connectionSubs && connectionSubs.size >= this.maxSubscriptionsPerConnection) {
      throw new Error('Maximum subscriptions per connection reached');
    }

    // Create subscription entry
    const subscription: Subscription = {
      id: subscriptionId,
      connectionId,
      request,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Track connection subscriptions
    if (!this.connectionSubscriptions.has(connectionId)) {
      this.connectionSubscriptions.set(connectionId, new Set());
    }
    this.connectionSubscriptions.get(connectionId)!.add(subscriptionId);

    try {
      // Execute the subscription
      const result = await this.executor.subscribe(request, context);

      // Check if it's an error result
      if ('errors' in result && !Symbol.asyncIterator) {
        subscription.status = 'error';
        const errors = (result as GraphQLResponse).errors ?? [{ message: 'Subscription failed' }];
        onError(errors);
        this.unsubscribe(subscriptionId);
        return subscription;
      }

      // It's an async iterator
      const iterator = result as AsyncIterableIterator<GraphQLResponse>;
      subscription.iterator = iterator;
      subscription.status = 'active';

      // Set up timeout if configured
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      if (this.subscriptionTimeout > 0) {
        timeoutId = setTimeout(() => {
          this.unsubscribe(subscriptionId);
        }, this.subscriptionTimeout);
      }

      subscription.cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };

      // Start consuming the iterator
      this.consumeIterator(subscriptionId, iterator, onNext, onComplete, onError);

      return subscription;
    } catch (error) {
      subscription.status = 'error';
      const message = error instanceof Error ? error.message : 'Subscription failed';
      onError([{ message }]);
      this.unsubscribe(subscriptionId);
      return subscription;
    }
  }

  /**
   * Consume an async iterator and call callbacks
   */
  private async consumeIterator(
    subscriptionId: string,
    iterator: AsyncIterableIterator<GraphQLResponse>,
    onNext: (result: GraphQLResponse) => void,
    onComplete: () => void,
    onError: (errors: readonly { message: string }[]) => void
  ): Promise<void> {
    try {
      for await (const result of iterator) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription || subscription.status !== 'active') {
          break;
        }

        onNext(result);
      }

      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        subscription.status = 'completed';
        onComplete();
        this.unsubscribe(subscriptionId);
      }
    } catch (error) {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        subscription.status = 'error';
        const message = error instanceof Error ? error.message : 'Subscription error';
        onError([{ message }]);
        this.unsubscribe(subscriptionId);
      }
    }
  }

  /**
   * Unsubscribe from a subscription
   */
  public unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    // Clean up
    subscription.cleanup?.();

    // Close the iterator
    if (subscription.iterator?.return) {
      subscription.iterator.return().catch(() => {});
    }

    // Remove from maps
    this.subscriptions.delete(subscriptionId);

    const connectionSubs = this.connectionSubscriptions.get(subscription.connectionId);
    if (connectionSubs) {
      connectionSubs.delete(subscriptionId);
      if (connectionSubs.size === 0) {
        this.connectionSubscriptions.delete(subscription.connectionId);
      }
    }

    return true;
  }

  /**
   * Unsubscribe all subscriptions for a connection
   */
  public unsubscribeConnection(connectionId: string): number {
    const connectionSubs = this.connectionSubscriptions.get(connectionId);
    if (!connectionSubs) {
      return 0;
    }

    let count = 0;
    for (const subscriptionId of connectionSubs) {
      if (this.unsubscribe(subscriptionId)) {
        count++;
      }
    }

    return count;
  }

  /**
   * Get a subscription by ID
   */
  public getSubscription(subscriptionId: string): Subscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  /**
   * Get all subscriptions for a connection
   */
  public getConnectionSubscriptions(connectionId: string): Subscription[] {
    const subscriptionIds = this.connectionSubscriptions.get(connectionId);
    if (!subscriptionIds) {
      return [];
    }

    const subscriptions: Subscription[] = [];
    for (const id of subscriptionIds) {
      const sub = this.subscriptions.get(id);
      if (sub) {
        subscriptions.push(sub);
      }
    }

    return subscriptions;
  }

  /**
   * Get the total number of active subscriptions
   */
  public get subscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get the number of active connections
   */
  public get connectionCount(): number {
    return this.connectionSubscriptions.size;
  }

  /**
   * Clear all subscriptions
   */
  public clear(): void {
    for (const subscriptionId of this.subscriptions.keys()) {
      this.unsubscribe(subscriptionId);
    }
  }
}

/**
 * Create a new subscription manager
 */
export function createSubscriptionManager(
  config: SubscriptionManagerConfig
): SubscriptionManager {
  return new SubscriptionManager(config);
}
