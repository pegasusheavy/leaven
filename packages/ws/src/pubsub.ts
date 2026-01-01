/**
 * @leaven-graphql/ws - PubSub implementation
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Subscribe function type
 */
export type SubscribeFn<T = unknown> = (
  topic: string,
  callback: (payload: T) => void
) => () => void;

/**
 * Publish function type
 */
export type PublishFn<T = unknown> = (topic: string, payload: T) => void;

/**
 * PubSub engine interface
 */
export interface PubSubEngine {
  subscribe: SubscribeFn;
  publish: PublishFn;
}

/**
 * PubSub configuration
 */
export interface PubSubConfig {
  /** Maximum subscribers per topic */
  maxSubscribersPerTopic?: number;
  /** Enable topic wildcards */
  wildcards?: boolean;
}

/**
 * Subscriber entry
 */
interface Subscriber<T = unknown> {
  id: string;
  callback: (payload: T) => void;
}

/**
 * In-memory PubSub implementation
 */
export class PubSub implements PubSubEngine {
  private readonly subscribers: Map<string, Set<Subscriber>>;
  private readonly maxSubscribersPerTopic: number;
  private readonly wildcards: boolean;
  private nextId: number;

  constructor(config: PubSubConfig = {}) {
    this.subscribers = new Map();
    this.maxSubscribersPerTopic = config.maxSubscribersPerTopic ?? 10000;
    this.wildcards = config.wildcards ?? false;
    this.nextId = 0;
  }

  /**
   * Subscribe to a topic
   */
  public subscribe<T = unknown>(
    topic: string,
    callback: (payload: T) => void
  ): () => void {
    let topicSubscribers = this.subscribers.get(topic);

    if (!topicSubscribers) {
      topicSubscribers = new Set();
      this.subscribers.set(topic, topicSubscribers);
    }

    if (topicSubscribers.size >= this.maxSubscribersPerTopic) {
      throw new Error(`Maximum subscribers reached for topic: ${topic}`);
    }

    const subscriber: Subscriber<T> = {
      id: String(this.nextId++),
      callback,
    };

    topicSubscribers.add(subscriber as Subscriber);

    // Return unsubscribe function
    return () => {
      topicSubscribers!.delete(subscriber as Subscriber);
      if (topicSubscribers!.size === 0) {
        this.subscribers.delete(topic);
      }
    };
  }

  /**
   * Publish to a topic
   */
  public publish<T = unknown>(topic: string, payload: T): void {
    const topicSubscribers = this.subscribers.get(topic);

    if (topicSubscribers) {
      for (const subscriber of topicSubscribers) {
        try {
          subscriber.callback(payload);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      }
    }

    // Handle wildcards if enabled
    if (this.wildcards) {
      this.publishToWildcards(topic, payload);
    }
  }

  /**
   * Publish to wildcard subscribers
   */
  private publishToWildcards<T>(topic: string, payload: T): void {
    const parts = topic.split('.');

    for (const [subscriberTopic, subscribers] of this.subscribers) {
      if (this.matchesWildcard(subscriberTopic, parts)) {
        for (const subscriber of subscribers) {
          try {
            subscriber.callback(payload);
          } catch (error) {
            console.error('Error in wildcard subscriber callback:', error);
          }
        }
      }
    }
  }

  /**
   * Check if a topic pattern matches
   */
  private matchesWildcard(pattern: string, topicParts: string[]): boolean {
    if (pattern === '*' || pattern === '#') {
      return true;
    }

    const patternParts = pattern.split('.');

    for (let i = 0; i < patternParts.length; i++) {
      const part = patternParts[i];

      if (part === '#') {
        return true;
      }

      if (part === '*') {
        continue;
      }

      if (topicParts[i] !== part) {
        return false;
      }
    }

    return patternParts.length === topicParts.length;
  }

  /**
   * Create an async iterator for a topic
   */
  public asyncIterator<T = unknown>(
    topic: string | string[]
  ): AsyncIterableIterator<T> {
    const topics = Array.isArray(topic) ? topic : [topic];
    const pullQueue: Array<(value: IteratorResult<T>) => void> = [];
    const pushQueue: T[] = [];
    let done = false;

    const unsubscribes: Array<() => void> = [];

    const pushValue = (payload: T): void => {
      if (done) return;

      if (pullQueue.length > 0) {
        const resolve = pullQueue.shift()!;
        resolve({ value: payload, done: false });
      } else {
        pushQueue.push(payload);
      }
    };

    // Subscribe to all topics
    for (const t of topics) {
      unsubscribes.push(this.subscribe(t, pushValue));
    }

    return {
      [Symbol.asyncIterator]() {
        return this;
      },

      async next(): Promise<IteratorResult<T>> {
        if (done) {
          return { value: undefined, done: true };
        }

        if (pushQueue.length > 0) {
          return { value: pushQueue.shift()!, done: false };
        }

        return new Promise((resolve) => {
          pullQueue.push(resolve);
        });
      },

      async return(): Promise<IteratorResult<T>> {
        done = true;
        for (const unsubscribe of unsubscribes) {
          unsubscribe();
        }
        pullQueue.forEach((resolve) => resolve({ value: undefined, done: true }));
        return { value: undefined, done: true };
      },

      async throw(error: unknown): Promise<IteratorResult<T>> {
        done = true;
        for (const unsubscribe of unsubscribes) {
          unsubscribe();
        }
        throw error;
      },
    };
  }

  /**
   * Get the number of subscribers for a topic
   */
  public getSubscriberCount(topic: string): number {
    return this.subscribers.get(topic)?.size ?? 0;
  }

  /**
   * Get all topics with subscribers
   */
  public getTopics(): string[] {
    return Array.from(this.subscribers.keys());
  }

  /**
   * Clear all subscriptions
   */
  public clear(): void {
    this.subscribers.clear();
  }
}

/**
 * Create a new PubSub instance
 */
export function createPubSub(config?: PubSubConfig): PubSub {
  return new PubSub(config);
}
