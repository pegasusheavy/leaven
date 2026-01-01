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
