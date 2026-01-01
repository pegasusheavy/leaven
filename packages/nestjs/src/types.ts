/**
 * @leaven-graphql/nestjs - Type definitions
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { Type } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { GraphQLSchema, DocumentNode } from 'graphql';
import type { DocumentCacheConfig } from '@leaven-graphql/core';

/**
 * Configuration options for the Leaven GraphQL module
 */
export interface LeavenModuleOptions {
  /**
   * Path for the GraphQL endpoint
   * @default '/graphql'
   */
  path?: string;

  /**
   * Pre-built GraphQL schema (schema-first approach)
   */
  schema?: GraphQLSchema;

  /**
   * Type definitions for schema-first approach
   */
  typeDefs?: string | DocumentNode | Array<string | DocumentNode>;

  /**
   * Resolvers for schema-first approach
   */
  resolvers?: Record<string, unknown> | Array<Record<string, unknown>>;

  /**
   * Enable auto-schema generation (code-first approach)
   * @default true
   */
  autoSchemaFile?: boolean | string;

  /**
   * Sort schema alphabetically
   * @default false
   */
  sortSchema?: boolean;

  /**
   * Build schema options for code-first
   */
  buildSchemaOptions?: BuildSchemaOptions;

  /**
   * Enable GraphQL Playground
   * @default true in development
   */
  playground?: boolean;

  /**
   * Enable introspection
   * @default true in development
   */
  introspection?: boolean;

  /**
   * Document cache configuration
   */
  cache?: DocumentCacheConfig | boolean;

  /**
   * Maximum query complexity allowed
   */
  maxComplexity?: number;

  /**
   * Maximum query depth allowed
   */
  maxDepth?: number;

  /**
   * Enable execution metrics
   * @default false
   */
  metrics?: boolean;

  /**
   * Enable debug mode
   * @default false
   */
  debug?: boolean;

  /**
   * Context factory function
   */
  context?: ContextFactory;

  /**
   * Format error function
   */
  formatError?: FormatErrorFn;

  /**
   * Plugins to use
   */
  plugins?: LeavenPlugin[];

  /**
   * Enable CORS
   */
  cors?: boolean | CorsOptions;

  /**
   * Include stack traces in errors (development only)
   * @default false
   */
  includeStacktraceInErrorResponses?: boolean;
}

/**
 * Options for async module configuration
 */
export interface LeavenModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Existing provider to use
   */
  useExisting?: Type<LeavenOptionsFactory>;

  /**
   * Class to instantiate
   */
  useClass?: Type<LeavenOptionsFactory>;

  /**
   * Factory function
   */
  useFactory?: (...args: unknown[]) => Promise<LeavenModuleOptions> | LeavenModuleOptions;

  /**
   * Injection tokens for factory
   */
  inject?: unknown[];
}

/**
 * Factory interface for creating Leaven options
 */
export interface LeavenOptionsFactory {
  createLeavenOptions(): Promise<LeavenModuleOptions> | LeavenModuleOptions;
}

/**
 * Build schema options for code-first approach
 */
export interface BuildSchemaOptions {
  /**
   * Date scalar mode
   */
  dateScalarMode?: 'isoDate' | 'timestamp';

  /**
   * Number scalar mode
   */
  numberScalarMode?: 'integer' | 'float';

  /**
   * Skip check for resolvers
   */
  skipCheck?: boolean;

  /**
   * Orphaned types to include
   */
  orphanedTypes?: Type[];

  /**
   * Directives to include
   */
  directives?: DirectiveDefinition[];
}

/**
 * Directive definition
 */
export interface DirectiveDefinition {
  name: string;
  locations: string[];
  args?: Record<string, unknown>;
}

/**
 * Context factory function type
 */
export type ContextFactory<TContext = Record<string, unknown>> = (
  request: Request,
  response: Response
) => TContext | Promise<TContext>;

/**
 * Error formatting function
 */
export type FormatErrorFn = (error: GraphQLFormattedError) => GraphQLFormattedError;

/**
 * GraphQL formatted error
 */
export interface GraphQLFormattedError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

/**
 * Plugin interface
 */
export interface LeavenPlugin {
  name: string;
  onInit?: () => void | Promise<void>;
  onRequest?: (context: PluginContext) => void | Promise<void>;
  onResponse?: (context: PluginContext, response: unknown) => void | Promise<void>;
  onError?: (context: PluginContext, error: Error) => void | Promise<void>;
}

/**
 * Plugin context
 */
export interface PluginContext {
  request: Request;
  response?: Response;
  schema: GraphQLSchema;
  document?: DocumentNode;
  operationName?: string;
  variables?: Record<string, unknown>;
}

/**
 * CORS options
 */
export interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Request context passed to resolvers
 */
export interface GqlContext<TRequest = Request, TResponse = Response> {
  req: TRequest;
  res: TResponse;
  [key: string]: unknown;
}

/**
 * Execution context for GraphQL operations
 */
export interface GqlExecutionContext {
  getContext<T = GqlContext>(): T;
  getRoot<T = unknown>(): T;
  getArgs<T = Record<string, unknown>>(): T;
  getInfo<T = unknown>(): T;
}
