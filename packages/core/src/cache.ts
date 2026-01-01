/**
 * @leaven-graphql/core - Document caching
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { DocumentNode } from 'graphql';
import type { IDocumentCache, CachedValidation, CacheStats } from './cache-interface';

// Re-export interface types
export type { IDocumentCache, CachedValidation, CacheStats } from './cache-interface';
export { isPromise, resolveValue } from './cache-interface';

/**
 * Configuration for the document cache
 */
export interface DocumentCacheConfig {
  /** Maximum number of entries to cache (default: 1000) */
  maxSize?: number;
  /** TTL for cache entries in milliseconds (default: 0 = no expiry) */
  ttl?: number;
  /** Enable LRU eviction (default: true) */
  lru?: boolean;
  /** Maximum query length to use as direct key (avoids hashing, default: 256) */
  directKeyMaxLength?: number;
}

/**
 * A cached document entry
 */
export interface CacheEntry {
  /** The parsed document */
  document: DocumentNode;
  /** Cached validation result (if validated) */
  validation?: CachedValidation;
  /** When this entry was created */
  createdAt: number;
  /** Last access time for LRU */
  lastAccess: number;
  /** Number of times this entry was accessed */
  hits: number;
}

/**
 * In-memory document cache for storing parsed GraphQL documents
 * Implements the IDocumentCache interface for interchangeability with Redis
 */
export class DocumentCache implements IDocumentCache {
  private readonly cache: Map<string, CacheEntry>;
  private readonly maxSize: number;
  private readonly ttl: number;
  private readonly lru: boolean;
  private readonly directKeyMaxLength: number;

  constructor(config: DocumentCacheConfig = {}) {
    this.cache = new Map();
    this.maxSize = config.maxSize ?? 1000;
    this.ttl = config.ttl ?? 0;
    this.lru = config.lru ?? true;
    this.directKeyMaxLength = config.directKeyMaxLength ?? 256;
  }

  /**
   * Generate a cache key for a query string
   * Uses direct string for small queries, fast Bun.hash for larger ones
   */
  private generateKey(query: string): string {
    // For small queries, use the query string directly (avoids hashing overhead)
    if (query.length <= this.directKeyMaxLength) {
      return query;
    }
    // Use Bun's fast hash function for larger queries
    return `h:${Bun.hash(query).toString(36)}`;
  }

  /**
   * Check if an entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    if (this.ttl === 0) return false;
    return Date.now() - entry.createdAt > this.ttl;
  }

  /**
   * Evict the least recently used entry
   */
  private evictLRU(): void {
    if (!this.lru || this.cache.size === 0) return;

    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get a document from the cache
   */
  public get(query: string): DocumentNode | null {
    const key = this.generateKey(query);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    // Update LRU tracking
    entry.lastAccess = Date.now();
    entry.hits++;

    return entry.document;
  }

  /**
   * Set a document in the cache
   */
  public set(query: string, document: DocumentNode): void {
    const key = this.generateKey(query);

    // Evict if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const now = Date.now();
    this.cache.set(key, {
      document,
      createdAt: now,
      lastAccess: now,
      hits: 0,
    });
  }

  /**
   * Get a document with its validation result from the cache
   */
  public getWithValidation(query: string): { document: DocumentNode; validation?: CachedValidation } | null {
    const key = this.generateKey(query);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    // Update LRU tracking
    entry.lastAccess = Date.now();
    entry.hits++;

    return { document: entry.document, validation: entry.validation };
  }

  /**
   * Set validation result for a cached document
   */
  public setValidation(query: string, validation: CachedValidation): void {
    const key = this.generateKey(query);
    const entry = this.cache.get(key);

    if (entry) {
      entry.validation = validation;
    }
  }

  /**
   * Set document with validation result in a single operation
   */
  public setWithValidation(query: string, document: DocumentNode, validation: CachedValidation): void {
    const key = this.generateKey(query);

    // Evict if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const now = Date.now();
    this.cache.set(key, {
      document,
      validation,
      createdAt: now,
      lastAccess: now,
      hits: 0,
    });
  }

  /**
   * Check if a query is in the cache
   */
  public has(query: string): boolean {
    const key = this.generateKey(query);
    const entry = this.cache.get(key);

    if (!entry) return false;
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove a query from the cache
   */
  public delete(query: string): boolean {
    const key = this.generateKey(query);
    return this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current cache size
   */
  public get size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      totalHits,
      entries: this.cache.size,
    };
  }

  /**
   * Prune expired entries
   */
  public prune(): number {
    let pruned = 0;
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        pruned++;
      }
    }
    return pruned;
  }
}

/**
 * Create a new document cache
 */
export function createDocumentCache(config?: DocumentCacheConfig): DocumentCache {
  return new DocumentCache(config);
}
