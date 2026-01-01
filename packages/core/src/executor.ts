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

import { DocumentCache, type DocumentCacheConfig, type CachedValidation, type IDocumentCache, resolveValue } from './cache';
import { parseDocument, validateDocument, type ParseOptions, type ValidationResult } from './parser';
import { CompiledQuery, compileQuery, type CompilerOptions } from './compiler';
import type {
  Variables,
  GraphQLRequest,
  GraphQLResponse,
  SubscriptionIterator,
  ExecutionHooks,
  ExecutionMetrics,
} from './types';

/**
 * Configuration for the GraphQL executor
 */
export interface ExecutorConfig {
  /** The GraphQL schema */
  schema: GraphQLSchema;
  /** Root value for resolvers */
  rootValue?: unknown;
  /**
   * Document cache configuration
   * - `true`: Use default in-memory cache
   * - `false`: Disable caching
   * - `DocumentCacheConfig`: Configure in-memory cache
   * - `IDocumentCache`: Use a custom cache implementation (e.g., Redis)
   */
  cache?: DocumentCacheConfig | boolean | IDocumentCache;
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
  private readonly cache: IDocumentCache | null;
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
    } else if (this.isCustomCache(config.cache)) {
      // Custom cache implementation (e.g., Redis)
      this.cache = config.cache;
    } else {
      // DocumentCacheConfig
      this.cache = new DocumentCache(config.cache);
    }
  }

  /**
   * Check if a value is a custom cache implementation
   */
  private isCustomCache(cache: unknown): cache is IDocumentCache {
    return (
      typeof cache === 'object' &&
      cache !== null &&
      'get' in cache &&
      'set' in cache &&
      'getWithValidation' in cache
    );
  }

  /**
   * Generate a cache key for a query
   * Uses fast Bun.hash instead of MD5
   */
  private getCacheKey(query: string, operationName?: string): string {
    const input = operationName ? `${query}:${operationName}` : query;
    return Bun.hash(input).toString(36);
  }

  /**
   * Parse a GraphQL query with caching
   * Returns cached document and validation if available
   * Supports both sync and async cache implementations
   */
  private async parseQuery(query: string): Promise<{
    document: DocumentNode;
    cached: boolean;
    cachedValidation?: CachedValidation;
  }> {
    // Check cache first
    if (this.cache) {
      const cached = await resolveValue(this.cache.getWithValidation(query));
      if (cached) {
        return {
          document: cached.document,
          cached: true,
          cachedValidation: cached.validation,
        };
      }
    }

    // Parse the document
    const document = parseDocument(query, {
      ...this.parseOptions,
      maxDepth: this.maxDepth,
    });

    // Cache the result (fire and forget for async caches)
    if (this.cache) {
      const setResult = this.cache.set(query, document);
      // Don't await - allow execution to continue while caching
      if (setResult instanceof Promise) {
        setResult.catch(() => {
          // Silently ignore cache errors
        });
      }
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
    const startTime = this.metricsEnabled ? performance.now() : 0;
    let parseTime = 0;
    let validationTime = 0;

    try {
      // Parse (with cached validation if available)
      const parseStart = this.metricsEnabled ? performance.now() : 0;

      // Only call hooks if they exist
      if (this.hooks?.onParse) {
        await this.hooks.onParse(request.query);
      }

      const { document, cached: documentCached, cachedValidation } = await this.parseQuery(request.query);

      if (this.metricsEnabled) {
        parseTime = performance.now() - parseStart;
      }

      if (this.hooks?.onParsed) {
        await this.hooks.onParsed(document);
      }

      // Validate (skip if we have cached validation)
      const validateStart = this.metricsEnabled ? performance.now() : 0;
      let validation: ValidationResult;
      let validationCached = false;

      if (cachedValidation) {
        // Use cached validation result
        validation = cachedValidation;
        validationCached = true;
      } else {
        if (this.hooks?.onValidate) {
          await this.hooks.onValidate(document);
        }
        validation = validateDocument(this.schema, document);

        // Cache validation result (fire and forget for async caches)
        if (this.cache) {
          const setResult = this.cache.setValidation(request.query, validation);
          if (setResult instanceof Promise) {
            setResult.catch(() => {
              // Silently ignore cache errors
            });
          }
        }
      }

      if (this.metricsEnabled) {
        validationTime = performance.now() - validateStart;
      }

      if (this.hooks?.onValidated) {
        await this.hooks.onValidated(validation);
      }

      if (!validation.valid) {
        return {
          response: {
            errors: validation.errors.map((e) => e.toJSON()),
          },
          metrics: this.metricsEnabled
            ? {
                timing: {
                  parseTime,
                  validationTime,
                  totalTime: performance.now() - startTime,
                },
                documentCached,
                queryCached: false,
                resolverCount: 0,
                validationCached,
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
                  timing: {
                    parseTime,
                    validationTime,
                    totalTime: performance.now() - startTime,
                  },
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
      const executeStart = this.metricsEnabled ? performance.now() : 0;

      if (this.hooks?.onExecute) {
        await this.hooks.onExecute(context as TContext, document);
      }

      const result = await execute({
        schema: this.schema,
        document,
        rootValue: this.rootValue,
        contextValue: context,
        variableValues: request.variables,
        operationName: request.operationName,
      });

      const executionTime = this.metricsEnabled ? performance.now() - executeStart : 0;

      const response: GraphQLResponse<TData> = {
        data: result.data as TData | undefined,
        errors: result.errors?.map((e) => e.toJSON()),
        extensions: request.extensions,
      };

      if (this.hooks?.onExecuted) {
        await this.hooks.onExecuted(response as GraphQLResponse);
      }

      return {
        response,
        metrics: this.metricsEnabled
          ? {
              timing: {
                parseTime,
                validationTime,
                executionTime,
                totalTime: performance.now() - startTime,
              },
              documentCached,
              validationCached,
              queryCached,
              resolverCount: 0, // TODO: Track resolver invocations
            }
          : undefined,
      };
    } catch (error) {
      if (this.hooks?.onError) {
        await this.hooks.onError(error as Error);
      }

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
              timing: {
                parseTime,
                validationTime,
                totalTime: performance.now() - startTime,
              },
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
    const { document } = await this.parseQuery(request.query);

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
   * Returns a promise for async cache implementations (e.g., Redis)
   */
  public async getCacheStats(): Promise<{
    document: Awaited<ReturnType<IDocumentCache['getStats']>> | null;
    compiled: { size: number };
  }> {
    const documentStats = this.cache ? await resolveValue(this.cache.getStats()) : null;
    return {
      document: documentStats,
      compiled: {
        size: this.compiledQueries.size,
      },
    };
  }

  /**
   * Clear all caches
   * Returns a promise for async cache implementations (e.g., Redis)
   */
  public async clearCaches(): Promise<void> {
    if (this.cache) {
      await resolveValue(this.cache.clear());
    }
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
