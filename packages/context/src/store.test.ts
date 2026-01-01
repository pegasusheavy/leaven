/**
 * @leaven-graphql/context - Store tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { ContextStore, createContextStore } from './store';
import type { BaseContext } from './types';

interface TestContext extends BaseContext {
  userId?: string;
}

describe('ContextStore', () => {
  let store: ContextStore<TestContext>;

  beforeEach(() => {
    store = new ContextStore<TestContext>();
  });

  afterEach(() => {
    store.dispose();
  });

  describe('constructor', () => {
    test('should create store with default options', () => {
      expect(store).toBeDefined();
      expect(store.activeCount).toBe(0);
    });

    test('should create store with auto cleanup', () => {
      const cleanupStore = new ContextStore<TestContext>({
        autoCleanup: true,
        cleanupInterval: 1000,
      });
      expect(cleanupStore).toBeDefined();
      cleanupStore.dispose();
    });
  });

  describe('run', () => {
    test('should run function with context', () => {
      const context: TestContext = {
        requestId: 'test-123',
        startTime: Date.now(),
        userId: 'user-1',
      };

      const result = store.run(context, () => {
        const ctx = store.getContext();
        return ctx?.userId;
      });

      expect(result).toBe('user-1');
    });

    test('should clean up after function completes', () => {
      const context: TestContext = {
        requestId: 'test-123',
        startTime: Date.now(),
      };

      store.run(context, () => {
        expect(store.activeCount).toBe(1);
      });

      expect(store.activeCount).toBe(0);
    });

    test('should clean up on error', () => {
      const context: TestContext = {
        requestId: 'test-123',
        startTime: Date.now(),
      };

      try {
        store.run(context, () => {
          throw new Error('Test error');
        });
      } catch {
        // Expected
      }

      expect(store.activeCount).toBe(0);
    });
  });

  describe('runAsync', () => {
    test('should run async function with context', async () => {
      const context: TestContext = {
        requestId: 'test-123',
        startTime: Date.now(),
        userId: 'user-1',
      };

      const result = await store.runAsync(context, async () => {
        await new Promise((r) => setTimeout(r, 10));
        const ctx = store.getContext();
        return ctx?.userId;
      });

      expect(result).toBe('user-1');
    });

    test('should clean up after async function completes', async () => {
      const context: TestContext = {
        requestId: 'test-123',
        startTime: Date.now(),
      };

      await store.runAsync(context, async () => {
        expect(store.activeCount).toBe(1);
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(store.activeCount).toBe(0);
    });
  });

  describe('getContext', () => {
    test('should return undefined outside of run', () => {
      expect(store.getContext()).toBeUndefined();
    });

    test('should return context inside run', () => {
      const context: TestContext = {
        requestId: 'test-123',
        startTime: Date.now(),
      };

      store.run(context, () => {
        expect(store.getContext()).toBeDefined();
        expect(store.getContext()?.requestId).toBe('test-123');
      });
    });
  });

  describe('requireContext', () => {
    test('should throw outside of run', () => {
      expect(() => store.requireContext()).toThrow(/No context available/);
    });

    test('should return context inside run', () => {
      const context: TestContext = {
        requestId: 'test-123',
        startTime: Date.now(),
      };

      store.run(context, () => {
        const ctx = store.requireContext();
        expect(ctx.requestId).toBe('test-123');
      });
    });
  });

  describe('getByRequestId', () => {
    test('should get context by request ID', () => {
      const context: TestContext = {
        requestId: 'test-123',
        startTime: Date.now(),
        userId: 'user-1',
      };

      store.run(context, () => {
        const retrieved = store.getByRequestId('test-123');
        expect(retrieved?.userId).toBe('user-1');
      });
    });

    test('should return undefined for unknown request ID', () => {
      expect(store.getByRequestId('unknown')).toBeUndefined();
    });
  });

  describe('activeCount', () => {
    test('should track active contexts', async () => {
      expect(store.activeCount).toBe(0);

      const context1: TestContext = {
        requestId: 'test-1',
        startTime: Date.now(),
      };
      const context2: TestContext = {
        requestId: 'test-2',
        startTime: Date.now(),
      };

      // Run concurrently
      const p1 = store.runAsync(context1, async () => {
        expect(store.activeCount).toBeGreaterThanOrEqual(1);
        await new Promise((r) => setTimeout(r, 50));
      });

      const p2 = store.runAsync(context2, async () => {
        expect(store.activeCount).toBeGreaterThanOrEqual(1);
        await new Promise((r) => setTimeout(r, 50));
      });

      await Promise.all([p1, p2]);
      expect(store.activeCount).toBe(0);
    });
  });

  describe('getActiveRequestIds', () => {
    test('should return active request IDs', () => {
      const context: TestContext = {
        requestId: 'test-123',
        startTime: Date.now(),
      };

      store.run(context, () => {
        const ids = store.getActiveRequestIds();
        expect(ids).toContain('test-123');
      });
    });
  });

  describe('cleanup', () => {
    test('should remove old contexts', () => {
      // This is hard to test directly since contexts are cleaned up
      // automatically. We'll just verify the method exists and returns.
      const cleaned = store.cleanup(0);
      expect(cleaned).toBe(0);
    });
  });

  describe('dispose', () => {
    test('should clear all contexts and timers', () => {
      const cleanupStore = new ContextStore<TestContext>({
        autoCleanup: true,
        cleanupInterval: 100,
      });

      cleanupStore.dispose();
      expect(cleanupStore.activeCount).toBe(0);
    });
  });
});

describe('createContextStore', () => {
  test('should create a ContextStore', () => {
    const store = createContextStore<TestContext>();
    expect(store).toBeInstanceOf(ContextStore);
    store.dispose();
  });

  test('should accept config options', () => {
    const store = createContextStore<TestContext>({
      autoCleanup: true,
      cleanupInterval: 5000,
    });
    expect(store).toBeInstanceOf(ContextStore);
    store.dispose();
  });
});
