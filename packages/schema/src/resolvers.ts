/**
 * @leaven-graphql/schema - Resolver utilities
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { GraphQLResolveInfo } from 'graphql';

/**
 * Resolver function type
 */
export type ResolverFn<
  TResult = unknown,
  TParent = unknown,
  TContext = unknown,
  TArgs = Record<string, unknown>,
> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/**
 * Field resolver configuration
 */
export interface FieldResolver<TResult = unknown, TParent = unknown, TContext = unknown, TArgs = Record<string, unknown>> {
  /** The resolver function */
  resolve?: ResolverFn<TResult, TParent, TContext, TArgs>;
  /** Subscribe function for subscriptions */
  subscribe?: ResolverFn<AsyncIterator<TResult>, TParent, TContext, TArgs>;
}

/**
 * Resolvers map type
 */
export type Resolvers<TContext = unknown> = {
  [typeName: string]: {
    [fieldName: string]: ResolverFn<unknown, unknown, TContext, Record<string, unknown>> | FieldResolver<unknown, unknown, TContext, Record<string, unknown>>;
  };
};

/**
 * Create a type-safe resolvers object
 */
export function createResolvers<TContext = unknown>(
  resolvers: Resolvers<TContext>
): Resolvers<TContext> {
  return resolvers;
}

/**
 * Merge multiple resolver objects
 */
export function mergeResolvers<TContext = unknown>(
  ...resolverSets: Array<Resolvers<TContext>>
): Resolvers<TContext> {
  const merged: Resolvers<TContext> = {};

  for (const resolvers of resolverSets) {
    for (const [typeName, typeResolvers] of Object.entries(resolvers)) {
      if (!merged[typeName]) {
        merged[typeName] = {};
      }

      for (const [fieldName, resolver] of Object.entries(typeResolvers)) {
        const existing = merged[typeName]![fieldName];

        // If both are objects with resolve/subscribe, merge them
        if (
          existing &&
          typeof existing === 'object' &&
          typeof resolver === 'object' &&
          ('resolve' in existing || 'subscribe' in existing) &&
          ('resolve' in resolver || 'subscribe' in resolver)
        ) {
          merged[typeName]![fieldName] = {
            ...existing,
            ...resolver,
          };
        } else {
          merged[typeName]![fieldName] = resolver;
        }
      }
    }
  }

  return merged;
}

/**
 * Wrap a resolver with middleware
 */
export function wrapResolver<TResult, TParent, TContext, TArgs extends Record<string, unknown>>(
  resolver: ResolverFn<TResult, TParent, TContext, TArgs>,
  middleware: (
    next: ResolverFn<TResult, TParent, TContext, TArgs>,
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
  ) => TResult | Promise<TResult>
): ResolverFn<TResult, TParent, TContext, TArgs> {
  return (parent, args, context, info) => {
    return middleware(resolver, parent, args, context, info);
  };
}

/**
 * Create a default resolver that returns a property from the parent
 */
export function defaultResolver<TParent extends Record<string, unknown>>(
  fieldName: keyof TParent
): ResolverFn<TParent[keyof TParent], TParent, unknown, Record<string, unknown>> {
  return (parent) => parent[fieldName];
}

/**
 * Create a resolver that always returns a constant value
 */
export function constantResolver<TResult>(
  value: TResult
): ResolverFn<TResult, unknown, unknown, Record<string, unknown>> {
  return () => value;
}
