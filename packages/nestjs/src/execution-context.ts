/**
 * @leaven-graphql/nestjs - GraphQL Execution Context
 *
 * Provides a helper class for accessing GraphQL-specific context in guards,
 * interceptors, and other NestJS constructs.
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { ExecutionContext, ArgumentsHost } from '@nestjs/common';
import type { GraphQLResolveInfo } from 'graphql';
import type { GqlContext } from './types';

/**
 * GraphQL execution context helper
 *
 * Provides easy access to GraphQL resolver arguments from NestJS execution context.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class AuthGuard implements CanActivate {
 *   canActivate(context: ExecutionContext): boolean {
 *     const gqlContext = GqlExecutionContext.create(context);
 *     const ctx = gqlContext.getContext();
 *     const args = gqlContext.getArgs();
 *     const info = gqlContext.getInfo();
 *
 *     return !!ctx.user;
 *   }
 * }
 * ```
 */
export class GqlExecutionContext {
  private readonly args: unknown[];

  private constructor(private readonly host: ArgumentsHost) {
    this.args = host.getArgs();
  }

  /**
   * Create a GqlExecutionContext from an ExecutionContext
   */
  public static create(context: ExecutionContext): GqlExecutionContext {
    return new GqlExecutionContext(context);
  }

  /**
   * Get the GraphQL context object
   *
   * The context is the third argument in GraphQL resolvers:
   * (root, args, context, info)
   */
  public getContext<T = GqlContext>(): T {
    return this.args[2] as T;
  }

  /**
   * Get the root/parent value
   *
   * The root is the first argument in GraphQL resolvers:
   * (root, args, context, info)
   */
  public getRoot<T = unknown>(): T {
    return this.args[0] as T;
  }

  /**
   * Get the resolver arguments
   *
   * The args is the second argument in GraphQL resolvers:
   * (root, args, context, info)
   */
  public getArgs<T = Record<string, unknown>>(): T {
    return this.args[1] as T;
  }

  /**
   * Get the GraphQL resolve info
   *
   * The info is the fourth argument in GraphQL resolvers:
   * (root, args, context, info)
   */
  public getInfo<T = GraphQLResolveInfo>(): T {
    return this.args[3] as T;
  }

  /**
   * Get a specific argument by name
   */
  public getArg<T = unknown>(name: string): T | undefined {
    const args = this.getArgs<Record<string, unknown>>();
    return args[name] as T | undefined;
  }

  /**
   * Get a specific context property by name
   */
  public getContextProperty<T = unknown>(name: string): T | undefined {
    const ctx = this.getContext<Record<string, unknown>>();
    return ctx[name] as T | undefined;
  }

  /**
   * Get the underlying ArgumentsHost
   */
  public getHost(): ArgumentsHost {
    return this.host;
  }

  /**
   * Get the type of the execution context
   * For GraphQL resolvers, this typically returns 'graphql'
   */
  public getType(): string {
    return (this.host as ExecutionContext).getType?.() ?? 'unknown';
  }

  /**
   * Check if this is a GraphQL context
   */
  public isGraphQL(): boolean {
    return this.getType() === 'graphql';
  }

  /**
   * Get the handler (method) being executed
   */
  public getHandler(): Function | undefined {
    return (this.host as ExecutionContext).getHandler?.();
  }

  /**
   * Get the class containing the handler
   */
  public getClass(): Function | undefined {
    return (this.host as ExecutionContext).getClass?.();
  }

  /**
   * Get the field name being resolved
   */
  public getFieldName(): string | undefined {
    const info = this.getInfo<GraphQLResolveInfo>();
    return info?.fieldName;
  }

  /**
   * Get the parent type name
   */
  public getParentTypeName(): string | undefined {
    const info = this.getInfo<GraphQLResolveInfo>();
    return info?.parentType?.name;
  }

  /**
   * Get the return type name
   */
  public getReturnTypeName(): string | undefined {
    const info = this.getInfo<GraphQLResolveInfo>();
    return info?.returnType?.toString();
  }

  /**
   * Get the operation name from the query
   */
  public getOperationName(): string | undefined {
    const info = this.getInfo<GraphQLResolveInfo>();
    return info?.operation?.name?.value;
  }

  /**
   * Get the operation type (query, mutation, subscription)
   */
  public getOperationType(): 'query' | 'mutation' | 'subscription' | undefined {
    const info = this.getInfo<GraphQLResolveInfo>();
    return info?.operation?.operation;
  }

  /**
   * Get the variable values from the operation
   */
  public getVariables<T = Record<string, unknown>>(): T {
    const info = this.getInfo<GraphQLResolveInfo>();
    return (info?.variableValues ?? {}) as T;
  }

  /**
   * Get the path to the current field
   */
  public getPath(): string[] {
    const info = this.getInfo<GraphQLResolveInfo>();
    if (!info?.path) return [];

    const path: string[] = [];
    let current = info.path;

    while (current) {
      if (typeof current.key === 'string') {
        path.unshift(current.key);
      }
      current = current.prev!;
    }

    return path;
  }

  /**
   * Get the requested fields (first level)
   */
  public getSelectedFields(): string[] {
    const info = this.getInfo<GraphQLResolveInfo>();
    if (!info?.fieldNodes?.[0]?.selectionSet?.selections) return [];

    return info.fieldNodes[0].selectionSet.selections
      .filter((selection) => selection.kind === 'Field')
      .map((field) => (field as { name: { value: string } }).name.value);
  }
}

/**
 * Helper function to extract GraphQL context from execution context
 */
export function getGqlContext<T = GqlContext>(context: ExecutionContext): T {
  return GqlExecutionContext.create(context).getContext<T>();
}

/**
 * Helper function to extract GraphQL args from execution context
 */
export function getGqlArgs<T = Record<string, unknown>>(context: ExecutionContext): T {
  return GqlExecutionContext.create(context).getArgs<T>();
}

/**
 * Helper function to extract GraphQL info from execution context
 */
export function getGqlInfo<T = GraphQLResolveInfo>(context: ExecutionContext): T {
  return GqlExecutionContext.create(context).getInfo<T>();
}

/**
 * Helper function to extract GraphQL root from execution context
 */
export function getGqlRoot<T = unknown>(context: ExecutionContext): T {
  return GqlExecutionContext.create(context).getRoot<T>();
}
