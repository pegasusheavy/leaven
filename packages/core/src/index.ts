/**
 * @leaven-graphql/core - Core GraphQL execution engine for Leaven
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

export { LeavenExecutor, createExecutor } from './executor';
export type { ExecutorConfig, ExecutionResult, ExecutionContext } from './executor';

export { DocumentCache, createDocumentCache } from './cache';
export type { DocumentCacheConfig, CacheEntry } from './cache';

export { parseDocument, validateDocument } from './parser';
export type { ParseOptions, ValidationResult } from './parser';

export { compileQuery, CompiledQuery } from './compiler';
export type { CompilerOptions, CompiledQueryResult } from './compiler';

export { OperationRegistry, createOperationRegistry } from './registry';
export type { OperationRegistryConfig, RegisteredOperation } from './registry';

export * from './types';
