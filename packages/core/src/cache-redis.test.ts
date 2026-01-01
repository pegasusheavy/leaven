/**
 * @leaven-graphql/core - Redis document cache tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { parse } from 'graphql';
import { RedisDocumentCache, createRedisCache, type RedisClient } from './cache-redis';

/**
 * Mock Redis client for testing
 */
function createMockRedis(): RedisClient & { data: Map<string, { value: string; ttl?: number }> } {
  const data = new Map<string, { value: string; ttl?: number }>();

  return {
    data,
    async get(key: string) {
      const entry = data.get(key);
      return entry?.value ?? null;
    },
    async set(key: string, value: string, ...args: unknown[]) {
      const ttl = args[0] === 'EX' ? (args[1] as number) : undefined;
      data.set(key, { value, ttl });
      return 'OK';
    },
    async del(key: string | string[]) {
      const keys = Array.isArray(key) ? key : [key];
      let deleted = 0;
      for (const k of keys) {
        if (data.delete(k)) deleted++;
      }
      return deleted;
    },
    async exists(key: string | string[]) {
      const keys = Array.isArray(key) ? key : [key];
      return keys.filter((k) => data.has(k)).length;
    },
    async keys(pattern: string) {
      const prefix = pattern.replace('*', '');
      return Array.from(data.keys()).filter((k) => k.startsWith(prefix));
    },
    async incr(key: string) {
      const current = parseInt(data.get(key)?.value ?? '0', 10);
      data.set(key, { value: String(current + 1) });
      return current + 1;
    },
    async incrby(key: string, increment: number) {
      const current = parseInt(data.get(key)?.value ?? '0', 10);
      data.set(key, { value: String(current + increment) });
      return current + increment;
    },
    async expire(_key: string, _seconds: number) {
      return 1;
    },
    async ttl(key: string) {
      const entry = data.get(key);
      return entry?.ttl ?? -1;
    },
  };
}

