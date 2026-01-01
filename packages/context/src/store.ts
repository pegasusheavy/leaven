/**
 * @leaven-graphql/context - Context store for async local storage
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { AsyncLocalStorage } from 'async_hooks';
import type { BaseContext } from './types';

/**
 * Configuration for the context store
 */
export interface ContextStoreConfig {
  /** Enable automatic cleanup */
  autoCleanup?: boolean;
  /** Cleanup interval in milliseconds */
  cleanupInterval?: number;
}

/**
 * Stored context with metadata
 */
export interface StoredContext<TContext extends BaseContext> {
  /** The context */
  context: TContext;
  /** When the context was stored */
  storedAt: number;
  /** Request ID */
  requestId: string;
}

/**
 * Store for managing request contexts using AsyncLocalStorage
 */
export class ContextStore<TContext extends BaseContext> {
  private readonly storage: AsyncLocalStorage<TContext>;
  private readonly activeContexts: Map<string, StoredContext<TContext>>;
  private cleanupTimer: ReturnType<typeof setInterval> | undefined;

  constructor(config: ContextStoreConfig = {}) {
    this.storage = new AsyncLocalStorage<TContext>();
    this.activeContexts = new Map();

    if (config.autoCleanup) {
      const interval = config.cleanupInterval ?? 60000; // Default: 1 minute
      this.cleanupTimer = setInterval(() => this.cleanup(), interval);
    }
  }

  /**
   * Run a function with a context
   */
  public run<T>(context: TContext, fn: () => T): T {
    this.activeContexts.set(context.requestId, {
      context,
      storedAt: Date.now(),
      requestId: context.requestId,
    });

    try {
      return this.storage.run(context, fn);
    } finally {
      this.activeContexts.delete(context.requestId);
    }
  }

  /**
   * Run an async function with a context
   */
  public async runAsync<T>(context: TContext, fn: () => Promise<T>): Promise<T> {
    this.activeContexts.set(context.requestId, {
      context,
      storedAt: Date.now(),
      requestId: context.requestId,
    });

    try {
      return await this.storage.run(context, fn);
    } finally {
      this.activeContexts.delete(context.requestId);
    }
  }

  /**
   * Get the current context
   */
  public getContext(): TContext | undefined {
    return this.storage.getStore();
  }

  /**
   * Get the current context or throw if not available
   */
  public requireContext(): TContext {
    const context = this.storage.getStore();
    if (!context) {
      throw new Error('No context available. Are you running inside a request?');
    }
    return context;
  }

  /**
   * Get a context by request ID
   */
  public getByRequestId(requestId: string): TContext | undefined {
    return this.activeContexts.get(requestId)?.context;
  }

  /**
   * Get the number of active contexts
   */
  public get activeCount(): number {
    return this.activeContexts.size;
  }

  /**
   * Get all active request IDs
   */
  public getActiveRequestIds(): string[] {
    return Array.from(this.activeContexts.keys());
  }

  /**
   * Cleanup old contexts (for contexts that weren't properly cleaned up)
   */
  public cleanup(maxAge: number = 300000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [requestId, stored] of this.activeContexts) {
      if (now - stored.storedAt > maxAge) {
        this.activeContexts.delete(requestId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Dispose of the store and cleanup resources
   */
  public dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.activeContexts.clear();
  }
}

/**
 * Create a new context store
 */
export function createContextStore<TContext extends BaseContext>(
  config?: ContextStoreConfig
): ContextStore<TContext> {
  return new ContextStore<TContext>(config);
}
