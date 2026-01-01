/**
 * @leaven-graphql/core - GraphQL executor
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import {
  execute,
  subscribe,
  type GraphQLSchema,
  type DocumentNode,
  type ExecutionResult as GraphQLExecutionResult,
} from 'graphql';

import { DocumentCache, type DocumentCacheConfig } from './cache';
import { parseDocument, validateDocument, type ParseOptions } from './parser';
import { CompiledQuery, compileQuery, type CompilerOptions } from './compiler';
import type {
  Variables,
  GraphQLRequest,
  GraphQLResponse,
  SubscriptionIterator,
  ExecutionHooks,
  ExecutionMetrics,
  ExecutionTiming,
} from './types';

/**
 * Configuration for the GraphQL executor
 */
export interface ExecutorConfig {
  /** The GraphQL schema */
  schema: GraphQLSchema;
  /** Root value for resolvers */
  rootValue?: unknown;
  /** Document cache configuration */
  cache?: DocumentCacheConfig | boolean;
  /** Parser options */
  parseOptions?: ParseOptions;
  /** Compiler options (enables query compilation) */
  compilerOptions?: CompilerOptions;
  /** Enable introspection queries */
  introspection?: boolean;
  /** Maximum query depth */
  maxDepth?: number;
  /** Maximum query complexity */
  maxComplexity?: number;
  /** Execution hooks */
  hooks?: ExecutionHooks;
  /** Enable execution metrics */
  metrics?: boolean;
}

/**
 * Execution context passed to resolvers
 */
export interface ExecutionContext<TContext = unknown> {
  /** User-provided context */
  context: TContext;
  /** The parsed document */
  document: DocumentNode;
  /** Operation name */
  operationName?: string;
  /** Variables */
  variables?: Variables;
  /** Request metadata */
  request?: {
    headers?: Record<string, string>;
    method?: string;
  };
}

/**
 * Full execution result including metrics
 */
export interface ExecutionResult<TData = Record<string, unknown>> {
  /** The GraphQL response */
  response: GraphQLResponse<TData>;
  /** Execution metrics (if enabled) */
  metrics?: ExecutionMetrics;
}

/**
 * High-performance GraphQL executor for Bun
 */
export class LeavenExecutor {
  private readonly schema: GraphQLSchema;
  private readonly rootValue: unknown;
  private readonly cache: DocumentCache | null;
  private readonly parseOptions: ParseOptions;
  private readonly compilerOptions?: CompilerOptions;
  private readonly introspection: boolean;
  private readonly maxDepth?: number;
  private readonly maxComplexity?: number;
  private readonly hooks?: ExecutionHooks;
  private readonly metricsEnabled: boolean;

  private readonly compiledQueries: Map<string, CompiledQuery>;

  constructor(config: ExecutorConfig) {
    this.schema = config.schema;
    this.rootValue = config.rootValue;
    this.parseOptions = config.parseOptions ?? {};
    this.compilerOptions = config.compilerOptions;
    this.introspection = config.introspection ?? true;
    this.maxDepth = config.maxDepth;
    this.maxComplexity = config.maxComplexity;
    this.hooks = config.hooks;
    this.metricsEnabled = config.metrics ?? false;
    this.compiledQueries = new Map();

    // Initialize cache
    if (config.cache === false) {
      this.cache = null;
    } else if (config.cache === true || config.cache === undefined) {
      this.cache = new DocumentCache();
    } else {
      this.cache = new DocumentCache(config.cache);
    }
  }

  /**
   * Generate a cache key for a query
   */
  private getCacheKey(query: string, operationName?: string): string {
    const hasher = new Bun.CryptoHasher('md5');
    hasher.update(query);
    if (operationName) {
      hasher.update(operationName);
    }
    return hasher.digest('hex');
  }

  /**
   * Parse a GraphQL query with caching
   */
  private parseQuery(query: string): { document: DocumentNode; cached: boolean } {
    // Check cache first
    if (this.cache) {
      const cached = this.cache.get(query);
      if (cached) {
        return { document: cached, cached: true };
      }
    }

    // Parse the document
    const document = parseDocument(query, {
      ...this.parseOptions,
      maxDepth: this.maxDepth,
    });

    // Cache the result
    if (this.cache) {
      this.cache.set(query, document);
    }

    return { document, cached: false };
  }

  /**
   * Get or compile a query
   */
  private getCompiledQuery(
    document: DocumentNode,
    operationName?: string
  ): { compiled: CompiledQuery; cached: boolean } {
    if (!this.compilerOptions) {
      return {
        compiled: new CompiledQuery(this.schema, document, operationName),
        cached: false,
      };
    }

    const key = this.getCacheKey(
      JSON.stringify(document),
      operationName
    );

    const cached = this.compiledQueries.get(key);
    if (cached) {
      return { compiled: cached, cached: true };
    }

    const compiled = compileQuery(
      this.schema,
      document,
      operationName,
      this.compilerOptions
    );

    this.compiledQueries.set(key, compiled);
    return { compiled, cached: false };
  }

