/**
 * @leaven-graphql/core - Compiler tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import { parse, buildSchema } from 'graphql';
import { CompiledQuery, compileQuery } from './compiler';

const schema = buildSchema(`
  type Query {
    hello: String
    user(id: ID!): User
    users(first: Int, after: String): [User!]!
  }
  type User {
    id: ID!
    name: String
    email: String
    posts: [Post!]!
  }
  type Post {
    id: ID!
    title: String
    content: String
  }
`);

describe('CompiledQuery', () => {
  describe('constructor', () => {
    test('should compile a simple query', () => {
      const document = parse('{ hello }');
      const compiled = new CompiledQuery(schema, document);

      expect(compiled.operationType).toBe('query');
      expect(compiled.operationName).toBeNull();
      expect(compiled.fields.length).toBe(1);
      expect(compiled.fields[0]?.name).toBe('hello');
    });

    test('should compile a named query', () => {
      const document = parse('query GetHello { hello }');
      const compiled = new CompiledQuery(schema, document, 'GetHello');

      expect(compiled.operationName).toBe('GetHello');
    });

    test('should throw for non-existent operation', () => {
      const document = parse('query GetHello { hello }');
      expect(() => new CompiledQuery(schema, document, 'NonExistent')).toThrow();
    });

    test('should handle nested fields', () => {
      const document = parse('{ user(id: "1") { id name posts { title } } }');
      const compiled = new CompiledQuery(schema, document);

      expect(compiled.fields.length).toBe(1);
      expect(compiled.fields[0]?.children.length).toBe(3);
    });
  });

  describe('variable extraction', () => {
    test('should extract required variables', () => {
      const document = parse(`
        query GetUser($id: ID!) {
          user(id: $id) { id name }
        }
      `);
      const compiled = new CompiledQuery(schema, document);

      expect(compiled.requiredVariables).toContain('id');
      expect(compiled.optionalVariables.length).toBe(0);
    });

    test('should extract optional variables', () => {
      const document = parse(`
        query GetUsers($first: Int = 10, $after: String) {
          users(first: $first, after: $after) { id }
        }
      `);
      const compiled = new CompiledQuery(schema, document);

      expect(compiled.optionalVariables).toContain('first');
      expect(compiled.optionalVariables).toContain('after');
      expect(compiled.requiredVariables.length).toBe(0);
    });
  });

  describe('validateVariables', () => {
    test('should validate required variables are present', () => {
      const document = parse(`
        query GetUser($id: ID!) {
          user(id: $id) { id }
        }
      `);
      const compiled = new CompiledQuery(schema, document);

      const result = compiled.validateVariables({ id: '1' });
      expect(result.valid).toBe(true);
      expect(result.missing.length).toBe(0);
    });

    test('should report missing required variables', () => {
      const document = parse(`
        query GetUser($id: ID!) {
          user(id: $id) { id }
        }
      `);
      const compiled = new CompiledQuery(schema, document);

      const result = compiled.validateVariables({});
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('id');
    });
  });

  describe('getFieldNames', () => {
    test('should return all field names', () => {
      const document = parse('{ user(id: "1") { id name posts { title } } }');
      const compiled = new CompiledQuery(schema, document);

      const names = compiled.getFieldNames();
      expect(names).toContain('user');
      expect(names).toContain('id');
      expect(names).toContain('name');
      expect(names).toContain('posts');
      expect(names).toContain('title');
    });
  });

  describe('complexity calculation', () => {
    test('should calculate complexity with option enabled', () => {
      const document = parse('{ user(id: "1") { id name posts { title } } }');
      const compiled = new CompiledQuery(schema, document, undefined, {
        calculateComplexity: true,
      });

      expect(compiled.complexity).toBeGreaterThan(0);
    });

    test('should return 0 complexity when disabled', () => {
      const document = parse('{ hello }');
      const compiled = new CompiledQuery(schema, document);

      expect(compiled.complexity).toBe(0);
    });
  });

  describe('fragments', () => {
    test('should handle fragment spreads', () => {
      const document = parse(`
        query GetUser {
          user(id: "1") {
            ...UserFields
          }
        }
        fragment UserFields on User {
          id
          name
        }
      `);
      const compiled = new CompiledQuery(schema, document);

      expect(compiled.fields[0]?.children.length).toBe(2);
    });

    test('should handle inline fragments', () => {
      const document = parse(`
        query GetUser {
          user(id: "1") {
            ... on User {
              id
              name
            }
          }
        }
      `);
      const compiled = new CompiledQuery(schema, document);

      expect(compiled.fields[0]?.children.length).toBe(2);
    });
  });

  describe('arguments extraction', () => {
    test('should extract literal arguments', () => {
      const document = parse('{ user(id: "123") { id } }');
      const compiled = new CompiledQuery(schema, document);

      expect(compiled.fields[0]?.arguments.id).toBe('123');
    });

    test('should mark variable arguments', () => {
      const document = parse(`
        query GetUser($id: ID!) {
          user(id: $id) { id }
        }
      `);
      const compiled = new CompiledQuery(schema, document);

      const arg = compiled.fields[0]?.arguments.id as { __variable: string };
      expect(arg.__variable).toBe('id');
    });

    test('should handle list arguments', () => {
      const document = parse('{ users(first: 10) { id } }');
      const compiled = new CompiledQuery(schema, document);

      expect(compiled.fields[0]?.arguments.first).toBe(10);
    });
  });
});

describe('compileQuery', () => {
  test('should create a CompiledQuery', () => {
    const document = parse('{ hello }');
    const compiled = compileQuery(schema, document);

    expect(compiled).toBeInstanceOf(CompiledQuery);
  });

  test('should pass options to CompiledQuery', () => {
    const document = parse('{ hello }');
    const compiled = compileQuery(schema, document, undefined, {
      calculateComplexity: true,
    });

    expect(compiled.complexity).toBeGreaterThan(0);
  });
});
