/**
 * @leaven-graphql/context - Type definitions
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Base context interface
 */
export interface BaseContext {
  /** Request ID for tracing */
  requestId: string;
  /** Timestamp when the request started */
  startTime: number;
}

/**
 * Context extension function
 */
export type ContextExtension<TContext extends BaseContext, TExtension> = (
  context: TContext
) => TExtension | Promise<TExtension>;
