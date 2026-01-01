/**
 * @leaven-graphql/schema - Builder tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import { graphql } from 'graphql';
import { SchemaBuilder, createSchemaBuilder } from './builder';

describe('SchemaBuilder', () => {
  describe('constructor', () => {
    test('should create builder with default options', () => {
      const builder = new SchemaBuilder();
      expect(builder).toBeDefined();
    });

    test('should create builder with custom options', () => {
      const builder = new SchemaBuilder({
        query: true,
        mutation: false,
        subscription: false,
      });
      expect(builder).toBeDefined();
    });
  });

  describe('addScalar', () => {
    test('should add custom scalar type', () => {
      const builder = new SchemaBuilder();

      builder.addScalar({
        name: 'Date',
        description: 'Date scalar',
        serialize: (value) => (value as Date).toISOString(),
        parseValue: (value) => new Date(value as string),
      });

      builder.addQueryFields({
        now: {
          type: 'Date',
          resolve: () => new Date('2026-01-01'),
        },
      });

      const schema = builder.build();
      expect(schema).toBeDefined();
    });
  });

  describe('addEnum', () => {
    test('should add enum type', () => {
      const builder = new SchemaBuilder();

      builder.addEnum({
        name: 'Status',
        values: {
          ACTIVE: { value: 'active' },
          INACTIVE: { value: 'inactive' },
        },
      });

      builder.addQueryFields({
        status: {
          type: 'Status',
          resolve: () => 'active',
        },
      });

      const schema = builder.build();
      expect(schema).toBeDefined();
    });

    test('should support enum with descriptions', () => {
      const builder = new SchemaBuilder();

      builder.addEnum({
        name: 'Priority',
        description: 'Priority levels',
        values: {
          HIGH: { value: 1, description: 'High priority' },
          MEDIUM: { value: 2, description: 'Medium priority' },
          LOW: { value: 3, description: 'Low priority', deprecationReason: 'Use MEDIUM instead' },
        },
      });

      builder.addQueryFields({
        priority: { type: 'Priority', resolve: () => 1 },
      });

      const schema = builder.build();
      expect(schema).toBeDefined();
    });
  });

  describe('addType', () => {
    test('should add object type', () => {
      const builder = new SchemaBuilder();

      builder.addType({
        name: 'User',
        fields: {
          id: { type: 'ID!' },
          name: { type: 'String' },
          email: { type: 'String!' },
        },
      });

      builder.addQueryFields({
        user: {
          type: 'User',
          args: { id: { type: 'ID!' } },
          resolve: (_, { id }: { id: string }) => ({ id, name: 'Test', email: 'test@test.com' }),
        },
      });

      const schema = builder.build();
      expect(schema).toBeDefined();
    });

    test('should handle nested types', async () => {
      const builder = new SchemaBuilder();

      builder.addType({
        name: 'Post',
        fields: {
          id: { type: 'ID!' },
          title: { type: 'String!' },
        },
      });

      builder.addType({
        name: 'User',
        fields: {
          id: { type: 'ID!' },
          name: { type: 'String' },
          posts: { type: '[Post!]!' },
        },
      });

      builder.addQueryFields({
        user: {
          type: 'User',
          resolve: () => ({
            id: '1',
            name: 'Test',
            posts: [{ id: '1', title: 'Hello' }],
          }),
        },
      });

      const schema = builder.build();
      const result = await graphql({
        schema,
        source: '{ user { id name posts { id title } } }',
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.user).toEqual({
        id: '1',
        name: 'Test',
        posts: [{ id: '1', title: 'Hello' }],
      });
    });
  });

  describe('addInputType', () => {
    test('should add input type', () => {
      const builder = new SchemaBuilder();

      builder.addInputType({
        name: 'CreateUserInput',
        fields: {
          name: { type: 'String!' },
          email: { type: 'String!' },
        },
      });

      builder.addType({
        name: 'User',
        fields: {
          id: { type: 'ID!' },
          name: { type: 'String' },
        },
      });

      builder.addMutationFields({
        createUser: {
          type: 'User',
          args: { input: { type: 'CreateUserInput!' } },
          resolve: (_, { input }: { input: { name: string } }) => ({
            id: '1',
            name: input.name,
          }),
        },
      });

      const schema = builder.build();
      expect(schema).toBeDefined();
    });
  });

  describe('addInterface', () => {
    test('should add interface type', () => {
      const builder = new SchemaBuilder();

      builder.addInterface({
        name: 'Node',
        fields: {
          id: { type: 'ID!' },
        },
      });

      builder.addType({
        name: 'User',
        interfaces: ['Node'],
        fields: {
          id: { type: 'ID!' },
          name: { type: 'String' },
        },
      });

      builder.addQueryFields({
        user: {
          type: 'User',
          resolve: () => ({ id: '1', name: 'Test' }),
        },
      });

      const schema = builder.build();
      expect(schema).toBeDefined();
    });
  });

  describe('addUnion', () => {
    test('should add union type', () => {
      const builder = new SchemaBuilder();

      builder.addType({
        name: 'Cat',
        fields: {
          name: { type: 'String!' },
          meows: { type: 'Boolean!' },
        },
      });

      builder.addType({
        name: 'Dog',
        fields: {
          name: { type: 'String!' },
          barks: { type: 'Boolean!' },
        },
      });

      builder.addUnion({
        name: 'Pet',
        types: ['Cat', 'Dog'],
        resolveType: (value: { meows?: boolean }) => (value.meows !== undefined ? 'Cat' : 'Dog'),
      });

      builder.addQueryFields({
        pet: {
          type: 'Pet',
          resolve: () => ({ name: 'Whiskers', meows: true }),
        },
      });

      const schema = builder.build();
      expect(schema).toBeDefined();
    });
  });

  describe('addQueryFields', () => {
    test('should add query fields', async () => {
      const builder = new SchemaBuilder();

      builder.addQueryFields({
        hello: {
          type: 'String!',
          resolve: () => 'Hello, World!',
        },
      });

      const schema = builder.build();
      const result = await graphql({ schema, source: '{ hello }' });

      expect(result.data?.hello).toBe('Hello, World!');
    });

    test('should add fields with arguments', async () => {
      const builder = new SchemaBuilder();

      builder.addQueryFields({
        greet: {
          type: 'String!',
          args: {
            name: { type: 'String!', description: 'Name to greet' },
          },
          resolve: (_, { name }: { name: string }) => `Hello, ${name}!`,
        },
      });

      const schema = builder.build();
      const result = await graphql({
        schema,
        source: '{ greet(name: "World") }',
      });

      expect(result.data?.greet).toBe('Hello, World!');
    });
  });

  describe('addMutationFields', () => {
    test('should add mutation fields', async () => {
      const builder = new SchemaBuilder();

      builder.addMutationFields({
        setMessage: {
          type: 'String!',
          args: { message: { type: 'String!' } },
          resolve: (_, { message }: { message: string }) => message,
        },
      });

      const schema = builder.build();
      const result = await graphql({
        schema,
        source: 'mutation { setMessage(message: "Hello") }',
      });

      expect(result.data?.setMessage).toBe('Hello');
    });
  });

  describe('addSubscriptionFields', () => {
    test('should add subscription fields', () => {
      const builder = new SchemaBuilder();

      builder.addSubscriptionFields({
        messageAdded: {
          type: 'String!',
          resolve: (payload: string) => payload,
        },
      });

      const schema = builder.build();
      expect(schema.getSubscriptionType()).toBeDefined();
    });
  });

  describe('build', () => {
    test('should build valid schema', () => {
      const builder = new SchemaBuilder();

      builder.addQueryFields({
        hello: { type: 'String', resolve: () => 'world' },
      });

      const schema = builder.build();

      expect(schema).toBeDefined();
      expect(schema.getQueryType()).toBeDefined();
    });

    test('should create empty query if no fields', () => {
      const builder = new SchemaBuilder();
      const schema = builder.build();

      expect(schema.getQueryType()).toBeDefined();
      expect(schema.getQueryType()?.getFields()._empty).toBeDefined();
    });
  });

  describe('applyResolvers', () => {
    test('should apply resolvers to fields', async () => {
      const builder = new SchemaBuilder();

      builder.addQueryFields({
        hello: { type: 'String' },
      });

      builder.applyResolvers({
        Query: {
          hello: () => 'Applied resolver',
        },
      });

      const schema = builder.build();
      const result = await graphql({ schema, source: '{ hello }' });

      expect(result.data?.hello).toBe('Applied resolver');
    });
  });
});

describe('createSchemaBuilder', () => {
  test('should create a SchemaBuilder', () => {
    const builder = createSchemaBuilder();
    expect(builder).toBeInstanceOf(SchemaBuilder);
  });
});
