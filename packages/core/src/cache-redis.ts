/**
 * @leaven-graphql/core - Redis document cache
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { DocumentNode } from 'graphql';
import type { IDocumentCache, CachedValidation, CacheStats } from './cache-interface';

/**
 * Redis client interface (compatible with ioredis and node-redis)
 */
export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
  del(key: string | string[]): Promise<number>;
  exists(key: string | string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  incr(key: string): Promise<number>;
  incrby(key: string, increment: number): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
  dbsize?(): Promise<number>;
  flushdb?(): Promise<string>;
}

/**
 * Configuration for Redis document cache
 */
export interface RedisCacheConfig {
  /** Redis client instance */
  client: RedisClient;
  /** Key prefix for all cache entries (default: 'leaven:doc:') */
  prefix?: string;
  /** TTL for cache entries in seconds (default: 3600 = 1 hour) */
  ttl?: number;
  /** Maximum number of entries to cache (default: 10000, 0 = unlimited) */
  maxSize?: number;
  /** Enable compression for large documents (default: false) */
  compress?: boolean;
  /** Compression threshold in bytes (default: 1024) */
  compressionThreshold?: number;
}

/**
 * Serialized cache entry for Redis storage
 */
interface SerializedEntry {
  /** Serialized document (JSON string) */
  d: string;
  /** Validation result */
  v?: {
    valid: boolean;
    errors: Array<{ message: string; locations?: readonly unknown[]; path?: readonly unknown[] }>;
  };
  /** Created timestamp */
  c: number;
  /** Compressed flag */
  z?: boolean;
}

/**
 * Redis-backed document cache for distributed GraphQL deployments
 */
export class RedisDocumentCache implements IDocumentCache {
  private readonly client: RedisClient;
  private readonly prefix: string;
  private readonly ttl: number;
  private readonly maxSize: number;
  private readonly compress: boolean;
  private readonly compressionThreshold: number;
  private readonly statsKey: string;

  constructor(config: RedisCacheConfig) {
    this.client = config.client;
    this.prefix = config.prefix ?? 'leaven:doc:';
    this.ttl = config.ttl ?? 3600;
    this.maxSize = config.maxSize ?? 10000;
    this.compress = config.compress ?? false;
    this.compressionThreshold = config.compressionThreshold ?? 1024;
    this.statsKey = `${this.prefix}__stats__`;
  }

  /**
   * Generate a cache key for a query string
   */
  private generateKey(query: string): string {
    const hash = Bun.hash(query).toString(36);
    return `${this.prefix}${hash}`;
  }

  /**
   * Serialize a document for Redis storage
   */
  private serialize(document: DocumentNode, validation?: CachedValidation): string {
    const entry: SerializedEntry = {
      d: JSON.stringify(document),
      c: Date.now(),
    };

    if (validation) {
      entry.v = {
        valid: validation.valid,
        errors: validation.errors.map((e) => ({
          message: e.message,
          locations: e.locations,
          path: e.path,
        })),
      };
    }

    const serialized = JSON.stringify(entry);

    // Compress if enabled and above threshold
    if (this.compress && serialized.length > this.compressionThreshold) {
      const compressed = Bun.gzipSync(serialized);
      return JSON.stringify({ z: true, d: Buffer.from(compressed).toString('base64') });
    }

    return serialized;
  }

  /**
   * Deserialize a document from Redis storage
   */
  private deserialize(data: string): { document: DocumentNode; validation?: CachedValidation } | null {
    try {
      const parsed = JSON.parse(data);

      // Handle compressed data
      if (parsed.z) {
        const buffer = Buffer.from(parsed.d, 'base64');
        const decompressed = Bun.gunzipSync(new Uint8Array(buffer));
        return this.deserialize(new TextDecoder().decode(decompressed));
      }

      const entry = parsed as SerializedEntry;
      const document = JSON.parse(entry.d) as DocumentNode;

      let validation: CachedValidation | undefined;
      if (entry.v) {
        validation = {
          valid: entry.v.valid,
          errors: entry.v.errors.map((e) => ({
            message: e.message,
            locations: e.locations,
            path: e.path,
            toJSON: () => e,
          })) as unknown as readonly import('graphql').GraphQLError[],
        };
      }

      return { document, validation };
    } catch {
      return null;
    }
  }

