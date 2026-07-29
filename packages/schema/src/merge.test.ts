/**
 * @leaven-graphql/schema - Merge tests
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, spyOn } from 'bun:test';
import {
  buildSchema,
  graphql,
  parse,
  subscribe,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
  type ExecutionResult,
} from 'graphql';
import { mergeSchemas, mergeSchemasFromStrings } from './merge';

/**
 * Build a single-field schema whose one query field has the given resolver
 */
function querySchema(field: string, resolve: () => unknown): GraphQLSchema {
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: { [field]: { type: GraphQLString, resolve } },
    }),
  });
}

describe('mergeSchemasFromStrings', () => {
  test('should merge a type with its extension', () => {
    const schema = mergeSchemasFromStrings([
      'type Query { a: String }',
      'extend type Query { b: String }',
    ]);

    const fields = schema.getQueryType()?.getFields();
    expect(fields?.a).toBeDefined();
    expect(fields?.b).toBeDefined();
  });

  test('should merge an extension that appears before the base type', () => {
    const schema = mergeSchemasFromStrings([
      'extend type Query { b: String }',
      'type Query { a: String }',
    ]);

    const fields = schema.getQueryType()?.getFields();
    expect(fields?.a).toBeDefined();
    expect(fields?.b).toBeDefined();
  });

  test('should merge multiple extensions of the same type', () => {
    const schema = mergeSchemasFromStrings([
      'type Query { a: String }',
      'extend type Query { b: String }',
      'extend type Query { c: Int }',
    ]);

    const fields = schema.getQueryType()?.getFields();
    expect(fields?.a).toBeDefined();
    expect(fields?.b).toBeDefined();
    expect(fields?.c).toBeDefined();
  });

  test('should merge extensions of non-root types', () => {
    const schema = mergeSchemasFromStrings([
      'type Query { user: User } type User { id: ID! }',
      'extend type User { email: String }',
    ]);

    const user = schema.getType('User') as GraphQLObjectType;
    expect(user.getFields().id).toBeDefined();
    expect(user.getFields().email).toBeDefined();
  });

  test('should merge distinct types from separate strings', () => {
    const schema = mergeSchemasFromStrings([
      'type Query { user: User } type User { id: ID! }',
      'type Post { title: String! }',
    ]);

    expect(schema.getType('User')).toBeDefined();
    expect(schema.getType('Post')).toBeDefined();
  });

  test('should keep the first definition on conflict by default', () => {
    const schema = mergeSchemasFromStrings([
      'type Query { a: String }',
      'type Query { b: String }',
    ]);

    const fields = schema.getQueryType()?.getFields();
    expect(fields?.a).toBeDefined();
    expect(fields?.b).toBeUndefined();
  });

  test('should keep the last definition when onTypeConflict is "last"', () => {
    const schema = mergeSchemasFromStrings(
      ['type Query { a: String }', 'type Query { b: String }'],
      undefined,
      { onTypeConflict: 'last' }
    );

    const fields = schema.getQueryType()?.getFields();
    expect(fields?.a).toBeUndefined();
    expect(fields?.b).toBeDefined();
  });

  test('should throw when onTypeConflict is "error"', () => {
    expect(() =>
      mergeSchemasFromStrings(
        ['type Query { a: String }', 'type Query { b: String }'],
        undefined,
        { onTypeConflict: 'error' }
      )
    ).toThrow('Type conflict: Query is defined multiple times');
  });

  test('should still merge extensions when onTypeConflict is "error"', () => {
    const schema = mergeSchemasFromStrings(
      ['type Query { a: String }', 'extend type Query { b: String }'],
      undefined,
      { onTypeConflict: 'error' }
    );

    const fields = schema.getQueryType()?.getFields();
    expect(fields?.a).toBeDefined();
    expect(fields?.b).toBeDefined();
  });

  test('should still merge extensions declared before the base under "error"', () => {
    const schema = mergeSchemasFromStrings(
      ['extend type Query { b: String }', 'type Query { a: String }'],
      undefined,
      { onTypeConflict: 'error' }
    );

    const fields = schema.getQueryType()?.getFields();
    expect(fields?.a).toBeDefined();
    expect(fields?.b).toBeDefined();
  });

  test('should keep extensions when a later base definition wins under "last"', () => {
    const schema = mergeSchemasFromStrings(
      [
        'type Query { a: String }',
        'extend type Query { b: String }',
        'type Query { c: String }',
      ],
      undefined,
      { onTypeConflict: 'last' }
    );

    const fields = schema.getQueryType()?.getFields();
    expect(Object.keys(fields ?? {}).sort()).toEqual(['b', 'c']);
  });

  test('should keep extensions when the first base definition wins by default', () => {
    const schema = mergeSchemasFromStrings([
      'type Query { a: String }',
      'extend type Query { b: String }',
      'type Query { c: String }',
    ]);

    const fields = schema.getQueryType()?.getFields();
    expect(Object.keys(fields ?? {}).sort()).toEqual(['a', 'b']);
  });

  test('should throw for resolvers on unknown types', () => {
    expect(() =>
      mergeSchemasFromStrings(['type Query { hello: String }'], {
        User: { name: () => 'x' },
      })
    ).toThrow('Resolvers reference unknown type "User"');
  });

  test('should throw for resolvers on unknown fields', () => {
    expect(() =>
      mergeSchemasFromStrings(['type Query { hello: String }'], {
        Query: { helo: () => 'x' },
      })
    ).toThrow('Resolvers reference unknown field "Query.helo"');
  });

  test('should throw for resolvers on a type without fields', () => {
    expect(() =>
      mergeSchemasFromStrings(['scalar Cursor type Query { hello: String }'], {
        Cursor: { anything: () => 'x' },
      })
    ).toThrow('Resolvers reference type "Cursor", which has no fields');
  });

  test('should support the { resolve, subscribe } resolver form', async () => {
    const schema = mergeSchemasFromStrings(
      ['type Query { _: String } type Subscription { tick: Int }'],
      {
        Subscription: {
          tick: {
            subscribe: async function* () {
              yield 1;
              yield 2;
            },
            resolve: (payload) => (payload as number) * 10,
          },
        },
      }
    );

    const result = await subscribe({
      schema,
      document: parse('subscription { tick }'),
    });

    const values: unknown[] = [];
    for await (const payload of result as AsyncIterable<ExecutionResult>) {
      expect(payload.errors).toBeUndefined();
      values.push(payload.data?.tick);
    }

    expect(values).toEqual([10, 20]);
  });

  test('should throw for a null resolver instead of a bare TypeError', () => {
    expect(() =>
      mergeSchemasFromStrings(['type Query { hello: String }'], {
        Query: { hello: null as unknown as () => string },
      })
    ).toThrow(
      'Resolver for "Query.hello" must be a function or a { resolve, subscribe } object'
    );
  });

  test('should attach provided resolvers', async () => {
    const schema = mergeSchemasFromStrings(['type Query { hello: String }'], {
      Query: { hello: () => 'hi' },
    });

    const result = await graphql({ schema, source: '{ hello }' });
    expect(result.data?.hello).toBe('hi');
  });

  test('should rethrow build failures instead of hiding them', () => {
    expect(() =>
      mergeSchemasFromStrings(['type Query { a: Missing }'])
    ).toThrow(/Failed to merge schemas/);
  });
});

