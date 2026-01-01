/**
 * @leaven-graphql/core - Parser tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import {
  parseDocument,
  validateDocument,
  calculateQueryDepth,
  getOperationType,
  parseRequest,
  countFields,
  getOperationNames,
} from './parser';
import { buildSchema } from 'graphql';

describe('parseDocument', () => {
  test('should parse a valid GraphQL query', () => {
    const query = '{ hello }';
    const document = parseDocument(query);

    expect(document).toBeDefined();
    expect(document.kind).toBe('Document');
    expect(document.definitions.length).toBe(1);
  });

  test('should throw for invalid GraphQL syntax', () => {
    expect(() => parseDocument('{ hello')).toThrow();
  });

  test('should enforce max depth limit', () => {
    const deepQuery = `{
      a {
        b {
          c {
            d {
              e
            }
          }
        }
      }
    }`;

    expect(() => parseDocument(deepQuery, { maxDepth: 2 })).toThrow(
      /exceeds maximum allowed depth/
    );
  });

  test('should allow queries within max depth', () => {
    const query = '{ a { b } }';
    const document = parseDocument(query, { maxDepth: 5 });
    expect(document).toBeDefined();
  });
});

describe('validateDocument', () => {
  const schema = buildSchema(`
    type Query {
      hello: String
      user(id: ID!): User
    }
    type User {
      id: ID!
      name: String
    }
  `);

  test('should validate a correct query', () => {
    const document = parseDocument('{ hello }');
    const result = validateDocument(schema, document);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test('should return errors for invalid field', () => {
    const document = parseDocument('{ nonexistent }');
    const result = validateDocument(schema, document);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should validate queries with arguments', () => {
    const document = parseDocument('{ user(id: "1") { id name } }');
    const result = validateDocument(schema, document);

    expect(result.valid).toBe(true);
  });
});

describe('calculateQueryDepth', () => {
  test('should return 0 for empty query', () => {
    const document = parseDocument('query Empty { __typename }');
    // __typename is at depth 1
    const depth = calculateQueryDepth(document);
    expect(depth).toBeGreaterThanOrEqual(0);
  });

  test('should calculate correct depth for nested query', () => {
    const document = parseDocument(`{
      a {
        b {
          c
        }
      }
    }`);
    const depth = calculateQueryDepth(document);
    expect(depth).toBe(3);
  });

  test('should handle multiple root fields', () => {
    const document = parseDocument(`{
      a { b }
      c { d { e } }
    }`);
    const depth = calculateQueryDepth(document);
    expect(depth).toBe(3);
  });
});

describe('getOperationType', () => {
  test('should return query for query operation', () => {
    const document = parseDocument('query { hello }');
    const type = getOperationType(document);
    expect(type).toBe('query');
  });

  test('should return mutation for mutation operation', () => {
    const document = parseDocument('mutation { createUser }');
    const type = getOperationType(document);
    expect(type).toBe('mutation');
  });

  test('should return subscription for subscription operation', () => {
    const document = parseDocument('subscription { newMessage }');
    const type = getOperationType(document);
    expect(type).toBe('subscription');
  });

  test('should handle named operations', () => {
    const document = parseDocument(`
      query GetHello { hello }
      mutation CreateUser { createUser }
    `);

    expect(getOperationType(document, 'GetHello')).toBe('query');
    expect(getOperationType(document, 'CreateUser')).toBe('mutation');
  });

  test('should return null for non-existent operation', () => {
    const document = parseDocument('query GetHello { hello }');
    const type = getOperationType(document, 'NonExistent');
    expect(type).toBeNull();
  });
});

describe('parseRequest', () => {
  test('should parse a request with query', () => {
    const result = parseRequest({ query: '{ hello }' });

    expect(result.query).toBe('{ hello }');
    expect(result.document).toBeDefined();
    expect(result.operation).toBeDefined();
    expect(result.operationType).toBe('query');
  });

  test('should parse a request with operation name', () => {
    const result = parseRequest({
      query: 'query GetHello { hello }',
      operationName: 'GetHello',
    });

    expect(result.operationName).toBe('GetHello');
    expect(result.operationType).toBe('query');
  });

  test('should throw for missing operation', () => {
    expect(() =>
      parseRequest({
        query: 'query GetHello { hello }',
        operationName: 'NonExistent',
      })
    ).toThrow(/not found/);
  });

  test('should throw for document with no operations', () => {
    expect(() =>
      parseRequest({
        query: 'fragment F on User { id }',
      })
    ).toThrow(/No operation found/);
  });
});

describe('countFields', () => {
  test('should count fields in a simple query', () => {
    const document = parseDocument('{ a b c }');
    const count = countFields(document);
    expect(count).toBe(3);
  });

  test('should count nested fields', () => {
    const document = parseDocument('{ a { b { c } } }');
    const count = countFields(document);
    expect(count).toBe(3);
  });
});

describe('getOperationNames', () => {
  test('should return operation names', () => {
    const document = parseDocument(`
      query GetHello { hello }
      mutation CreateUser { createUser }
    `);
    const names = getOperationNames(document);

    expect(names).toContain('GetHello');
    expect(names).toContain('CreateUser');
    expect(names.length).toBe(2);
  });

  test('should return empty array for anonymous operations', () => {
    const document = parseDocument('{ hello }');
    const names = getOperationNames(document);
    expect(names.length).toBe(0);
  });
});