  /**
   * Get a document from the cache
   */
  public async get(query: string): Promise<DocumentNode | null> {
    const key = this.generateKey(query);
    const data = await this.client.get(key);

    if (!data) {
      return null;
    }

    const result = this.deserialize(data);
    if (result) {
      // Increment hit counter
      await this.client.incr(`${this.statsKey}:hits`);
      return result.document;
    }

    return null;
  }

  /**
   * Set a document in the cache
   */
  public async set(query: string, document: DocumentNode): Promise<void> {
    const key = this.generateKey(query);
    const serialized = this.serialize(document);

    if (this.ttl > 0) {
      await this.client.set(key, serialized, 'EX', this.ttl);
    } else {
      await this.client.set(key, serialized);
    }

    // Track size if maxSize is set
    if (this.maxSize > 0) {
      await this.client.incr(`${this.statsKey}:size`);
      // Note: Actual eviction would need a separate background process
      // or use Redis's built-in LRU with maxmemory-policy
    }
  }

  /**
   * Get a document with its validation result from the cache
   */
  public async getWithValidation(
    query: string
  ): Promise<{ document: DocumentNode; validation?: CachedValidation } | null> {
    const key = this.generateKey(query);
    const data = await this.client.get(key);

    if (!data) {
      return null;
    }

    const result = this.deserialize(data);
    if (result) {
      await this.client.incr(`${this.statsKey}:hits`);
      return result;
    }

    return null;
  }

  /**
   * Set validation result for a cached document
   */
  public async setValidation(query: string, validation: CachedValidation): Promise<void> {
    const key = this.generateKey(query);
    const data = await this.client.get(key);

    if (!data) {
      return;
    }

    const result = this.deserialize(data);
    if (result) {
      const serialized = this.serialize(result.document, validation);
      const currentTtl = await this.client.ttl(key);

      if (currentTtl > 0) {
        await this.client.set(key, serialized, 'EX', currentTtl);
      } else {
        await this.client.set(key, serialized);
      }
    }
  }

  /**
   * Set document with validation result in a single operation
   */
  public async setWithValidation(
    query: string,
    document: DocumentNode,
    validation: CachedValidation
  ): Promise<void> {
    const key = this.generateKey(query);
    const serialized = this.serialize(document, validation);

    if (this.ttl > 0) {
      await this.client.set(key, serialized, 'EX', this.ttl);
    } else {
      await this.client.set(key, serialized);
    }

    if (this.maxSize > 0) {
      await this.client.incr(`${this.statsKey}:size`);
    }
  }

  /**
   * Check if a query is in the cache
   */
  public async has(query: string): Promise<boolean> {
    const key = this.generateKey(query);
    const exists = await this.client.exists(key);
    return exists > 0;
  }

  /**
   * Remove a query from the cache
   */
  public async delete(query: string): Promise<boolean> {
    const key = this.generateKey(query);
    const deleted = await this.client.del(key);

    if (deleted > 0 && this.maxSize > 0) {
      await this.client.incrby(`${this.statsKey}:size`, -1);
    }

    return deleted > 0;
  }

  /**
   * Clear the entire cache
   */
  public async clear(): Promise<void> {
    const keys = await this.client.keys(`${this.prefix}*`);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  /**
   * Get the current cache size
   */
  public get size(): Promise<number> {
    return this.getSize();
  }

  private async getSize(): Promise<number> {
    const keys = await this.client.keys(`${this.prefix}*`);
    // Exclude stats keys
    return keys.filter((k) => !k.includes('__stats__')).length;
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<CacheStats> {
    const [size, hits] = await Promise.all([
      this.getSize(),
      this.client.get(`${this.statsKey}:hits`).then((v) => parseInt(v || '0', 10)),
    ]);

    return {
      size,
      maxSize: this.maxSize,
      hitRate: size > 0 ? hits / size : 0,
      totalHits: hits,
      entries: size,
    };
  }

  /**
   * Prune is not needed for Redis as TTL handles expiration
   */
  public async prune(): Promise<number> {
    // Redis handles TTL automatically
    return 0;
  }
}

/**
 * Create a new Redis document cache
 */
export function createRedisCache(config: RedisCacheConfig): RedisDocumentCache {
  return new RedisDocumentCache(config);
}