describe('mergeSchemas', () => {
  test('should throw for an empty schema list', () => {
    expect(() => mergeSchemas([])).toThrow('At least one schema is required');
  });

  test('should return the same instance for a single schema without resolvers', () => {
    const schema = buildSchema('type Query { a: String }');
    expect(mergeSchemas([schema])).toBe(schema);
  });

  test('should merge types from multiple schemas', () => {
    const a = buildSchema('type Query { a: String }');
    const b = buildSchema('type User { name: String }');

    const merged = mergeSchemas([a, b]);

    expect(merged.getQueryType()?.getFields().a).toBeDefined();
    expect(merged.getType('User')).toBeDefined();
  });

  test('should preserve resolvers across a two-schema merge', async () => {
    const a = mergeSchemasFromStrings(['type Query { hello: String }'], {
      Query: { hello: () => 'from A' },
    });
    const b = buildSchema('type User { name: String }');

    const merged = mergeSchemas([a, b]);
    const result = await graphql({ schema: merged, source: '{ hello }' });

    expect(result.errors).toBeUndefined();
    expect(result.data?.hello).toBe('from A');
  });

  test('should preserve resolvers from every source schema', async () => {
    const a = mergeSchemasFromStrings(['type Query { a: String }'], {
      Query: { a: () => 'A' },
    });
    const b = mergeSchemasFromStrings(['type Mutation { doIt: String }'], {
      Mutation: { doIt: () => 'done' },
    });

    const merged = mergeSchemas([a, b]);

    const queryResult = await graphql({ schema: merged, source: '{ a }' });
    expect(queryResult.data?.a).toBe('A');

    const mutationResult = await graphql({
      schema: merged,
      source: 'mutation { doIt }',
    });
    expect(mutationResult.data?.doIt).toBe('done');
  });

  test('should preserve custom scalar functions across a merge', async () => {
    const upper = new GraphQLScalarType({
      name: 'Upper',
      serialize: (value) => String(value).toUpperCase(),
    });

    const a = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          shout: { type: upper, resolve: () => 'hey' },
        },
      }),
    });
    const b = buildSchema('type User { name: String }');

    const merged = mergeSchemas([a, b]);
    const result = await graphql({ schema: merged, source: '{ shout }' });

    expect(result.errors).toBeUndefined();
    expect(result.data?.shout).toBe('HEY');
  });

  test('should throw when two schemas declare the same name as different kinds', () => {
    const scalarSchema = buildSchema(
      'scalar DateTime type Query { now: DateTime }'
    );
    const objectSchema = buildSchema(
      'type DateTime { iso: String } type Query { stamp: DateTime }'
    );

    expect(() => mergeSchemas([scalarSchema, objectSchema])).toThrow(
      'Cannot merge type "DateTime": source is GraphQLObjectType but merged is GraphQLScalarType'
    );
  });

  test('should warn when a source type is missing from the merged schema', () => {
    // The directive definition and the object type share the name "Marker",
    // so conflict resolution keeps the directive and drops the type. Nothing
    // references the type, so the merged schema still builds.
    const withDirective = buildSchema(
      'directive @Marker on FIELD_DEFINITION type Query { a: String }'
    );
    const withType = buildSchema(
      'type Marker { id: ID } type Query { b: String }'
    );

    const warn = spyOn(console, 'warn').mockImplementation(() => {});

    try {
      const merged = mergeSchemas([withDirective, withType]);

      expect(merged.getType('Marker')).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]?.[0]).toContain(
        'type "Marker" exists in a source schema but not in the merged schema'
      );
    } finally {
      warn.mockRestore();
    }
  });

  test('should not warn when only built-in scalars drop out of the merge', () => {
    const withFloat = buildSchema('type Query { value: Float }');
    const withString = buildSchema('type Query { value: String }');

    const warn = spyOn(console, 'warn').mockImplementation(() => {});

    try {
      // 'last' hands Query.value to the String source, leaving Float
      // unreferenced and therefore absent from the merged schema.
      const merged = mergeSchemas([withFloat, withString], undefined, {
        onTypeConflict: 'last',
      });

      expect(merged.getType('Float')).toBeUndefined();
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  test('should let explicit resolvers override source resolvers', async () => {
    const a = mergeSchemasFromStrings(['type Query { hello: String }'], {
      Query: { hello: () => 'from A' },
    });
    const b = buildSchema('type User { name: String }');

    const merged = mergeSchemas([a, b], {
      Query: { hello: () => 'override' },
    });

    const result = await graphql({ schema: merged, source: '{ hello }' });
    expect(result.data?.hello).toBe('override');
  });

  test('should keep root fields from every source schema', async () => {
    const users = querySchema('users', () => 'ada');
    const posts = querySchema('posts', () => 'hello');
    const comments = querySchema('comments', () => 'nice');

    const merged = mergeSchemas([users, posts, comments]);

    const result = await graphql({
      schema: merged,
      source: '{ users posts comments }',
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      users: 'ada',
      posts: 'hello',
      comments: 'nice',
    });
  });

  test('should keep mutation fields from every source schema', async () => {
    const mutationSchema = (field: string, value: string): GraphQLSchema =>
      new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: { _: { type: GraphQLString } },
        }),
        mutation: new GraphQLObjectType({
          name: 'Mutation',
          fields: { [field]: { type: GraphQLString, resolve: () => value } },
        }),
      });

    const merged = mergeSchemas([
      mutationSchema('createUser', 'user'),
      mutationSchema('createPost', 'post'),
    ]);

    const result = await graphql({
      schema: merged,
      source: 'mutation { createUser createPost }',
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({ createUser: 'user', createPost: 'post' });
  });

  test('should merge the fields of a shared non-root type', () => {
    const a = buildSchema('type Query { user: User } type User { id: ID! }');
    const b = buildSchema(
      'type Query { other: String } type User { email: String }'
    );

    const merged = mergeSchemas([a, b]);
    const user = merged.getType('User') as GraphQLObjectType;

    expect(Object.keys(user.getFields())).toEqual(['id', 'email']);
  });

  test('should merge the fields of a shared input type', () => {
    const a = buildSchema(
      'input Filter { id: ID } type Query { a(f: Filter): String }'
    );
    const b = buildSchema(
      'input Filter { name: String } type Query { b(f: Filter): String }'
    );

    const merged = mergeSchemas([a, b]);
    const filter = merged.getType('Filter') as GraphQLInputObjectType;

    expect(Object.keys(filter.getFields())).toEqual(['id', 'name']);
  });

  test('should replace a definition with no field map under "last"', () => {
    const a = buildSchema('enum Status { ACTIVE } type Query { status: Status }');
    const b = buildSchema('enum Status { ARCHIVED } type Query { s: Status }');

    const merged = mergeSchemas([a, b], undefined, { onTypeConflict: 'last' });
    const status = merged.getType('Status') as GraphQLEnumType;

    expect(status.getValues().map((value) => value.name)).toEqual(['ARCHIVED']);
  });

  test('should throw for a duplicate definition with no field map under "error"', () => {
    const a = buildSchema('scalar DateTime type Query { now: DateTime }');
    const b = buildSchema('scalar DateTime type Query { then: DateTime }');

    expect(() =>
      mergeSchemas([a, b], undefined, { onTypeConflict: 'error' })
    ).toThrow('Type conflict: DateTime is defined multiple times');
  });

  test('should union the interfaces a shared type implements', () => {
    const a = buildSchema(
      'interface Node { id: ID! } type Query { user: User } type User implements Node { id: ID! }'
    );
    const b = buildSchema(
      'interface Timestamped { createdAt: String } type Query { u: User } type User implements Timestamped { createdAt: String }'
    );

    const merged = mergeSchemas([a, b]);
    const user = merged.getType('User') as GraphQLObjectType;

    expect(user.getInterfaces().map((i) => i.name).sort()).toEqual([
      'Node',
      'Timestamped',
    ]);
  });

  test('should let the first schema win a field conflict by default', async () => {
    const a = querySchema('hello', () => 'from A');
    const b = querySchema('hello', () => 'from B');

    const merged = mergeSchemas([a, b]);
    const result = await graphql({ schema: merged, source: '{ hello }' });

    expect(result.data?.hello).toBe('from A');
  });

  test('should let the last schema win a field conflict under "last"', async () => {
    const a = querySchema('hello', () => 'from A');
    const b = querySchema('hello', () => 'from B');

    const merged = mergeSchemas([a, b], undefined, {
      onTypeConflict: 'last',
    });
    const result = await graphql({ schema: merged, source: '{ hello }' });

    expect(result.data?.hello).toBe('from B');
  });

  test('should throw on a field conflict under "error"', () => {
    const a = querySchema('hello', () => 'from A');
    const b = querySchema('hello', () => 'from B');

    expect(() =>
      mergeSchemas([a, b], undefined, { onTypeConflict: 'error' })
    ).toThrow('Type conflict: Query.hello is defined multiple times');
  });

  test('should preserve isTypeOf across a merge', async () => {
    const cat = new GraphQLObjectType({
      name: 'Cat',
      fields: { name: { type: GraphQLString } },
      isTypeOf: (value) => (value as { meows?: boolean }).meows === true,
    });
    const dog = new GraphQLObjectType({
      name: 'Dog',
      fields: { name: { type: GraphQLString } },
      isTypeOf: (value) => (value as { barks?: boolean }).barks === true,
    });
    // No resolveType, so graphql-js falls back to each member's isTypeOf
    const pet = new GraphQLUnionType({ name: 'Pet', types: [cat, dog] });

    const a = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          pet: { type: pet, resolve: () => ({ barks: true, name: 'Rex' }) },
        },
      }),
    });
    const b = buildSchema('type Unrelated { x: String }');

    const merged = mergeSchemas([a, b]);
    const result = await graphql({
      schema: merged,
      source: '{ pet { __typename ... on Dog { name } } }',
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.pet).toEqual({ __typename: 'Dog', name: 'Rex' });
  });

  test('should preserve union resolveType across a merge', async () => {
    const cat = new GraphQLObjectType({
      name: 'Cat',
      fields: { name: { type: GraphQLString } },
    });
    const dog = new GraphQLObjectType({
      name: 'Dog',
      fields: { name: { type: GraphQLString } },
    });
    const pet = new GraphQLUnionType({
      name: 'Pet',
      types: [cat, dog],
      resolveType: () => 'Cat',
    });

    const a = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          pet: { type: pet, resolve: () => ({ name: 'Whiskers' }) },
        },
      }),
    });
    const b = buildSchema('type Unrelated { x: String }');

    const merged = mergeSchemas([a, b]);
    const result = await graphql({
      schema: merged,
      source: '{ pet { __typename ... on Cat { name } } }',
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.pet).toEqual({ __typename: 'Cat', name: 'Whiskers' });
  });

  test('should preserve interface resolveType and field resolvers across a merge', async () => {
    const idResolver = (): string => 'from-interface';

    const node = new GraphQLInterfaceType({
      name: 'Node',
      fields: { id: { type: GraphQLID, resolve: idResolver } },
      resolveType: () => 'User',
    });
    const user = new GraphQLObjectType({
      name: 'User',
      interfaces: [node],
      fields: { id: { type: GraphQLID, resolve: () => 'u1' } },
    });

    const a = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: { node: { type: node, resolve: () => ({}) } },
      }),
      types: [user],
    });
    const b = buildSchema('type Unrelated { x: String }');

    const merged = mergeSchemas([a, b]);

    const mergedNode = merged.getType('Node') as GraphQLInterfaceType;
    expect(mergedNode.getFields().id?.resolve).toBe(idResolver);

    const result = await graphql({
      schema: merged,
      source: '{ node { __typename id } }',
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.node).toEqual({ __typename: 'User', id: 'u1' });
  });

  test('should preserve subscribe functions across a merge', async () => {
    const a = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: { _: { type: GraphQLString } },
      }),
      subscription: new GraphQLObjectType({
        name: 'Subscription',
        fields: {
          ticks: {
            type: GraphQLInt,
            subscribe: async function* () {
              yield { ticks: 1 };
              yield { ticks: 2 };
            },
          },
        },
      }),
    });
    const b = buildSchema('type Unrelated { x: String }');

    const merged = mergeSchemas([a, b]);
    const result = await subscribe({
      schema: merged,
      document: parse('subscription { ticks }'),
    });

    const values: unknown[] = [];
    for await (const payload of result as AsyncIterable<ExecutionResult>) {
      expect(payload.errors).toBeUndefined();
      values.push(payload.data?.ticks);
    }

    expect(values).toEqual([1, 2]);
  });
});
