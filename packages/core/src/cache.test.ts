/**
 * @leaven-graphql/core - Document cache tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { parse } from 'graphql';
import { DocumentCache, createDocumentCache } from './cache';

describe('DocumentCache', () => {
  let cache: DocumentCache;

  beforeEach(() => {
    cache = new DocumentCache();
  });

  describe('constructor', () => {
    test('should create cache with default options', () => {
      expect(cache.size).toBe(0);
    });

    test('should create cache with custom options', () => {
      const customCache = new DocumentCache({
        maxSize: 500,
        ttl: 30000,
        lru: false,
      });
      expect(customCache.size).toBe(0);
    });
  });

  describe('set and get', () => {
    test('should store and retrieve a document', () => {
      const query = '{ hello }';
      const document = parse(query);

      cache.set(query, document);
      const retrieved = cache.get(query);

      expect(retrieved).toBeDefined();
      expect(retrieved?.definitions.length).toBe(document.definitions.length);
    });

    test('should return null for non-existent query', () => {
      const result = cache.get('{ nonexistent }');
      expect(result).toBeNull();
    });

    test('should update access time on get', () => {
      const query = '{ hello }';
      const document = parse(query);

      cache.set(query, document);

      // Get the document multiple times
      cache.get(query);
      cache.get(query);

      const stats = cache.getStats();
      expect(stats.totalHits).toBeGreaterThan(0);
    });
  });

  describe('has', () => {
    test('should return true for cached query', () => {
      const query = '{ hello }';
      cache.set(query, parse(query));

      expect(cache.has(query)).toBe(true);
    });

    test('should return false for non-cached query', () => {
      expect(cache.has('{ missing }')).toBe(false);
    });
  });

  describe('delete', () => {
    test('should remove a cached document', () => {
      const query = '{ hello }';
      cache.set(query, parse(query));

      const deleted = cache.delete(query);

      expect(deleted).toBe(true);
      expect(cache.has(query)).toBe(false);
    });

    test('should return false when deleting non-existent entry', () => {
      const deleted = cache.delete('{ nonexistent }');
      expect(deleted).toBe(false);
    });
  });

  describe('clear', () => {
    test('should remove all cached documents', () => {
      cache.set('{ a }', parse('{ a }'));
      cache.set('{ b }', parse('{ b }'));
      cache.set('{ c }', parse('{ c }'));

      cache.clear();

      expect(cache.size).toBe(0);
    });
  });

  describe('size', () => {
    test('should return correct cache size', () => {
      expect(cache.size).toBe(0);

      cache.set('{ a }', parse('{ a }'));
      expect(cache.size).toBe(1);

      cache.set('{ b }', parse('{ b }'));
      expect(cache.size).toBe(2);
    });
  });

  describe('LRU eviction', () => {
    test('should evict least recently used entry when at capacity', async () => {
      const smallCache = new DocumentCache({ maxSize: 2, lru: true });

      smallCache.set('{ a }', parse('{ a }'));
      await new Promise((r) => setTimeout(r, 20)); // Ensure different timestamps
      smallCache.set('{ b }', parse('{ b }'));
      await new Promise((r) => setTimeout(r, 20)); // Ensure different timestamps

      // Access 'a' to make it more recent
      smallCache.get('{ a }');
      await new Promise((r) => setTimeout(r, 20)); // Ensure update

      // Add a third entry, should evict something
      smallCache.set('{ c }', parse('{ c }'));

      // Verify cache doesn't exceed maxSize
      expect(smallCache.size).toBe(2);
      // At least 'c' should be there
      expect(smallCache.has('{ c }')).toBe(true);
    });
  });

  describe('TTL expiry', () => {
    test('should expire entries after TTL', async () => {
      const ttlCache = new DocumentCache({ ttl: 50 });

      ttlCache.set('{ a }', parse('{ a }'));
      expect(ttlCache.has('{ a }')).toBe(true);

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(ttlCache.has('{ a }')).toBe(false);
      expect(ttlCache.get('{ a }')).toBeNull();
    });
  });

  describe('prune', () => {
    test('should remove expired entries', async () => {
      const ttlCache = new DocumentCache({ ttl: 50 });

      ttlCache.set('{ a }', parse('{ a }'));
      ttlCache.set('{ b }', parse('{ b }'));

      await new Promise((resolve) => setTimeout(resolve, 100));

      const pruned = ttlCache.prune();
      expect(pruned).toBe(2);
      expect(ttlCache.size).toBe(0);
    });
  });

  describe('getStats', () => {
    test('should return correct statistics', () => {
      cache.set('{ a }', parse('{ a }'));
      cache.get('{ a }');
      cache.get('{ a }');

      const stats = cache.getStats();

      expect(stats.size).toBe(1);
      expect(stats.entries).toBe(1);
      expect(stats.totalHits).toBe(2);
      expect(stats.hitRate).toBe(2);
    });

    test('should return zero hit rate for empty cache', () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('validation caching', () => {
    test('should store and retrieve document with validation', () => {
      const query = '{ hello }';
      const document = parse(query);
      const validation = { valid: true, errors: [] as const };

      cache.setWithValidation(query, document, validation);
      const retrieved = cache.getWithValidation(query);

      expect(retrieved).toBeDefined();
      expect(retrieved?.document.definitions.length).toBe(document.definitions.length);
      expect(retrieved?.validation?.valid).toBe(true);
      expect(retrieved?.validation?.errors).toHaveLength(0);
    });

    test('should return null for non-existent query with getWithValidation', () => {
      const result = cache.getWithValidation('{ nonexistent }');
      expect(result).toBeNull();
    });

    test('should set validation on existing cached document', () => {
      const query = '{ hello }';
      const document = parse(query);

      // First, cache document without validation
      cache.set(query, document);

      // Then add validation
      const validation = { valid: true, errors: [] as const };
      cache.setValidation(query, validation);

      // Retrieve with validation
      const retrieved = cache.getWithValidation(query);
      expect(retrieved?.validation?.valid).toBe(true);
    });

    test('should handle invalid validation result', () => {
      const query = '{ hello }';
      const document = parse(query);
      const mockError = { message: 'Invalid field' } as unknown;
      const validation = { valid: false, errors: [mockError] as const };

      cache.setWithValidation(query, document, validation);
      const retrieved = cache.getWithValidation(query);

      expect(retrieved?.validation?.valid).toBe(false);
      expect(retrieved?.validation?.errors).toHaveLength(1);
    });

    test('setValidation should do nothing for non-cached query', () => {
      const validation = { valid: true, errors: [] as const };
      // Should not throw
      cache.setValidation('{ nonexistent }', validation);
    });

    test('getWithValidation should update LRU tracking', () => {
      const query = '{ hello }';
      cache.set(query, parse(query));

      // Get multiple times
      cache.getWithValidation(query);
      cache.getWithValidation(query);

      const stats = cache.getStats();
      expect(stats.totalHits).toBeGreaterThan(0);
    });

    test('getWithValidation should return null for expired entry', async () => {
      const ttlCache = new DocumentCache({ ttl: 50 });
      const query = '{ hello }';
      const validation = { valid: true, errors: [] as const };

      ttlCache.setWithValidation(query, parse(query), validation);
      expect(ttlCache.getWithValidation(query)).not.toBeNull();

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(ttlCache.getWithValidation(query)).toBeNull();
    });
  });

  describe('direct key optimization', () => {
    test('should use direct key for small queries', () => {
      // Small query should use direct key (no hashing)
      const smallQuery = '{ hello }';
      cache.set(smallQuery, parse(smallQuery));
      expect(cache.has(smallQuery)).toBe(true);
    });

    test('should hash large queries', () => {
      // Large query should be hashed
      const largeQuery = `{
        ${'user'.repeat(100)} {
          id
          name
          email
        }
      }`;
      cache.set(largeQuery, parse(largeQuery));
      expect(cache.has(largeQuery)).toBe(true);
    });

    test('should respect custom directKeyMaxLength', () => {
      const customCache = new DocumentCache({ directKeyMaxLength: 5 });
      const query = '{ hello }'; // Longer than 5 chars
      customCache.set(query, parse(query));
      expect(customCache.has(query)).toBe(true);
    });
  });

  describe('createDocumentCache', () => {
    test('should create a DocumentCache instance', () => {
      const cache = createDocumentCache();
      expect(cache).toBeInstanceOf(DocumentCache);
    });

    test('should create cache with custom config', () => {
      const cache = createDocumentCache({ maxSize: 100 });
      expect(cache).toBeInstanceOf(DocumentCache);
    });
  });
});
