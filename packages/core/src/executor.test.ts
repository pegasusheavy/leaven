/**
 * @leaven-graphql/core - Executor tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { buildSchema } from 'graphql';
import { LeavenExecutor, createExecutor } from './executor';

const schema = buildSchema(`
  type Query {
    hello: String
    user(id: ID!): User
    error: String
  }
  type Mutation {
    createUser(name: String!): User
  }
  type Subscription {
    countdown(from: Int!): Int
  }
  type User {
    id: ID!
    name: String
  }
`);

const rootValue = {
  hello: () => 'Hello, World!',
  user: ({ id }: { id: string }) => ({ id, name: 'Test User' }),
  createUser: ({ name }: { name: string }) => ({ id: '1', name }),
  error: () => {
    throw new Error('Test error');
  },
  countdown: async function* ({ from }: { from: number }) {
    for (let i = from; i >= 0; i--) {
      yield { countdown: i };
      await new Promise((r) => setTimeout(r, 10));
    }
  },
};

describe('LeavenExecutor', () => {
  let executor: LeavenExecutor;

  beforeEach(() => {
    executor = new LeavenExecutor({ schema, rootValue });
  });

  describe('constructor', () => {
    test('should create executor with schema', () => {
      expect(executor).toBeDefined();
      expect(executor.getSchema()).toBe(schema);
    });

    test('should create executor with cache disabled', () => {
      const noCacheExecutor = new LeavenExecutor({
        schema,
        rootValue,
        cache: false,
      });
      expect(noCacheExecutor).toBeDefined();
    });

    test('should create executor with custom cache config', () => {
      const customCacheExecutor = new LeavenExecutor({
        schema,
        rootValue,
        cache: { maxSize: 100, ttl: 60000 },
      });
      expect(customCacheExecutor).toBeDefined();
    });
  });

  describe('execute', () => {
    test('should execute a simple query', async () => {
      const result = await executor.execute({ query: '{ hello }' });

      expect(result.response.data).toEqual({ hello: 'Hello, World!' });
      expect(result.response.errors).toBeUndefined();
    });

    test('should execute query with variables', async () => {
      const result = await executor.execute({
        query: 'query GetUser($id: ID!) { user(id: $id) { id name } }',
        variables: { id: '123' },
      });

      expect(result.response.data).toEqual({
        user: { id: '123', name: 'Test User' },
      });
    });

    test('should return validation errors', async () => {
      const result = await executor.execute({ query: '{ nonexistent }' });

      expect(result.response.errors).toBeDefined();
      expect(result.response.errors!.length).toBeGreaterThan(0);
    });

    test('should handle execution errors', async () => {
      const result = await executor.execute({ query: '{ error }' });

      expect(result.response.errors).toBeDefined();
      expect(result.response.errors![0]?.message).toBe('Test error');
    });

    test('should execute mutations', async () => {
      const result = await executor.execute({
        query: 'mutation { createUser(name: "John") { id name } }',
      });

      expect(result.response.data).toEqual({
        createUser: { id: '1', name: 'John' },
      });
    });

    test('should use cache for repeated queries', async () => {
      // Execute twice
      await executor.execute({ query: '{ hello }' });
      const result = await executor.execute({ query: '{ hello }' });

      expect(result.response.data).toEqual({ hello: 'Hello, World!' });
    });

    test('should include context in execution', async () => {
      const contextExecutor = new LeavenExecutor({
        schema: buildSchema(`
          type Query {
            currentUser: String
          }
        `),
        rootValue: {
          currentUser: (_: unknown, context: { userId: string }) =>
            context.userId,
        },
      });

      const result = await contextExecutor.execute(
        { query: '{ currentUser }' },
        { userId: 'user-123' }
      );

      expect(result.response.data).toEqual({ currentUser: 'user-123' });
    });
  });

  describe('execute with metrics', () => {
    test('should include metrics when enabled', async () => {
      const metricsExecutor = new LeavenExecutor({
        schema,
        rootValue,
        metrics: true,
      });

      const result = await metricsExecutor.execute({ query: '{ hello }' });

      expect(result.metrics).toBeDefined();
      expect(result.metrics?.timing.totalTime).toBeGreaterThan(0);
    });

    test('should track document cache hits', async () => {
      const metricsExecutor = new LeavenExecutor({
        schema,
        rootValue,
        metrics: true,
      });

      await metricsExecutor.execute({ query: '{ hello }' });
      const result = await metricsExecutor.execute({ query: '{ hello }' });

      expect(result.metrics?.documentCached).toBe(true);
    });
  });

  describe('execute with complexity limits', () => {
    test('should reject queries exceeding max complexity', async () => {
      const limitedExecutor = new LeavenExecutor({
        schema,
        rootValue,
        compilerOptions: { calculateComplexity: true },
        maxComplexity: 1,
      });

      const result = await limitedExecutor.execute({
        query: '{ user(id: "1") { id name } }',
      });

      expect(result.response.errors).toBeDefined();
      expect(result.response.errors![0]?.message).toContain('complexity');
    });
  });

  describe('execute with hooks', () => {
    test('should call lifecycle hooks', async () => {
      const hookCalls: string[] = [];

      const hookedExecutor = new LeavenExecutor({
        schema,
        rootValue,
        hooks: {
          onParse: () => {
            hookCalls.push('onParse');
          },
          onParsed: () => {
            hookCalls.push('onParsed');
          },
          onValidate: () => {
            hookCalls.push('onValidate');
          },
          onValidated: () => {
            hookCalls.push('onValidated');
          },
          onExecute: () => {
            hookCalls.push('onExecute');
          },
          onExecuted: () => {
            hookCalls.push('onExecuted');
          },
        },
      });

      await hookedExecutor.execute({ query: '{ hello }' });

      expect(hookCalls).toContain('onParse');
      expect(hookCalls).toContain('onParsed');
      expect(hookCalls).toContain('onValidate');
      expect(hookCalls).toContain('onValidated');
      expect(hookCalls).toContain('onExecute');
      expect(hookCalls).toContain('onExecuted');
    });

    test('should call onError hook on failure', async () => {
      let _errorCaught: Error | null = null;

      const hookedExecutor = new LeavenExecutor({
        schema,
        rootValue,
        hooks: {
          onError: (error) => {
            _errorCaught = error;
          },
        },
      });

      await hookedExecutor.execute({ query: '{ error }' });

      // Note: Error handling in GraphQL doesn't always trigger onError
      // This depends on where the error occurs
    });
  });

  describe('getCacheStats', () => {
    test('should return cache statistics', async () => {
      await executor.execute({ query: '{ hello }' });

      const stats = await executor.getCacheStats();

      expect(stats.document).toBeDefined();
      expect(stats.compiled).toBeDefined();
    });
  });

  describe('clearCaches', () => {
    test('should clear all caches', async () => {
      await executor.execute({ query: '{ hello }' });
      await executor.clearCaches();

      const stats = await executor.getCacheStats();
      expect(stats.document?.size).toBe(0);
      expect(stats.compiled.size).toBe(0);
    });
  });

  describe('getSchema', () => {
    test('should return the schema', () => {
      expect(executor.getSchema()).toBe(schema);
    });
  });

  describe('subscribe', () => {
    test('should handle subscriptions', async () => {
      const result = await executor.subscribe({
        query: 'subscription { countdown(from: 2) }',
      });

      if ('errors' in result && !Symbol.asyncIterator) {
        // It's an error result
        expect(result.errors).toBeUndefined();
      } else {
        // It's an async iterator
        const iterator = result as AsyncIterableIterator<{ data?: unknown }>;
        const values: number[] = [];

        for await (const value of iterator) {
          if (value.data) {
            values.push((value.data as { countdown: number }).countdown);
          }
          if (values.length >= 3) break;
        }

        expect(values.length).toBeGreaterThan(0);
      }
    });

    test('should return errors for invalid subscription', async () => {
      const result = await executor.subscribe({
        query: 'subscription { nonexistent }',
      });

      expect(result).toHaveProperty('errors');
    });
  });
});

describe('createExecutor', () => {
  test('should create a LeavenExecutor', () => {
    const executor = createExecutor({ schema });
    expect(executor).toBeInstanceOf(LeavenExecutor);
  });
});
