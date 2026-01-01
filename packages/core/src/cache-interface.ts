/**
 * @leaven-graphql/core - Cache interface definitions
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { DocumentNode, GraphQLError } from 'graphql';

/**
 * Validation result stored in cache
 */
export interface CachedValidation {
  /** Whether the document is valid */
  valid: boolean;
  /** Validation errors if invalid */
  errors: readonly GraphQLError[];
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Current number of entries */
  size: number;
  /** Maximum allowed entries */
  maxSize: number;
  /** Hit rate (hits / size) */
  hitRate: number;
  /** Total number of cache hits */
  totalHits: number;
  /** Number of entries (alias for size) */
  entries: number;
}

/**
 * Abstract cache interface for document caching
 * Implementations can be in-memory, Redis, or other storage backends
 */
export interface IDocumentCache {
  /**
   * Get a document from the cache
   */
  get(query: string): DocumentNode | null | Promise<DocumentNode | null>;

  /**
   * Set a document in the cache
   */
  set(query: string, document: DocumentNode): void | Promise<void>;

  /**
   * Get a document with its validation result from the cache
   */
  getWithValidation(
    query: string
  ): { document: DocumentNode; validation?: CachedValidation } | null | Promise<{ document: DocumentNode; validation?: CachedValidation } | null>;

  /**
   * Set validation result for a cached document
   */
  setValidation(query: string, validation: CachedValidation): void | Promise<void>;

  /**
   * Set document with validation result in a single operation
   */
  setWithValidation(
    query: string,
    document: DocumentNode,
    validation: CachedValidation
  ): void | Promise<void>;

  /**
   * Check if a query is in the cache
   */
  has(query: string): boolean | Promise<boolean>;

  /**
   * Remove a query from the cache
   */
  delete(query: string): boolean | Promise<boolean>;

  /**
   * Clear the entire cache
   */
  clear(): void | Promise<void>;

  /**
   * Get the current cache size
   */
  readonly size: number | Promise<number>;

  /**
   * Get cache statistics
   */
  getStats(): CacheStats | Promise<CacheStats>;

  /**
   * Prune expired entries (optional)
   */
  prune?(): number | Promise<number>;
}

/**
 * Type guard to check if a value is a Promise
 */
export function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return value !== null && typeof value === 'object' && 'then' in value && typeof (value as Promise<T>).then === 'function';
}

/**
 * Ensure a value is resolved (handles both sync and async)
 */
export async function resolveValue<T>(value: T | Promise<T>): Promise<T> {
  return isPromise(value) ? await value : value;
}
