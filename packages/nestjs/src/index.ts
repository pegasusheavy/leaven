/**
 * @leaven-graphql/nestjs - NestJS integration for Leaven GraphQL
 *
 * This package provides seamless integration between NestJS and Leaven,
 * allowing you to use Leaven's high-performance GraphQL execution engine
 * within your NestJS applications.
 *
 * @example
 * ```typescript
 * import { Module } from '@nestjs/common';
 * import { LeavenModule } from '@leaven-graphql/nestjs';
 *
 * @Module({
 *   imports: [
 *     LeavenModule.forRoot({
 *       playground: true,
 *       introspection: true,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

// Module exports
export { LeavenModule, LEAVEN_MODULE_OPTIONS, LEAVEN_DRIVER } from './module';

// Driver exports
export { LeavenDriver, type HandlerResult } from './driver';

// Type exports
export type {
  LeavenModuleOptions,
  LeavenModuleAsyncOptions,
  LeavenOptionsFactory,
  BuildSchemaOptions,
  DirectiveDefinition,
  ContextFactory,
  FormatErrorFn,
  GraphQLFormattedError,
  LeavenPlugin,
  PluginContext,
  CorsOptions,
  GqlContext,
  GqlExecutionContext as GqlExecutionContextInterface,
} from './types';

// Decorator exports
export {
  Context,
  Info,
  Root,
  Parent,
  Args,
  Complexity,
  Deprecated,
  Description,
  CacheHint,
  SubscriptionFilter,
  Decorators,
  createContextDecorator,
  COMPLEXITY_KEY,
  DEPRECATED_KEY,
  DESCRIPTION_KEY,
  CACHE_KEY,
  SUBSCRIPTION_FILTER_KEY,
  type ComplexityEstimator,
  type ComplexityEstimatorArgs,
  type CacheHintOptions,
} from './decorators';

// Guard exports
export {
  AuthGuard,
  RolesGuard,
  PermissionsGuard,
  ComplexityGuard,
  DepthGuard,
  Public,
  Roles,
  Permissions,
  IS_PUBLIC_KEY,
  ROLES_KEY,
  PERMISSIONS_KEY,
} from './guards';

// Interceptor exports
export {
  LoggingInterceptor,
  ErrorFormattingInterceptor,
  ComplexityInterceptor,
  CachingInterceptor,
  MetricsInterceptor,
  type OperationMetrics,
  type MetricsSummary,
} from './interceptors';

// Middleware exports
export { GraphQLMiddleware, createGraphQLMiddleware } from './middleware';

// Execution Context exports
export {
  GqlExecutionContext,
  getGqlContext,
  getGqlArgs,
  getGqlInfo,
  getGqlRoot,
} from './execution-context';

// Schema Builder exports
export {
  SchemaBuilderService,
  generateSchemaFile,
  getResolverMetadata,
  registerResolverMetadata,
  clearResolverMetadata,
  type SchemaSource,
  type SchemaFileOptions,
  type ResolverMetadata,
} from './schema-builder';

// Subscription exports
export {
  SubscriptionManager,
  Subscription,
  InjectPubSub,
  type SubscriptionConfig,
  type SubscriptionContext,
  type SubscribeMessage,
  type CompleteMessage,
  type ExecutionArgs,
} from './subscriptions';
