/**
 * @leaven-graphql/nestjs - Guards
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { GqlContext } from './types';

/**
 * Metadata key for public resolvers
 */
export const IS_PUBLIC_KEY = 'leaven:isPublic';

/**
 * Metadata key for required roles
 */
export const ROLES_KEY = 'leaven:roles';

/**
 * Metadata key for required permissions
 */
export const PERMISSIONS_KEY = 'leaven:permissions';

/**
 * Mark a resolver as public (no authentication required)
 *
 * @example
 * ```typescript
 * @Query(() => String)
 * @Public()
 * async publicInfo() {
 *   return 'This is public';
 * }
 * ```
 */
export const Public = (): ClassDecorator & MethodDecorator => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Require specific roles
 *
 * @example
 * ```typescript
 * @Query(() => [User])
 * @Roles('admin', 'moderator')
 * async users() {
 *   return this.userService.findAll();
 * }
 * ```
 */
export const Roles = (...roles: string[]): ClassDecorator & MethodDecorator => SetMetadata(ROLES_KEY, roles);

/**
 * Require specific permissions
 *
 * @example
 * ```typescript
 * @Mutation(() => User)
 * @Permissions('user:write', 'user:delete')
 * async deleteUser(@Args('id') id: string) {
 *   return this.userService.delete(id);
 * }
 * ```
 */
export const Permissions = (...permissions: string[]): ClassDecorator & MethodDecorator =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Authentication guard for GraphQL resolvers
 *
 * Ensures the user is authenticated before accessing protected resolvers.
 *
 * @example
 * ```typescript
 * @UseGuards(AuthGuard)
 * @Resolver(() => User)
 * export class UserResolver {
 *   // All resolvers in this class require authentication
 * }
 * ```
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    // Check if resolver is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const gqlContext = this.getGqlContext(context);
    const user = this.extractUser(gqlContext);

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }

  /**
   * Get GraphQL context from execution context
   */
  protected getGqlContext(context: ExecutionContext): GqlContext {
    const args = context.getArgs();
    return args[2] as GqlContext;
  }

  /**
   * Extract user from context
   * Override this method to customize user extraction
   */
  protected extractUser(context: GqlContext): unknown {
    // Try common user locations
    return (
      context.user ??
      (context.req as unknown as Record<string, unknown>)?.user ??
      null
    );
  }
}

/**
 * Role-based access guard
 *
 * Ensures the user has the required roles.
 *
 * @example
 * ```typescript
 * @UseGuards(AuthGuard, RolesGuard)
 * @Roles('admin')
 * @Resolver(() => Admin)
 * export class AdminResolver {
 *   // Only admins can access these resolvers
 * }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const gqlContext = this.getGqlContext(context);
    const user = this.extractUser(gqlContext);

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const userRoles = this.extractRoles(user);
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Required roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Get GraphQL context from execution context
   */
  protected getGqlContext(context: ExecutionContext): GqlContext {
    const args = context.getArgs();
    return args[2] as GqlContext;
  }

  /**
   * Extract user from context
   */
  protected extractUser(context: GqlContext): unknown {
    return (
      context.user ??
      (context.req as unknown as Record<string, unknown>)?.user ??
      null
    );
  }

  /**
   * Extract roles from user
   * Override this method to customize role extraction
   */
  protected extractRoles(user: unknown): string[] {
    const userObj = user as Record<string, unknown>;
    const roles = userObj?.roles ?? userObj?.role;

    if (Array.isArray(roles)) {
      return roles.map(String);
    }

    if (typeof roles === 'string') {
      return [roles];
    }

    return [];
  }
}

/**
 * Permission-based access guard
 *
 * Ensures the user has the required permissions.
 *
 * @example
 * ```typescript
 * @UseGuards(AuthGuard, PermissionsGuard)
 * @Permissions('posts:read', 'posts:write')
 * @Resolver(() => Post)
 * export class PostResolver {
 *   // Users need posts:read and posts:write permissions
 * }
 * ```
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const gqlContext = this.getGqlContext(context);
    const user = this.extractUser(gqlContext);

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const userPermissions = this.extractPermissions(user);
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Required permissions: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Get GraphQL context from execution context
   */
  protected getGqlContext(context: ExecutionContext): GqlContext {
    const args = context.getArgs();
    return args[2] as GqlContext;
  }

  /**
   * Extract user from context
   */
  protected extractUser(context: GqlContext): unknown {
    return (
      context.user ??
      (context.req as unknown as Record<string, unknown>)?.user ??
      null
    );
  }

  /**
   * Extract permissions from user
   * Override this method to customize permission extraction
   */
  protected extractPermissions(user: unknown): string[] {
    const userObj = user as Record<string, unknown>;
    const permissions = userObj?.permissions ?? userObj?.scopes;

    if (Array.isArray(permissions)) {
      return permissions.map(String);
    }

    if (typeof permissions === 'string') {
      return permissions.split(' ');
    }

    return [];
  }
}

/**
 * Complexity limit guard
 *
 * Prevents queries that exceed complexity limits.
 */
@Injectable()
export class ComplexityGuard implements CanActivate {
  constructor(
    @Inject('LEAVEN_MAX_COMPLEXITY') private readonly maxComplexity: number
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    const gqlContext = this.getGqlContext(context);
    const currentComplexity = (gqlContext as Record<string, unknown>)._queryComplexity as number | undefined;

    if (currentComplexity !== undefined && currentComplexity > this.maxComplexity) {
      throw new ForbiddenException(
        `Query complexity ${currentComplexity} exceeds maximum allowed ${this.maxComplexity}`
      );
    }

    return true;
  }

  /**
   * Get GraphQL context from execution context
   */
  private getGqlContext(context: ExecutionContext): GqlContext {
    const args = context.getArgs();
    return args[2] as GqlContext;
  }
}

/**
 * Depth limit guard
 *
 * Prevents queries that exceed depth limits.
 */
@Injectable()
export class DepthGuard implements CanActivate {
  constructor(
    @Inject('LEAVEN_MAX_DEPTH') private readonly maxDepth: number
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    const gqlContext = this.getGqlContext(context);
    const currentDepth = (gqlContext as Record<string, unknown>)._queryDepth as number | undefined;

    if (currentDepth !== undefined && currentDepth > this.maxDepth) {
      throw new ForbiddenException(
        `Query depth ${currentDepth} exceeds maximum allowed ${this.maxDepth}`
      );
    }

    return true;
  }

  /**
   * Get GraphQL context from execution context
   */
  private getGqlContext(context: ExecutionContext): GqlContext {
    const args = context.getArgs();
    return args[2] as GqlContext;
  }
}