  /**
   * Execute a GraphQL request
   */
  public async execute<TData = Record<string, unknown>, TContext = unknown>(
    request: GraphQLRequest,
    context?: TContext
  ): Promise<ExecutionResult<TData>> {
    const startTime = performance.now();
    const timing: Partial<ExecutionTiming> = {};

    try {
      // Parse
      const parseStart = performance.now();
      await this.hooks?.onParse?.(request.query);

      const { document, cached: documentCached } = this.parseQuery(request.query);

      timing.parseTime = performance.now() - parseStart;
      await this.hooks?.onParsed?.(document);

      // Validate
      const validateStart = performance.now();
      await this.hooks?.onValidate?.(document);

      const validation = validateDocument(this.schema, document);

      timing.validationTime = performance.now() - validateStart;
      await this.hooks?.onValidated?.(validation);

      if (!validation.valid) {
        return {
          response: {
            errors: validation.errors.map((e) => e.toJSON()),
          },
          metrics: this.metricsEnabled
            ? {
                timing: { ...timing, totalTime: performance.now() - startTime },
                documentCached,
                queryCached: false,
                resolverCount: 0,
              }
            : undefined,
        };
      }

      // Check complexity if compiler is enabled
      let queryCached = false;
      if (this.compilerOptions) {
        const { compiled, cached } = this.getCompiledQuery(
          document,
          request.operationName
        );
        queryCached = cached;

        if (this.maxComplexity && compiled.complexity > this.maxComplexity) {
          return {
            response: {
              errors: [
                {
                  message: `Query complexity of ${compiled.complexity} exceeds maximum allowed complexity of ${this.maxComplexity}`,
                },
              ],
            },
            metrics: this.metricsEnabled
              ? {
                  timing: { ...timing, totalTime: performance.now() - startTime },
                  documentCached,
                  queryCached,
                  resolverCount: 0,
                  complexity: compiled.complexity,
                }
              : undefined,
          };
        }
      }

      // Execute
      const executeStart = performance.now();
      await this.hooks?.onExecute?.(context as TContext, document);

      const result = await execute({
        schema: this.schema,
        document,
        rootValue: this.rootValue,
        contextValue: context,
        variableValues: request.variables,
        operationName: request.operationName,
      });

      timing.executionTime = performance.now() - executeStart;

      const response: GraphQLResponse<TData> = {
        data: result.data as TData | undefined,
        errors: result.errors?.map((e) => e.toJSON()),
        extensions: request.extensions,
      };

      await this.hooks?.onExecuted?.(response as GraphQLResponse);

      return {
        response,
        metrics: this.metricsEnabled
          ? {
              timing: { ...timing, totalTime: performance.now() - startTime },
              documentCached,
              queryCached,
              resolverCount: 0, // TODO: Track resolver invocations
            }
          : undefined,
      };
    } catch (error) {
      await this.hooks?.onError?.(error as Error);

      return {
        response: {
          errors: [
            {
              message:
                error instanceof Error ? error.message : 'Internal server error',
            },
          ],
        },
        metrics: this.metricsEnabled
          ? {
              timing: { ...timing, totalTime: performance.now() - startTime },
              documentCached: false,
              queryCached: false,
              resolverCount: 0,
            }
          : undefined,
      };
    }
  }

  /**
   * Execute a subscription
   */
  public async subscribe<TData = Record<string, unknown>, TContext = unknown>(
    request: GraphQLRequest,
    context?: TContext
  ): Promise<SubscriptionIterator<TData> | GraphQLResponse<TData>> {
    const { document } = this.parseQuery(request.query);

    // Validate
    const validation = validateDocument(this.schema, document);
    if (!validation.valid) {
      return {
        errors: validation.errors.map((e) => e.toJSON()),
      };
    }

    const result = await subscribe({
      schema: this.schema,
      document,
      rootValue: this.rootValue,
      contextValue: context,
      variableValues: request.variables,
      operationName: request.operationName,
    });

    // If it's an error result, return it
    if ('errors' in result && !Symbol.asyncIterator) {
      return {
        errors: (result as GraphQLExecutionResult).errors?.map((e) => e.toJSON()),
      };
    }

    // Transform the async iterator to match our response type
    const iterator = result as AsyncIterableIterator<GraphQLExecutionResult>;

    return {
      [Symbol.asyncIterator]() {
        return this;
      },
      async next(): Promise<IteratorResult<GraphQLResponse<TData>>> {
        const { value, done } = await iterator.next();
        if (done) {
          return { value: undefined, done: true };
        }
        return {
          value: {
            data: value.data as TData | undefined,
            errors: value.errors?.map((e) => e.toJSON()),
          },
          done: false,
        };
      },
      async return(): Promise<IteratorResult<GraphQLResponse<TData>>> {
        if (iterator.return) {
          await iterator.return();
        }
        return { value: undefined, done: true };
      },
      async throw(error: unknown): Promise<IteratorResult<GraphQLResponse<TData>>> {
        if (iterator.throw) {
          await iterator.throw(error);
        }
        return { value: undefined, done: true };
      },
    } as SubscriptionIterator<TData>;
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { document: ReturnType<DocumentCache['getStats']> | null; compiled: { size: number } } {
    return {
      document: this.cache?.getStats() ?? null,
      compiled: {
        size: this.compiledQueries.size,
      },
    };
  }

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.cache?.clear();
    this.compiledQueries.clear();
  }

  /**
   * Get the schema
   */
  public getSchema(): GraphQLSchema {
    return this.schema;
  }
}

/**
 * Create a new Leaven executor
 */
export function createExecutor(config: ExecutorConfig): LeavenExecutor {
  return new LeavenExecutor(config);
}
