/**
 * @leaven-graphql/nestjs - Leaven Driver for NestJS GraphQL
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { Injectable, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import type { GraphQLSchema, DocumentNode } from 'graphql';
import { LeavenExecutor, type ExecutorConfig } from '@leaven-graphql/core';
import type {
  LeavenModuleOptions,
  GqlContext,
  GraphQLFormattedError,
} from './types';

/**
 * Request handler result
 */
export interface HandlerResult {
  data?: Record<string, unknown> | null;
  errors?: readonly GraphQLFormattedError[];
  extensions?: Record<string, unknown>;
}

/**
 * Leaven Driver for NestJS GraphQL
 *
 * This driver integrates Leaven's high-performance GraphQL execution
 * with NestJS's dependency injection and module system.
 */
@Injectable()
export class LeavenDriver implements OnModuleInit, OnModuleDestroy {
  private executor: LeavenExecutor | null = null;
  private schema: GraphQLSchema | null = null;
  private readonly options: LeavenModuleOptions;

  constructor(options: LeavenModuleOptions) {
    this.options = options;
  }

  /**
   * Initialize the driver with a schema
   */
  public async onModuleInit(): Promise<void> {
    if (this.options.schema) {
      this.schema = this.options.schema;
      this.initializeExecutor();
    }
  }

  /**
   * Cleanup resources on module destroy
   */
  public async onModuleDestroy(): Promise<void> {
    if (this.executor) {
      this.executor.clearCaches();
      this.executor = null;
    }
  }

  /**
   * Set the GraphQL schema
   */
  public setSchema(schema: GraphQLSchema): void {
    this.schema = schema;
    this.initializeExecutor();
  }

  /**
   * Get the current schema
   */
  public getSchema(): GraphQLSchema | null {
    return this.schema;
  }

  /**
   * Get the executor instance
   */
  public getExecutor(): LeavenExecutor | null {
    return this.executor;
  }

  /**
   * Initialize the Leaven executor
   */
  private initializeExecutor(): void {
    if (!this.schema) {
      throw new Error('Schema must be set before initializing executor');
    }

    const config: ExecutorConfig = {
      schema: this.schema,
      cache: this.options.cache,
      metrics: this.options.metrics,
      maxComplexity: this.options.maxComplexity,
    };

    this.executor = new LeavenExecutor(config);
  }

  /**
   * Execute a GraphQL request
   */
  public async execute<TData = Record<string, unknown>>(
    query: string | DocumentNode,
    variables?: Record<string, unknown>,
    context?: GqlContext,
    operationName?: string
  ): Promise<HandlerResult> {
    if (!this.executor) {
      throw new Error('Executor not initialized. Set schema first.');
    }

    const queryString = typeof query === 'string' ? query : this.documentToString(query);

    try {
      const result = await this.executor.execute<TData>({
        query: queryString,
        variables,
        operationName,
      }, context);

      const response = result.response;

      // Format errors if formatter is provided
      let formattedErrors = response.errors;
      if (formattedErrors && this.options.formatError) {
        formattedErrors = formattedErrors.map(this.options.formatError);
      }

      // Add metrics to extensions if enabled
      let extensions = response.extensions;
      if (this.options.metrics && result.metrics) {
        extensions = {
          ...extensions,
          metrics: result.metrics,
        };
      }

      return {
        data: response.data as Record<string, unknown> | null | undefined,
        errors: formattedErrors,
        extensions,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Execution failed';

      const formattedError: GraphQLFormattedError = {
        message,
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          ...(this.options.includeStacktraceInErrorResponses && error instanceof Error
            ? { stacktrace: error.stack?.split('\n') }
            : {}),
        },
      };

      return {
        errors: [
          this.options.formatError
            ? this.options.formatError(formattedError)
            : formattedError,
        ],
      };
    }
  }

  /**
   * Handle an HTTP request
   */
  public async handleRequest(
    request: Request,
    response: Response
  ): Promise<HandlerResult> {
    const body = await this.parseRequestBody(request);
    const context = await this.createContext(request, response);

    return this.execute(
      body.query,
      body.variables,
      context,
      body.operationName
    );
  }

  /**
   * Parse the request body
   */
  private async parseRequestBody(request: Request): Promise<{
    query: string;
    variables?: Record<string, unknown>;
    operationName?: string;
  }> {
    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const body = await request.json() as Record<string, unknown>;
      return {
        query: body.query as string,
        variables: body.variables as Record<string, unknown> | undefined,
        operationName: body.operationName as string | undefined,
      };
    }

    // Handle GET requests with query params
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    const variables = url.searchParams.get('variables');
    const operationName = url.searchParams.get('operationName');

    if (!query) {
      throw new Error('Query is required');
    }

    return {
      query,
      variables: variables ? JSON.parse(variables) : undefined,
      operationName: operationName ?? undefined,
    };
  }

  /**
   * Create context for the request
   */
  private async createContext(
    request: Request,
    response: Response
  ): Promise<GqlContext> {
    const baseContext: GqlContext = {
      req: request,
      res: response,
    };

    if (this.options.context) {
      const customContext = await this.options.context(request, response);
      return { ...baseContext, ...customContext };
    }

    return baseContext;
  }

  /**
   * Convert DocumentNode to string
   */
  private documentToString(document: DocumentNode): string {
    // This is a simplified version - in production, use graphql's print function
    const { print } = require('graphql');
    return print(document);
  }

  /**
   * Check if playground should be enabled
   */
  public isPlaygroundEnabled(): boolean {
    if (this.options.playground !== undefined) {
      return this.options.playground;
    }
    return process.env.NODE_ENV !== 'production';
  }

  /**
   * Check if introspection should be enabled
   */
  public isIntrospectionEnabled(): boolean {
    if (this.options.introspection !== undefined) {
      return this.options.introspection;
    }
    return process.env.NODE_ENV !== 'production';
  }

  /**
   * Get the GraphQL path
   */
  public getPath(): string {
    return this.options.path ?? '/graphql';
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): ReturnType<LeavenExecutor['getCacheStats']> | null {
    return this.executor?.getCacheStats() ?? null;
  }

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.executor?.clearCaches();
  }
}
