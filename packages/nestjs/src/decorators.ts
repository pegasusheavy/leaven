/**
 * @leaven-graphql/nestjs - Decorators
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import {
  createParamDecorator,
  type ExecutionContext,
  SetMetadata,
  applyDecorators,
} from '@nestjs/common';
import type { GqlContext } from './types';

/**
 * Metadata key for resolver complexity
 */
export const COMPLEXITY_KEY = 'leaven:complexity';

/**
 * Metadata key for field deprecation
 */
export const DEPRECATED_KEY = 'leaven:deprecated';

/**
 * Metadata key for field description
 */
export const DESCRIPTION_KEY = 'leaven:description';

/**
 * Metadata key for caching
 */
export const CACHE_KEY = 'leaven:cache';

/**
 * Metadata key for subscription filter
 */
export const SUBSCRIPTION_FILTER_KEY = 'leaven:subscription:filter';

/**
 * Inject the GraphQL context
 *
 * @example
 * ```typescript
 * @Query(() => User)
 * async me(@Context() ctx: GqlContext) {
 *   return ctx.req.user;
 * }
 * ```
 */
export const Context = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): unknown => {
    const gqlContext = getGqlContext(ctx);

    if (data) {
      return gqlContext[data];
    }

    return gqlContext;
  }
);

/**
 * Inject the GraphQL info object
 *
 * @example
 * ```typescript
 * @Query(() => [Post])
 * async posts(@Info() info: GraphQLResolveInfo) {
 *   // Access field selection, etc.
 * }
 * ```
 */
export const Info = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): unknown => {
    const args = ctx.getArgs();
    return args[3]; // info is the 4th argument in GraphQL resolvers
  }
);

/**
 * Inject the root/parent value
 *
 * @example
 * ```typescript
 * @ResolveField(() => String)
 * async fullName(@Root() user: User) {
 *   return `${user.firstName} ${user.lastName}`;
 * }
 * ```
 */
export const Root = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): unknown => {
    const args = ctx.getArgs();
    return args[0]; // root is the 1st argument in GraphQL resolvers
  }
);

/**
 * Alias for Root decorator
 */
export const Parent = Root;

/**
 * Inject resolver arguments
 *
 * @example
 * ```typescript
 * @Query(() => User)
 * async user(@Args('id') id: string) {
 *   return this.userService.findById(id);
 * }
 * ```
 */
export const Args = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): unknown => {
    const args = ctx.getArgs();
    const gqlArgs = args[1]; // args is the 2nd argument in GraphQL resolvers

    if (data) {
      return gqlArgs?.[data];
    }

    return gqlArgs;
  }
);

/**
 * Set complexity for a resolver
 *
 * @example
 * ```typescript
 * @Query(() => [Post])
 * @Complexity(10)
 * async posts() {
 *   return this.postService.findAll();
 * }
 * ```
 */
export function Complexity(value: number | ComplexityEstimator): MethodDecorator {
  return SetMetadata(COMPLEXITY_KEY, value);
}

/**
 * Complexity estimator function type
 */
export type ComplexityEstimator = (options: ComplexityEstimatorArgs) => number;

/**
 * Arguments for complexity estimator
 */
export interface ComplexityEstimatorArgs {
  field: unknown;
  args: Record<string, unknown>;
  childComplexity: number;
}

/**
 * Mark a field as deprecated
 *
 * @example
 * ```typescript
 * @Query(() => String)
 * @Deprecated('Use newField instead')
 * async oldField() {
 *   return 'deprecated';
 * }
 * ```
 */
export function Deprecated(reason: string): MethodDecorator {
  return SetMetadata(DEPRECATED_KEY, reason);
}

/**
 * Add description to a field
 *
 * @example
 * ```typescript
 * @Query(() => User)
 * @Description('Fetch the currently authenticated user')
 * async me() {
 *   return this.authService.getCurrentUser();
 * }
 * ```
 */
export function Description(text: string): MethodDecorator {
  return SetMetadata(DESCRIPTION_KEY, text);
}

/**
 * Enable caching for a resolver
 *
 * @example
 * ```typescript
 * @Query(() => Settings)
 * @CacheHint({ maxAge: 3600 })
 * async settings() {
 *   return this.settingsService.getAll();
 * }
 * ```
 */
export function CacheHint(options: CacheHintOptions): MethodDecorator {
  return SetMetadata(CACHE_KEY, options);
}

/**
 * Cache hint options
 */
export interface CacheHintOptions {
  /**
   * Maximum age in seconds
   */
  maxAge?: number;

  /**
   * Cache scope
   */
  scope?: 'PUBLIC' | 'PRIVATE';
}

/**
 * Add filter to subscription
 *
 * @example
 * ```typescript
 * @Subscription(() => Comment)
 * @SubscriptionFilter((payload, variables) => payload.postId === variables.postId)
 * commentAdded() {
 *   return pubSub.asyncIterator('COMMENT_ADDED');
 * }
 * ```
 */
export function SubscriptionFilter(
  filter: (payload: unknown, variables: unknown, context: unknown) => boolean | Promise<boolean>
): MethodDecorator {
  return SetMetadata(SUBSCRIPTION_FILTER_KEY, filter);
}

/**
 * Compose multiple decorators
 *
 * @example
 * ```typescript
 * @Query(() => [Post])
 * @PublicQuery() // combines Complexity, Description, and CacheHint
 * async publicPosts() {
 *   return this.postService.findPublic();
 * }
 *
 * function PublicQuery() {
 *   return Decorators(
 *     Complexity(5),
 *     Description('Fetch public posts'),
 *     CacheHint({ maxAge: 60, scope: 'PUBLIC' })
 *   );
 * }
 * ```
 */
export function Decorators(...decorators: MethodDecorator[]): MethodDecorator {
  return applyDecorators(...decorators);
}

/**
 * Get the GraphQL context from execution context
 */
function getGqlContext(ctx: ExecutionContext): GqlContext {
  const args = ctx.getArgs();
  // In GraphQL resolvers: (root, args, context, info)
  // Context is the 3rd argument
  return args[2] as GqlContext;
}

/**
 * Create a custom context decorator
 *
 * @example
 * ```typescript
 * export const CurrentUser = createContextDecorator<User>('user');
 *
 * // Usage:
 * @Query(() => Profile)
 * async profile(@CurrentUser() user: User) {
 *   return this.profileService.getByUserId(user.id);
 * }
 * ```
 */
export function createContextDecorator<T>(key: string): () => ParameterDecorator {
  return () =>
    createParamDecorator((_data: unknown, ctx: ExecutionContext): T => {
      const gqlContext = getGqlContext(ctx);
      return gqlContext[key] as T;
    })();
}
