/**
 * Leaven - A high-performance GraphQL library for the Bun runtime
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

// Re-export all packages for convenience
// Core exports everything
export * from '@leaven-graphql/core';
// Schema may have duplicates with core, exclude them
export {
  SchemaBuilder,
  createSchemaBuilder,
  mergeSchemas,
  mergeSchemasFromStrings,
  createResolvers,
  mergeResolvers,
  loadSchemaFromFile,
  loadSchemaFromDirectory,
} from '@leaven-graphql/schema';
export * from '@leaven-graphql/http';
export * from '@leaven-graphql/ws';
export * from '@leaven-graphql/context';
export * from '@leaven-graphql/errors';
export * from '@leaven-graphql/plugins';
export * from '@leaven-graphql/playground';

// Named exports for common usage patterns
export {
  // Core
  LeavenExecutor,
  createExecutor,
  DocumentCache,
  createDocumentCache,
  parseDocument,
  validateDocument,
  compileQuery,
  CompiledQuery,
  OperationRegistry,
  createOperationRegistry,
} from '@leaven-graphql/core';

// Schema exports are already included above

export {
  // HTTP
  createHandler,
  createBunHandler,
  LeavenServer,
  createServer,
} from '@leaven-graphql/http';

export {
  // WebSocket
  WebSocketHandler,
  createWebSocketHandler,
  SubscriptionManager,
  createSubscriptionManager,
  PubSub,
  createPubSub,
} from '@leaven-graphql/ws';

export {
  // Context
  ContextBuilder,
  createContextBuilder,
  ContextStore,
  createContextStore,
  RequestContext,
  createRequestContext,
} from '@leaven-graphql/context';

export {
  // Errors
  LeavenError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  formatError,
  formatErrors,
  ErrorCode,
} from '@leaven-graphql/errors';

export {
  // Plugins
  PluginManager,
  createPluginManager,
  createPlugin,
  composePlugins,
  createCachingPlugin,
  createLoggingPlugin,
  createTracingPlugin,
  createDepthLimitPlugin,
  createComplexityPlugin,
} from '@leaven-graphql/plugins';

export {
  // Playground
  renderPlayground,
  createPlaygroundHandler,
  renderGraphiQL,
  createGraphiQLHandler,
} from '@leaven-graphql/playground';

/**
 * Quick start helper to create a GraphQL server
 */
export function leaven(config: import('@leaven-graphql/http').ServerConfig): import('@leaven-graphql/http').LeavenServer {
  const { createServer } = require('@leaven-graphql/http');
  return createServer(config);
}