describe('RedisDocumentCache', () => {
  let cache: RedisDocumentCache;
  let mockRedis: ReturnType<typeof createMockRedis>;

  beforeEach(() => {
    mockRedis = createMockRedis();
    cache = new RedisDocumentCache({
      client: mockRedis,
      prefix: 'test:doc:',
      ttl: 3600,
    });
  });

  describe('constructor', () => {
    test('should create cache with default options', () => {
      const defaultCache = new RedisDocumentCache({ client: mockRedis });
      expect(defaultCache).toBeInstanceOf(RedisDocumentCache);
    });

    test('should create cache with custom options', () => {
      const customCache = new RedisDocumentCache({
        client: mockRedis,
        prefix: 'custom:',
        ttl: 7200,
        maxSize: 5000,
      });
      expect(customCache).toBeInstanceOf(RedisDocumentCache);
    });
  });

  describe('set and get', () => {
    test('should store and retrieve a document', async () => {
      const query = '{ hello }';
      const document = parse(query);

      await cache.set(query, document);
      const retrieved = await cache.get(query);

      expect(retrieved).toBeDefined();
      expect(retrieved?.definitions.length).toBe(document.definitions.length);
    });

    test('should return null for non-existent query', async () => {
      const result = await cache.get('{ nonexistent }');
      expect(result).toBeNull();
    });

    test('should set TTL on entries', async () => {
      const query = '{ hello }';
      const document = parse(query);

      await cache.set(query, document);

      // Verify the key was set - exclude stats keys
      const keys = Array.from(mockRedis.data.keys()).filter(
        (k) => k.startsWith('test:doc:') && !k.includes('__stats__')
      );
      expect(keys.length).toBe(1);
    });
  });

  describe('getWithValidation', () => {
    test('should store and retrieve document with validation', async () => {
      const query = '{ hello }';
      const document = parse(query);
      const validation = { valid: true, errors: [] as const };

      await cache.setWithValidation(query, document, validation);
      const retrieved = await cache.getWithValidation(query);

      expect(retrieved).toBeDefined();
      expect(retrieved?.document.definitions.length).toBe(document.definitions.length);
      expect(retrieved?.validation?.valid).toBe(true);
    });

    test('should return null for non-existent query', async () => {
      const result = await cache.getWithValidation('{ nonexistent }');
      expect(result).toBeNull();
    });

    test('should handle validation errors with locations and paths', async () => {
      const query = '{ testQuery }';
      const document = parse('{ hello }');
      const mockError = {
        message: 'Field not found',
        locations: [{ line: 1, column: 3 }],
        path: ['hello'],
      } as unknown;
      const validation = { valid: false, errors: [mockError] as const };

      await cache.setWithValidation(query, document, validation);
      const retrieved = await cache.getWithValidation(query);

      expect(retrieved?.validation?.valid).toBe(false);
      expect(retrieved?.validation?.errors).toHaveLength(1);
      expect(retrieved?.validation?.errors[0].message).toBe('Field not found');
    });
  });

  describe('setValidation', () => {
    test('should update validation on existing cached document', async () => {
      const query = '{ hello }';
      const document = parse(query);

      // First, cache document without validation
      await cache.set(query, document);

      // Then add validation
      const validation = { valid: true, errors: [] as const };
      await cache.setValidation(query, validation);

      // Retrieve with validation
      const retrieved = await cache.getWithValidation(query);
      expect(retrieved?.validation?.valid).toBe(true);
    });

    test('should do nothing for non-cached query', async () => {
      const validation = { valid: true, errors: [] as const };
      // Should not throw
      await cache.setValidation('{ nonexistent }', validation);
    });
  });

  describe('has', () => {
    test('should return true for cached query', async () => {
      const query = '{ hello }';
      await cache.set(query, parse(query));

      expect(await cache.has(query)).toBe(true);
    });

    test('should return false for non-cached query', async () => {
      expect(await cache.has('{ missing }')).toBe(false);
    });
  });

  describe('delete', () => {
    test('should remove a cached document', async () => {
      const query = '{ hello }';
      await cache.set(query, parse(query));

      const deleted = await cache.delete(query);

      expect(deleted).toBe(true);
      expect(await cache.has(query)).toBe(false);
    });

    test('should return false when deleting non-existent entry', async () => {
      const deleted = await cache.delete('{ nonexistent }');
      expect(deleted).toBe(false);
    });
  });

  describe('clear', () => {
    test('should remove all cached documents', async () => {
      await cache.set('{ a }', parse('{ a }'));
      await cache.set('{ b }', parse('{ b }'));
      await cache.set('{ c }', parse('{ c }'));

      await cache.clear();

      expect(await cache.size).toBe(0);
    });
  });

  describe('size', () => {
    test('should return correct cache size', async () => {
      expect(await cache.size).toBe(0);

      await cache.set('{ a }', parse('{ a }'));
      expect(await cache.size).toBe(1);

      await cache.set('{ b }', parse('{ b }'));
      expect(await cache.size).toBe(2);
    });
  });

  describe('getStats', () => {
    test('should return statistics', async () => {
      await cache.set('{ a }', parse('{ a }'));
      await cache.get('{ a }');
      await cache.get('{ a }');

      const stats = await cache.getStats();

      expect(stats.size).toBe(1);
      expect(stats.entries).toBe(1);
      expect(stats.totalHits).toBeGreaterThan(0);
    });
  });

  describe('prune', () => {
    test('should return 0 (Redis handles TTL automatically)', async () => {
      const pruned = await cache.prune();
      expect(pruned).toBe(0);
    });
  });

  describe('compression', () => {
    test('should store compressed data when enabled', async () => {
      // Create a fresh mock Redis for compression tests
      const compressionMock = createMockRedis();
      const compressedCache = new RedisDocumentCache({
        client: compressionMock,
        prefix: 'compressed:',
        compress: true,
        compressionThreshold: 100,
      });

      // Create a large query that will trigger compression
      const largeQuery = `{
        users {
          id
          name
          email
          profile {
            avatar
            bio
            website
          }
        }
      }`;
      const document = parse(largeQuery);

      await compressedCache.set(largeQuery, document);

      // Verify something was stored
      const keys = Array.from(compressionMock.data.keys()).filter(
        (k) => k.startsWith('compressed:') && !k.includes('__stats__')
      );
      expect(keys.length).toBe(1);

      // Verify the stored data is compressed (contains z flag)
      const storedValue = compressionMock.data.get(keys[0])?.value;
      expect(storedValue).toBeDefined();
      const parsed = JSON.parse(storedValue!);
      expect(parsed.z).toBe(true); // Should be compressed
      expect(parsed.d).toBeDefined(); // Should have compressed data
    });

    test('should retrieve compressed documents', async () => {
      // Create a fresh mock Redis for compression tests
      const compressionMock = createMockRedis();
      const compressedCache = new RedisDocumentCache({
        client: compressionMock,
        prefix: 'compressed2:',
        compress: true,
        compressionThreshold: 100,
      });

      // Create a query that will be larger than 100 bytes when serialized
      const query = `{
        users {
          id
          name
          email
          age
          address {
            street
            city
          }
        }
      }`;
      const document = parse(query);

      await compressedCache.set(query, document);

      // Retrieve and verify
      const retrieved = await compressedCache.get(query);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.kind).toBe('Document');
      expect(retrieved?.definitions).toBeDefined();
    });

    test('should not compress small documents', async () => {
      const compressionMock = createMockRedis();
      const compressedCache = new RedisDocumentCache({
        client: compressionMock,
        prefix: 'small:',
        compress: true,
        compressionThreshold: 10000, // High threshold
      });

      const smallQuery = '{ hello }';
      const document = parse(smallQuery);

      await compressedCache.set(smallQuery, document);

      // Verify the stored data is NOT compressed
      const keys = Array.from(compressionMock.data.keys()).filter(
        (k) => k.startsWith('small:') && !k.includes('__stats__')
      );
      expect(keys.length).toBe(1);

      const storedValue = compressionMock.data.get(keys[0])?.value;
      const parsed = JSON.parse(storedValue!);
      expect(parsed.z).toBeUndefined(); // Should NOT be compressed

      // Retrieve and verify
      const retrieved = await compressedCache.get(smallQuery);
      expect(retrieved).toBeDefined();
    });
  });

  describe('createRedisCache', () => {
    test('should create a RedisDocumentCache instance', () => {
      const cache = createRedisCache({ client: mockRedis });
      expect(cache).toBeInstanceOf(RedisDocumentCache);
    });

    test('should create cache with custom config', () => {
      const cache = createRedisCache({
        client: mockRedis,
        prefix: 'custom:',
        ttl: 7200,
      });
      expect(cache).toBeInstanceOf(RedisDocumentCache);
    });
  });
});
