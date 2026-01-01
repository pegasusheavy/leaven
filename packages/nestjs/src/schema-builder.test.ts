/**
 * @leaven-graphql/nestjs - Schema Builder tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
import {
  SchemaBuilderService,
  getResolverMetadata,
  registerResolverMetadata,
  clearResolverMetadata,
  type ResolverMetadata,
} from './schema-builder';
import { LeavenDriver } from './driver';
import type { LeavenModuleOptions } from './types';

describe('SchemaBuilderService', () => {
  let schema: GraphQLSchema;
  let driver: LeavenDriver;

  beforeEach(() => {
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

    driver = new LeavenDriver({});
  });

  afterEach(() => {
    driver.onModuleDestroy();
  });

  describe('buildSchema', () => {
    test('should return provided schema', async () => {
      const options: LeavenModuleOptions = { schema };
      const builder = new SchemaBuilderService(options, driver);

      const result = await builder.buildSchema();

      expect(result).toBe(schema);
    });

    test('should return null when no schema source provided', async () => {
      const options: LeavenModuleOptions = {};
      const builder = new SchemaBuilderService(options, driver);

      const result = await builder.buildSchema();

      expect(result).toBeNull();
    });

    test('should return null for autoSchemaFile (external handling)', async () => {
      const options: LeavenModuleOptions = { autoSchemaFile: true };
      const builder = new SchemaBuilderService(options, driver);

      const result = await builder.buildSchema();

      expect(result).toBeNull();
    });

    test('should initialize and set schema on module init', async () => {
      const options: LeavenModuleOptions = { schema };
      const builder = new SchemaBuilderService(options, driver);

      await builder.onModuleInit();

      expect(builder.getSchema()).toBe(schema);
      expect(driver.getSchema()).toBe(schema);
    });
  });

  describe('getSchema', () => {
    test('should return null before initialization', () => {
      const options: LeavenModuleOptions = { schema };
      const builder = new SchemaBuilderService(options, driver);

      expect(builder.getSchema()).toBeNull();
    });

    test('should return schema after initialization', async () => {
      const options: LeavenModuleOptions = { schema };
      const builder = new SchemaBuilderService(options, driver);

      await builder.onModuleInit();

      expect(builder.getSchema()).toBe(schema);
    });
  });

  describe('setSchema', () => {
    test('should update the schema', async () => {
      const options: LeavenModuleOptions = { schema };
      const builder = new SchemaBuilderService(options, driver);
      await builder.onModuleInit();

      const newSchema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: {
            goodbye: {
              type: GraphQLString,
              resolve: () => 'world',
            },
          },
        }),
      });

      builder.setSchema(newSchema);

      expect(builder.getSchema()).toBe(newSchema);
      expect(driver.getSchema()).toBe(newSchema);
    });
  });

  describe('isSchemaReady', () => {
    test('should return false before initialization', () => {
      const options: LeavenModuleOptions = { schema };
      const builder = new SchemaBuilderService(options, driver);

      expect(builder.isSchemaReady()).toBe(false);
    });

    test('should return true after initialization', async () => {
      const options: LeavenModuleOptions = { schema };
      const builder = new SchemaBuilderService(options, driver);

      await builder.onModuleInit();

      expect(builder.isSchemaReady()).toBe(true);
    });
  });
});

describe('Resolver Metadata', () => {
  beforeEach(() => {
    clearResolverMetadata();
  });

  test('should register metadata', () => {
    const metadata: ResolverMetadata = {
      type: 'Query',
      name: 'hello',
      returnType: String,
      target: class TestResolver {},
      methodName: 'hello',
    };

    registerResolverMetadata(metadata);

    expect(getResolverMetadata()).toHaveLength(1);
    expect(getResolverMetadata()[0]).toEqual(metadata);
  });

  test('should register multiple metadata entries', () => {
    const metadata1: ResolverMetadata = {
      type: 'Query',
      name: 'hello',
      returnType: String,
      target: class TestResolver {},
      methodName: 'hello',
    };

    const metadata2: ResolverMetadata = {
      type: 'Mutation',
      name: 'updateHello',
      returnType: String,
      target: class TestResolver {},
      methodName: 'updateHello',
    };

    registerResolverMetadata(metadata1);
    registerResolverMetadata(metadata2);

    expect(getResolverMetadata()).toHaveLength(2);
  });

  test('should clear metadata', () => {
    const metadata: ResolverMetadata = {
      type: 'Query',
      name: 'hello',
      returnType: String,
      target: class TestResolver {},
      methodName: 'hello',
    };

    registerResolverMetadata(metadata);
    expect(getResolverMetadata()).toHaveLength(1);

    clearResolverMetadata();
    expect(getResolverMetadata()).toHaveLength(0);
  });

  test('should return a copy of metadata', () => {
    const metadata: ResolverMetadata = {
      type: 'Query',
      name: 'hello',
      returnType: String,
      target: class TestResolver {},
      methodName: 'hello',
    };

    registerResolverMetadata(metadata);

    const result = getResolverMetadata();
    result.push(metadata);

    // Original should not be modified
    expect(getResolverMetadata()).toHaveLength(1);
  });
});
