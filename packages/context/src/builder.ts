/**
 * @leaven-graphql/context - Context builder
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { BaseContext, ContextExtension } from './types';

/**
 * Context factory function
 */
export type ContextFactory<TInput, TContext extends BaseContext> = (
  input: TInput
) => TContext | Promise<TContext>;

/**
 * Configuration for the context builder
 */
export interface ContextBuilderConfig<TInput, TContext extends BaseContext> {
  /** Base context factory */
  factory: ContextFactory<TInput, TContext>;
  /** Extensions to apply */
  extensions?: Array<ContextExtension<TContext, Record<string, unknown>>>;
}

/**
 * Builder for creating request contexts
 */
export class ContextBuilder<TInput, TContext extends BaseContext> {
  private readonly factory: ContextFactory<TInput, TContext>;
  private readonly extensions: Array<ContextExtension<TContext, Record<string, unknown>>>;

  constructor(config: ContextBuilderConfig<TInput, TContext>) {
    this.factory = config.factory;
    this.extensions = config.extensions ?? [];
  }

  /**
   * Add an extension to the context
   */
  public extend<TExtension extends Record<string, unknown>>(
    extension: ContextExtension<TContext, TExtension>
  ): ContextBuilder<TInput, TContext & TExtension> {
    return new ContextBuilder<TInput, TContext & TExtension>({
      factory: this.factory as unknown as ContextFactory<TInput, TContext & TExtension>,
      extensions: [
        ...this.extensions,
        extension as ContextExtension<TContext & TExtension, Record<string, unknown>>,
      ],
    });
  }

  /**
   * Build a context from input
   */
  public async build(input: TInput): Promise<TContext> {
    let context = await this.factory(input);

    for (const extension of this.extensions) {
      const ext = await extension(context);
      context = { ...context, ...ext };
    }

    return context;
  }

  /**
   * Create a new builder with a different input type
   */
  public withInput<TNewInput>(
    transform: (input: TNewInput) => TInput | Promise<TInput>
  ): ContextBuilder<TNewInput, TContext> {
    return new ContextBuilder<TNewInput, TContext>({
      factory: async (input: TNewInput) => {
        const transformedInput = await transform(input);
        return this.build(transformedInput);
      },
      extensions: [],
    });
  }
}

/**
 * Create a new context builder
 */
export function createContextBuilder<TInput, TContext extends BaseContext>(
  factory: ContextFactory<TInput, TContext>
): ContextBuilder<TInput, TContext> {
  return new ContextBuilder({ factory });
}
