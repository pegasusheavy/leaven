/**
 * @leaven-graphql/nestjs - Decorators tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import 'reflect-metadata';
import {
  COMPLEXITY_KEY,
  DEPRECATED_KEY,
  DESCRIPTION_KEY,
  CACHE_KEY,
  SUBSCRIPTION_FILTER_KEY,
  Complexity,
  Deprecated,
  Description,
  CacheHint,
  SubscriptionFilter,
  createContextDecorator,
} from './decorators';

describe('Decorators', () => {
  describe('Complexity', () => {
    test('should set complexity metadata with number', () => {
      class TestClass {
        @Complexity(10)
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(COMPLEXITY_KEY, TestClass.prototype.testMethod);
      expect(metadata).toBe(10);
    });

    test('should set complexity metadata with function', () => {
      const estimator = ({ childComplexity }: { childComplexity: number }) =>
        childComplexity * 2;

      class TestClass {
        @Complexity(estimator)
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(COMPLEXITY_KEY, TestClass.prototype.testMethod);
      expect(metadata).toBe(estimator);
      expect(metadata({ childComplexity: 5 })).toBe(10);
    });
  });

  describe('Deprecated', () => {
    test('should set deprecated metadata', () => {
      class TestClass {
        @Deprecated('Use newMethod instead')
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(DEPRECATED_KEY, TestClass.prototype.testMethod);
      expect(metadata).toBe('Use newMethod instead');
    });
  });

  describe('Description', () => {
    test('should set description metadata', () => {
      class TestClass {
        @Description('This is a test method')
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(DESCRIPTION_KEY, TestClass.prototype.testMethod);
      expect(metadata).toBe('This is a test method');
    });
  });

  describe('CacheHint', () => {
    test('should set cache hint with maxAge', () => {
      class TestClass {
        @CacheHint({ maxAge: 3600 })
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(CACHE_KEY, TestClass.prototype.testMethod);
      expect(metadata).toEqual({ maxAge: 3600 });
    });

    test('should set cache hint with scope', () => {
      class TestClass {
        @CacheHint({ maxAge: 60, scope: 'PUBLIC' })
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(CACHE_KEY, TestClass.prototype.testMethod);
      expect(metadata).toEqual({ maxAge: 60, scope: 'PUBLIC' });
    });
  });

  describe('SubscriptionFilter', () => {
    test('should set subscription filter metadata', () => {
      const filterFn = (payload: { id: number }, variables: { id: number }) =>
        payload.id === variables.id;

      class TestClass {
        @SubscriptionFilter(filterFn)
        testSubscription() {}
      }

      const metadata = Reflect.getMetadata(SUBSCRIPTION_FILTER_KEY, TestClass.prototype.testSubscription);
      expect(metadata).toBe(filterFn);
    });

    test('should execute filter function correctly', () => {
      const filterFn = (payload: { id: number }, variables: { id: number }) =>
        payload.id === variables.id;

      class TestClass {
        @SubscriptionFilter(filterFn)
        testSubscription() {}
      }

      const metadata = Reflect.getMetadata(SUBSCRIPTION_FILTER_KEY, TestClass.prototype.testSubscription);
      expect(metadata({ id: 1 }, { id: 1 })).toBe(true);
      expect(metadata({ id: 1 }, { id: 2 })).toBe(false);
    });
  });

  describe('createContextDecorator', () => {
    test('should create a decorator factory', () => {
      const CurrentUser = createContextDecorator<{ id: string }>('user');
      expect(typeof CurrentUser).toBe('function');
    });

    test('should return a parameter decorator', () => {
      const CurrentUser = createContextDecorator<{ id: string }>('user');
      const decorator = CurrentUser();
      expect(typeof decorator).toBe('function');
    });
  });

  describe('Decorators', () => {
    test('should compose multiple decorators', () => {
      const { Decorators } = require('./decorators');

      class TestClass {
        @Decorators(Complexity(10), Description('A test method'))
        testMethod() {}
      }

      const complexityMeta = Reflect.getMetadata(COMPLEXITY_KEY, TestClass.prototype.testMethod);
      const descMeta = Reflect.getMetadata(DESCRIPTION_KEY, TestClass.prototype.testMethod);

      expect(complexityMeta).toBe(10);
      expect(descMeta).toBe('A test method');
    });
  });

  describe('metadata keys', () => {
    test('should have correct complexity key', () => {
      expect(COMPLEXITY_KEY).toBe('leaven:complexity');
    });

    test('should have correct deprecated key', () => {
      expect(DEPRECATED_KEY).toBe('leaven:deprecated');
    });

    test('should have correct description key', () => {
      expect(DESCRIPTION_KEY).toBe('leaven:description');
    });

    test('should have correct cache key', () => {
      expect(CACHE_KEY).toBe('leaven:cache');
    });

    test('should have correct subscription filter key', () => {
      expect(SUBSCRIPTION_FILTER_KEY).toBe('leaven:subscription:filter');
    });
  });
});
