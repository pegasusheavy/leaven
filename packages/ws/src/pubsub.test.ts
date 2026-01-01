/**
 * @leaven-graphql/ws - PubSub tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { PubSub, createPubSub } from './pubsub';

describe('PubSub', () => {
  let pubsub: PubSub;

  beforeEach(() => {
    pubsub = new PubSub();
  });

  describe('subscribe', () => {
    test('should subscribe to a topic', () => {
      const messages: string[] = [];
      const unsubscribe = pubsub.subscribe<string>('test', (msg) => {
        messages.push(msg);
      });

      expect(typeof unsubscribe).toBe('function');
      expect(pubsub.getSubscriberCount('test')).toBe(1);
    });

    test('should receive published messages', () => {
      const messages: string[] = [];
      pubsub.subscribe<string>('test', (msg) => {
        messages.push(msg);
      });

      pubsub.publish('test', 'Hello');
      pubsub.publish('test', 'World');

      expect(messages).toEqual(['Hello', 'World']);
    });

    test('should unsubscribe correctly', () => {
      const messages: string[] = [];
      const unsubscribe = pubsub.subscribe<string>('test', (msg) => {
        messages.push(msg);
      });

      pubsub.publish('test', 'Before');
      unsubscribe();
      pubsub.publish('test', 'After');

      expect(messages).toEqual(['Before']);
      expect(pubsub.getSubscriberCount('test')).toBe(0);
    });

    test('should support multiple subscribers', () => {
      const messages1: string[] = [];
      const messages2: string[] = [];

      pubsub.subscribe<string>('test', (msg) => messages1.push(msg));
      pubsub.subscribe<string>('test', (msg) => messages2.push(msg));

      pubsub.publish('test', 'Hello');

      expect(messages1).toEqual(['Hello']);
      expect(messages2).toEqual(['Hello']);
      expect(pubsub.getSubscriberCount('test')).toBe(2);
    });

    test('should throw when max subscribers reached', () => {
      const limitedPubsub = new PubSub({ maxSubscribersPerTopic: 2 });

      limitedPubsub.subscribe('test', () => {});
      limitedPubsub.subscribe('test', () => {});

      expect(() => limitedPubsub.subscribe('test', () => {})).toThrow(
        /Maximum subscribers reached/
      );
    });
  });

  describe('publish', () => {
    test('should publish to all subscribers', () => {
      const received: number[] = [];

      pubsub.subscribe('counter', (n: number) => received.push(n));
      pubsub.subscribe('counter', (n: number) => received.push(n * 2));

      pubsub.publish('counter', 5);

      expect(received).toEqual([5, 10]);
    });

    test('should handle no subscribers', () => {
      // Should not throw
      pubsub.publish('empty', 'message');
    });

    test('should continue on subscriber error', () => {
      const received: string[] = [];

      pubsub.subscribe('test', () => {
        throw new Error('Subscriber error');
      });
      pubsub.subscribe('test', (msg: string) => received.push(msg));

      pubsub.publish('test', 'Hello');

      expect(received).toEqual(['Hello']);
    });
  });

  describe('wildcards', () => {
    test('should match wildcard patterns when enabled', () => {
      const wildcardPubsub = new PubSub({ wildcards: true });
      const received: string[] = [];

      wildcardPubsub.subscribe('events.*', (msg: string) => received.push(msg));

      wildcardPubsub.publish('events.user', 'User event');
      wildcardPubsub.publish('events.system', 'System event');

      expect(received).toContain('User event');
    });

    test('should match # for multiple levels', () => {
      const wildcardPubsub = new PubSub({ wildcards: true });
      const received: string[] = [];

      wildcardPubsub.subscribe('#', (msg: string) => received.push(msg));

      wildcardPubsub.publish('any.topic.here', 'Message');

      expect(received).toContain('Message');
    });
  });

  describe('asyncIterator', () => {
    test('should create async iterator for topic', async () => {
      const iterator = pubsub.asyncIterator<string>('test');

      // Publish a message
      setTimeout(() => {
        pubsub.publish('test', 'Hello');
      }, 10);

      const result = await iterator.next();

      expect(result.value).toBe('Hello');
      expect(result.done).toBe(false);

      // Clean up
      await iterator.return?.();
    });

    test('should support multiple topics', async () => {
      const iterator = pubsub.asyncIterator<string>(['topic1', 'topic2']);

      setTimeout(() => {
        pubsub.publish('topic2', 'From topic2');
      }, 10);

      const result = await iterator.next();

      expect(result.value).toBe('From topic2');

      await iterator.return?.();
    });

    test('should handle return', async () => {
      const iterator = pubsub.asyncIterator<string>('test');

      const returnResult = await iterator.return?.();

      expect(returnResult?.done).toBe(true);
    });

    test('should handle throw', async () => {
      const iterator = pubsub.asyncIterator<string>('test');

      await expect(iterator.throw?.(new Error('Test'))).rejects.toThrow('Test');
    });
  });

  describe('getSubscriberCount', () => {
    test('should return correct subscriber count', () => {
      expect(pubsub.getSubscriberCount('test')).toBe(0);

      pubsub.subscribe('test', () => {});
      expect(pubsub.getSubscriberCount('test')).toBe(1);

      pubsub.subscribe('test', () => {});
      expect(pubsub.getSubscriberCount('test')).toBe(2);
    });
  });

  describe('getTopics', () => {
    test('should return all topics with subscribers', () => {
      pubsub.subscribe('topic1', () => {});
      pubsub.subscribe('topic2', () => {});
      pubsub.subscribe('topic3', () => {});

      const topics = pubsub.getTopics();

      expect(topics).toContain('topic1');
      expect(topics).toContain('topic2');
      expect(topics).toContain('topic3');
    });
  });

  describe('clear', () => {
    test('should clear all subscriptions', () => {
      pubsub.subscribe('topic1', () => {});
      pubsub.subscribe('topic2', () => {});

      pubsub.clear();

      expect(pubsub.getTopics().length).toBe(0);
    });
  });
});

describe('createPubSub', () => {
  test('should create a PubSub instance', () => {
    const pubsub = createPubSub();
    expect(pubsub).toBeInstanceOf(PubSub);
  });

  test('should accept config', () => {
    const pubsub = createPubSub({ maxSubscribersPerTopic: 5 });
    expect(pubsub).toBeInstanceOf(PubSub);
  });
});
