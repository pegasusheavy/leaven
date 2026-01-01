/**
 * @leaven-graphql/plugins - Plugin types
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { DocumentNode, GraphQLSchema, GraphQLError } from 'graphql';
import type { GraphQLRequest, GraphQLResponse } from '@leaven-graphql/core';

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  /** Unique plugin name */
  name: string;
  /** Plugin version */
  version?: string;
  /** Plugin description */
  description?: string;
  /** Plugin dependencies */
  dependencies?: string[];
}

/**
 * Plugin context available to hooks
 */
export interface PluginContext<TContext = unknown> {
  /** The GraphQL schema */
  schema: GraphQLSchema;
  /** The original request */
  request: GraphQLRequest;
  /** User context */
  context: TContext;
  /** Additional data shared between hooks */
  state: Map<string, unknown>;
}

/**
 * Hook called before parsing
 */
export type BeforeParseHook = (
  query: string,
  context: PluginContext
) => string | void | Promise<string | void>;

/**
 * Hook called after parsing
 */
export type AfterParseHook = (
  document: DocumentNode,
  context: PluginContext
) => DocumentNode | void | Promise<DocumentNode | void>;

/**
 * Hook called before validation
 */
export type BeforeValidateHook = (
  document: DocumentNode,
  context: PluginContext
) => void | Promise<void>;

/**
 * Hook called after validation
 */
export type AfterValidateHook = (
  result: { valid: boolean; errors: readonly GraphQLError[] },
  context: PluginContext
) => void | Promise<void>;

/**
 * Hook called before execution
 */
export type BeforeExecuteHook = (
  document: DocumentNode,
  context: PluginContext
) => void | Promise<void>;

/**
 * Hook called after execution
 */
export type AfterExecuteHook = (
  response: GraphQLResponse,
  context: PluginContext
) => GraphQLResponse | void | Promise<GraphQLResponse | void>;

/**
 * Hook called on error
 */
export type OnErrorHook = (
  error: Error,
  context: PluginContext
) => Error | void | Promise<Error | void>;

/**
 * Plugin hooks
 */
export interface PluginHooks {
  /** Called before parsing the query */
  beforeParse?: BeforeParseHook;
  /** Called after parsing the query */
  afterParse?: AfterParseHook;
  /** Called before validating the document */
  beforeValidate?: BeforeValidateHook;
  /** Called after validating the document */
  afterValidate?: AfterValidateHook;
  /** Called before executing the operation */
  beforeExecute?: BeforeExecuteHook;
  /** Called after executing the operation */
  afterExecute?: AfterExecuteHook;
  /** Called when an error occurs */
  onError?: OnErrorHook;
}

/**
 * Plugin interface
 */
export interface Plugin extends PluginHooks {
  /** Plugin metadata */
  metadata: PluginMetadata;
  /** Called when plugin is registered */
  onRegister?: (schema: GraphQLSchema) => void | Promise<void>;
  /** Called when plugin is unregistered */
  onUnregister?: () => void | Promise<void>;
}
