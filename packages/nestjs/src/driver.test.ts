/**
 * @leaven-graphql/nestjs - Driver tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
import { LeavenDriver } from './driver';
import type { LeavenModuleOptions } from './types';

describe('LeavenDriver', () => {
  let driver: LeavenDriver;
  let schema: GraphQLSchema;

  beforeEach(() => {
    schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          hello: {
            type: GraphQLString,
            resolve: () => 'world',
          },
          echo: {
            type: GraphQLString,
            args: {
              message: { type: GraphQLString },
            },
            resolve: (_, args) => args.message,
          },
        },
      }),
    });
  });

  afterEach(() => {
    driver?.onModuleDestroy();
  });

  describe('initialization', () => {
    test('should initialize with schema', async () => {
      const options: LeavenModuleOptions = { schema };
      driver = new LeavenDriver(options);
      await driver.onModuleInit();

      expect(driver.getSchema()).toBe(schema);
      expect(driver.getExecutor()).not.toBeNull();
    });

    test('should initialize without schema', async () => {
      const options: LeavenModuleOptions = {};
      driver = new LeavenDriver(options);
      await driver.onModuleInit();

      expect(driver.getSchema()).toBeNull();
      expect(driver.getExecutor()).toBeNull();
    });

    test('should allow setting schema after initialization', async () => {
      const options: LeavenModuleOptions = {};
      driver = new LeavenDriver(options);
      await driver.onModuleInit();

      driver.setSchema(schema);

      expect(driver.getSchema()).toBe(schema);
      expect(driver.getExecutor()).not.toBeNull();
    });
  });

  describe('execute', () => {
    beforeEach(async () => {
      const options: LeavenModuleOptions = { schema };
      driver = new LeavenDriver(options);
      await driver.onModuleInit();
    });

    test('should execute a simple query', async () => {
      const result = await driver.execute('{ hello }');

      expect(result.data).toEqual({ hello: 'world' });
      expect(result.errors).toBeUndefined();
    });

    test('should execute query with variables', async () => {
      const result = await driver.execute(
        'query Echo($msg: String) { echo(message: $msg) }',
        { msg: 'test message' }
      );

      expect(result.data).toEqual({ echo: 'test message' });
      expect(result.errors).toBeUndefined();
    });

    test('should handle execution errors', async () => {
      const errorSchema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: {
            error: {
              type: GraphQLString,
              resolve: () => {
                throw new Error('Test error');
              },
            },
          },
        }),
      });

      driver.setSchema(errorSchema);
      const result = await driver.execute('{ error }');

      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    test('should throw if executor not initialized', async () => {
      const emptyDriver = new LeavenDriver({});
      await emptyDriver.onModuleInit();

      await expect(emptyDriver.execute('{ hello }')).rejects.toThrow(
        'Executor not initialized'
      );
    });

    test('should include metrics when enabled', async () => {
      const metricsDriver = new LeavenDriver({ schema, metrics: true });
      await metricsDriver.onModuleInit();

      const result = await metricsDriver.execute('{ hello }');

      expect(result.extensions?.metrics).toBeDefined();
      metricsDriver.onModuleDestroy();
    });

    test('should format errors when formatter provided', async () => {
      const formatError = (error: { message: string }) => ({
        ...error,
        message: `Formatted: ${error.message}`,
      });

      const formattedDriver = new LeavenDriver({
        schema: new GraphQLSchema({
          query: new GraphQLObjectType({
            name: 'Query',
            fields: {
              error: {
                type: GraphQLString,
                resolve: () => {
                  throw new Error('Original error');
                },
              },
            },
          }),
        }),
        formatError,
      });
      await formattedDriver.onModuleInit();

      const result = await formattedDriver.execute('{ error }');

      expect(result.errors?.[0]?.message).toContain('Formatted:');
      formattedDriver.onModuleDestroy();
    });
  });

  describe('configuration', () => {
    test('should return default path', () => {
      driver = new LeavenDriver({});
      expect(driver.getPath()).toBe('/graphql');
    });

    test('should return custom path', () => {
      driver = new LeavenDriver({ path: '/api/graphql' });
      expect(driver.getPath()).toBe('/api/graphql');
    });

    test('should enable playground in development by default', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      driver = new LeavenDriver({});
      expect(driver.isPlaygroundEnabled()).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    test('should disable playground in production by default', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      driver = new LeavenDriver({});
      expect(driver.isPlaygroundEnabled()).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });

    test('should respect explicit playground setting', () => {
      driver = new LeavenDriver({ playground: true });
      expect(driver.isPlaygroundEnabled()).toBe(true);

      driver = new LeavenDriver({ playground: false });
      expect(driver.isPlaygroundEnabled()).toBe(false);
    });

    test('should enable introspection in development by default', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      driver = new LeavenDriver({});
      expect(driver.isIntrospectionEnabled()).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    test('should disable introspection in production by default', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      driver = new LeavenDriver({});
      expect(driver.isIntrospectionEnabled()).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('cache operations', () => {
    beforeEach(async () => {
      const options: LeavenModuleOptions = {
        schema,
        cache: { maxSize: 100 },
      };
      driver = new LeavenDriver(options);
      await driver.onModuleInit();
    });

    test('should return cache stats', async () => {
      // Execute a query to populate cache
      await driver.execute('{ hello }');

      const stats = driver.getCacheStats();
      expect(stats).toBeDefined();
    });

    test('should clear caches', async () => {
      // Execute a query to populate cache
      await driver.execute('{ hello }');

      driver.clearCaches();

      // Should not throw
      expect(driver.getExecutor()).not.toBeNull();
    });

    test('should return null stats when executor not initialized', () => {
      const emptyDriver = new LeavenDriver({});
      expect(emptyDriver.getCacheStats()).toBeNull();
    });
  });

  describe('cleanup', () => {
    test('should cleanup on module destroy', async () => {
      const options: LeavenModuleOptions = { schema };
      driver = new LeavenDriver(options);
      await driver.onModuleInit();

      expect(driver.getExecutor()).not.toBeNull();

      await driver.onModuleDestroy();

      // Executor should be cleared
      expect(driver.getExecutor()).toBeNull();
    });
  });
});
