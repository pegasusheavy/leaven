/**
 * @leaven-graphql/core - Registry tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { buildSchema } from 'graphql';
import { OperationRegistry, createOperationRegistry } from './registry';

const schema = buildSchema(`
  type Query {
    hello: String
    user(id: ID!): User
  }
  type Mutation {
    createUser(name: String!): User
  }
  type User {
    id: ID!
    name: String
  }
`);

describe('OperationRegistry', () => {
  let registry: OperationRegistry;

  beforeEach(() => {
    registry = new OperationRegistry({ schema });
  });

  describe('register', () => {
    test('should register a valid query', () => {
      const operation = registry.register('{ hello }');

      expect(operation.id).toBeDefined();
      expect(operation.query).toBe('{ hello }');
      expect(operation.operationType).toBe('query');
    });

    test('should register with custom ID', () => {
      const operation = registry.register('{ hello }', { id: 'custom-id' });

      expect(operation.id).toBe('custom-id');
    });

    test('should register with custom name', () => {
      const operation = registry.register('query GetHello { hello }', {
        name: 'GetHello',
      });

      expect(operation.name).toBe('GetHello');
    });

    test('should return existing operation for same query', () => {
      const op1 = registry.register('{ hello }');
      const op2 = registry.register('{ hello }');

      expect(op1.id).toBe(op2.id);
    });

    test('should throw for conflicting ID with different query', () => {
      registry.register('{ hello }', { id: 'my-id' });

      expect(() =>
        registry.register('{ user(id: "1") { id } }', { id: 'my-id' })
      ).toThrow(/already registered/);
    });

    test('should throw for invalid query', () => {
      expect(() => registry.register('{ nonexistent }')).toThrow();
    });

    test('should throw for query without operation', () => {
      // Fragments without operations throw validation errors
      expect(() => registry.register('fragment F on User { id }')).toThrow();
    });

    test('should detect mutation operations', () => {
      const operation = registry.register(
        'mutation { createUser(name: "John") { id } }'
      );

      expect(operation.operationType).toBe('mutation');
    });
  });

  describe('registerAll', () => {
    test('should register multiple operations', () => {
      const operations = registry.registerAll([
        { query: '{ hello }' },
        { query: 'query GetUser { user(id: "1") { id } }' },
      ]);

      expect(operations.length).toBe(2);
      expect(registry.size).toBe(2);
    });

    test('should handle custom IDs and names', () => {
      const operations = registry.registerAll([
        { query: '{ hello }', id: 'hello-query', name: 'GetHello' },
      ]);

      expect(operations[0]?.id).toBe('hello-query');
      expect(operations[0]?.name).toBe('GetHello');
    });
  });

  describe('get', () => {
    test('should get a registered operation', () => {
      const registered = registry.register('{ hello }');
      const retrieved = registry.get(registered.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(registered.id);
    });

    test('should return null for non-existent ID', () => {
      expect(registry.get('nonexistent')).toBeNull();
    });
  });

  describe('getByHash', () => {
    test('should get operation by hash', () => {
      const registered = registry.register('{ hello }');
      const retrieved = registry.getByHash(registered.hash);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(registered.id);
    });

    test('should match partial hash', () => {
      const registered = registry.register('{ hello }');
      const retrieved = registry.getByHash(registered.hash.slice(0, 8));

      expect(retrieved).toBeDefined();
    });

    test('should return null for non-existent hash', () => {
      expect(registry.getByHash('abc123')).toBeNull();
    });
  });

  describe('has', () => {
    test('should return true for registered operation', () => {
      const op = registry.register('{ hello }');
      expect(registry.has(op.id)).toBe(true);
    });

    test('should return false for non-registered operation', () => {
      expect(registry.has('nonexistent')).toBe(false);
    });
  });

  describe('hasHash', () => {
    test('should return true for registered hash', () => {
      const op = registry.register('{ hello }');
      expect(registry.hasHash(op.hash)).toBe(true);
    });

    test('should return false for non-registered hash', () => {
      expect(registry.hasHash('nonexistent')).toBe(false);
    });
  });

  describe('unregister', () => {
    test('should remove a registered operation', () => {
      const op = registry.register('{ hello }');
      const result = registry.unregister(op.id);

      expect(result).toBe(true);
      expect(registry.has(op.id)).toBe(false);
    });

    test('should return false for non-existent operation', () => {
      expect(registry.unregister('nonexistent')).toBe(false);
    });
  });

  describe('clear', () => {
    test('should remove all operations', () => {
      registry.register('{ hello }');
      registry.register('query GetUser { user(id: "1") { id } }');

      registry.clear();

      expect(registry.size).toBe(0);
    });
  });

  describe('size', () => {
    test('should return correct count', () => {
      expect(registry.size).toBe(0);

      registry.register('{ hello }');
      expect(registry.size).toBe(1);

      registry.register('query GetUser { user(id: "1") { id } }');
      expect(registry.size).toBe(2);
    });
  });

  describe('getAll', () => {
    test('should return all operations', () => {
      registry.register('{ hello }');
      registry.register('query GetUser { user(id: "1") { id } }');

      const all = registry.getAll();
      expect(all.length).toBe(2);
    });
  });

  describe('getByType', () => {
    test('should filter by operation type', () => {
      registry.register('{ hello }');
      registry.register('mutation { createUser(name: "John") { id } }');

      const queries = registry.getByType('query');
      const mutations = registry.getByType('mutation');

      expect(queries.length).toBe(1);
      expect(mutations.length).toBe(1);
    });
  });

  describe('export', () => {
    test('should export registry as JSON', () => {
      registry.register('{ hello }', { id: 'hello' });
      registry.register('mutation { createUser(name: "John") { id } }', {
        id: 'create-user',
      });

      const exported = registry.export();

      expect(exported.hello).toBeDefined();
      expect(exported.hello.query).toBe('{ hello }');
      expect(exported['create-user'].type).toBe('mutation');
    });
  });

  describe('import', () => {
    test('should import operations from exported data', () => {
      const data = {
        hello: { query: '{ hello }' },
        'get-user': { query: 'query GetUser { user(id: "1") { id } }' },
      };

      const imported = registry.import(data);

      expect(imported).toBe(2);
      expect(registry.size).toBe(2);
    });

    test('should skip invalid operations', () => {
      const data = {
        hello: { query: '{ hello }' },
        invalid: { query: '{ nonexistent }' },
      };

      const imported = registry.import(data);

      expect(imported).toBe(1);
    });
  });

  describe('compiled queries', () => {
    test('should compile queries when enabled', () => {
      const compilingRegistry = new OperationRegistry({
        schema,
        compile: true,
      });

      const op = compilingRegistry.register('{ hello }');

      expect(op.compiled).toBeDefined();
    });
  });
});

describe('createOperationRegistry', () => {
  test('should create an OperationRegistry', () => {
    const registry = createOperationRegistry({ schema });
    expect(registry).toBeInstanceOf(OperationRegistry);
  });
});
