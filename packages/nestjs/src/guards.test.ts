/**
 * @leaven-graphql/nestjs - Guards tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import 'reflect-metadata';
import {
  Public,
  Roles,
  Permissions,
  IS_PUBLIC_KEY,
  ROLES_KEY,
  PERMISSIONS_KEY,
  AuthGuard,
  RolesGuard,
  PermissionsGuard,
  ComplexityGuard,
  DepthGuard,
} from './guards';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';

describe('Guard Decorators', () => {
  describe('Public', () => {
    test('should set public metadata', () => {
      class TestClass {
        @Public()
        publicMethod() {}
      }

      const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestClass.prototype.publicMethod);
      expect(metadata).toBe(true);
    });
  });

  describe('Roles', () => {
    test('should set single role metadata', () => {
      class TestClass {
        @Roles('admin')
        adminMethod() {}
      }

      const metadata = Reflect.getMetadata(ROLES_KEY, TestClass.prototype.adminMethod);
      expect(metadata).toEqual(['admin']);
    });

    test('should set multiple roles metadata', () => {
      class TestClass {
        @Roles('admin', 'moderator')
        restrictedMethod() {}
      }

      const metadata = Reflect.getMetadata(ROLES_KEY, TestClass.prototype.restrictedMethod);
      expect(metadata).toEqual(['admin', 'moderator']);
    });
  });

  describe('Permissions', () => {
    test('should set single permission metadata', () => {
      class TestClass {
        @Permissions('user:read')
        readMethod() {}
      }

      const metadata = Reflect.getMetadata(PERMISSIONS_KEY, TestClass.prototype.readMethod);
      expect(metadata).toEqual(['user:read']);
    });

    test('should set multiple permissions metadata', () => {
      class TestClass {
        @Permissions('user:read', 'user:write', 'user:delete')
        crudMethod() {}
      }

      const metadata = Reflect.getMetadata(PERMISSIONS_KEY, TestClass.prototype.crudMethod);
      expect(metadata).toEqual(['user:read', 'user:write', 'user:delete']);
    });
  });
});

describe('AuthGuard', () => {
  function createMockContext(
    _isPublic: boolean | undefined,
    user: unknown
  ): ExecutionContext {
    return {
      getHandler: () => ({ name: 'testHandler' }),
      getClass: () => ({ name: 'TestClass' }),
      getArgs: () => [{}, {}, { user, req: { user } }, {}],
      getType: () => 'graphql',
      switchToHttp: () => ({} as unknown),
      switchToRpc: () => ({} as unknown),
      switchToWs: () => ({} as unknown),
      getArgByIndex: () => ({} as unknown),
    } as unknown as ExecutionContext;
  }

  test('should allow access for public routes', () => {
    const reflector = new Reflector();
    const originalGet = reflector.getAllAndOverride;
    reflector.getAllAndOverride = () => true;

    const guard = new AuthGuard(reflector);
    const context = createMockContext(true, null);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    reflector.getAllAndOverride = originalGet;
  });

  test('should allow access for authenticated users', () => {
    const reflector = new Reflector();
    reflector.getAllAndOverride = () => false;

    const guard = new AuthGuard(reflector);
    const context = createMockContext(false, { id: '1', name: 'Test User' });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  test('should deny access for unauthenticated users', () => {
    const reflector = new Reflector();
    reflector.getAllAndOverride = () => false;

    const guard = new AuthGuard(reflector);
    const context = createMockContext(false, null);

    expect(() => guard.canActivate(context)).toThrow('Authentication required');
  });
});

describe('RolesGuard', () => {
  function createMockContext(_roles: string[], user: unknown): ExecutionContext {
    return {
      getHandler: () => ({ name: 'testHandler' }),
      getClass: () => ({ name: 'TestClass' }),
      getArgs: () => [{}, {}, { user, req: { user } }, {}],
      getType: () => 'graphql',
      switchToHttp: () => ({} as unknown),
      switchToRpc: () => ({} as unknown),
      switchToWs: () => ({} as unknown),
      getArgByIndex: () => ({} as unknown),
    } as unknown as ExecutionContext;
  }

  test('should allow access when no roles required', () => {
    const reflector = new Reflector();
    reflector.getAllAndOverride = () => null;

    const guard = new RolesGuard(reflector);
    const context = createMockContext([], { id: '1', roles: [] });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  test('should allow access when user has required role', () => {
    const reflector = new Reflector();
    reflector.getAllAndOverride = () => ['admin'];

    const guard = new RolesGuard(reflector);
    const context = createMockContext(['admin'], {
      id: '1',
      roles: ['admin', 'user'],
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  test('should deny access when user lacks required role', () => {
    const reflector = new Reflector();
    reflector.getAllAndOverride = () => ['admin'];

    const guard = new RolesGuard(reflector);
    const context = createMockContext(['admin'], { id: '1', roles: ['user'] });

    expect(() => guard.canActivate(context)).toThrow('Required roles: admin');
  });

  test('should deny access when user is not authenticated', () => {
    const reflector = new Reflector();
    reflector.getAllAndOverride = () => ['admin'];

    const guard = new RolesGuard(reflector);
    const context = createMockContext(['admin'], null);

    expect(() => guard.canActivate(context)).toThrow('Authentication required');
  });
});

describe('PermissionsGuard', () => {
  function createMockContext(
    _permissions: string[],
    user: unknown
  ): ExecutionContext {
    return {
      getHandler: () => ({ name: 'testHandler' }),
      getClass: () => ({ name: 'TestClass' }),
      getArgs: () => [{}, {}, { user, req: { user } }, {}],
      getType: () => 'graphql',
      switchToHttp: () => ({} as unknown),
      switchToRpc: () => ({} as unknown),
      switchToWs: () => ({} as unknown),
      getArgByIndex: () => ({} as unknown),
    } as unknown as ExecutionContext;
  }

  test('should allow access when no permissions required', () => {
    const reflector = new Reflector();
    reflector.getAllAndOverride = () => null;

    const guard = new PermissionsGuard(reflector);
    const context = createMockContext([], { id: '1', permissions: [] });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  test('should allow access when user has all required permissions', () => {
    const reflector = new Reflector();
    reflector.getAllAndOverride = () => ['user:read', 'user:write'];

    const guard = new PermissionsGuard(reflector);
    const context = createMockContext(['user:read', 'user:write'], {
      id: '1',
      permissions: ['user:read', 'user:write', 'user:delete'],
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  test('should deny access when user lacks required permissions', () => {
    const reflector = new Reflector();
    reflector.getAllAndOverride = () => ['user:read', 'user:write'];

    const guard = new PermissionsGuard(reflector);
    const context = createMockContext(['user:read', 'user:write'], {
      id: '1',
      permissions: ['user:read'],
    });

    expect(() => guard.canActivate(context)).toThrow(
      'Required permissions: user:read, user:write'
    );
  });

  test('should deny access when user is not authenticated', () => {
    const reflector = new Reflector();
    reflector.getAllAndOverride = () => ['user:read'];

    const guard = new PermissionsGuard(reflector);
    const context = createMockContext(['user:read'], null);

    expect(() => guard.canActivate(context)).toThrow('Authentication required');
  });
});

describe('ComplexityGuard', () => {
  function createMockContext(queryComplexity: number | undefined): ExecutionContext {
    return {
      getHandler: () => ({ name: 'testHandler' }),
      getClass: () => ({ name: 'TestClass' }),
      getArgs: () => [{}, {}, { _queryComplexity: queryComplexity }, {}],
      getType: () => 'graphql',
      switchToHttp: () => ({} as unknown),
      switchToRpc: () => ({} as unknown),
      switchToWs: () => ({} as unknown),
      getArgByIndex: () => ({} as unknown),
    } as unknown as ExecutionContext;
  }

  test('should allow access when complexity is within limit', () => {
    const guard = new ComplexityGuard(100);
    const context = createMockContext(50);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  test('should allow access when complexity is undefined', () => {
    const guard = new ComplexityGuard(100);
    const context = createMockContext(undefined);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  test('should deny access when complexity exceeds limit', () => {
    const guard = new ComplexityGuard(100);
    const context = createMockContext(150);

    expect(() => guard.canActivate(context)).toThrow(
      'Query complexity 150 exceeds maximum allowed 100'
    );
  });
});

describe('DepthGuard', () => {
  function createMockContext(queryDepth: number | undefined): ExecutionContext {
    return {
      getHandler: () => ({ name: 'testHandler' }),
      getClass: () => ({ name: 'TestClass' }),
      getArgs: () => [{}, {}, { _queryDepth: queryDepth }, {}],
      getType: () => 'graphql',
      switchToHttp: () => ({} as unknown),
      switchToRpc: () => ({} as unknown),
      switchToWs: () => ({} as unknown),
      getArgByIndex: () => ({} as unknown),
    } as unknown as ExecutionContext;
  }

  test('should allow access when depth is within limit', () => {
    const guard = new DepthGuard(10);
    const context = createMockContext(5);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  test('should allow access when depth is undefined', () => {
    const guard = new DepthGuard(10);
    const context = createMockContext(undefined);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  test('should deny access when depth exceeds limit', () => {
    const guard = new DepthGuard(10);
    const context = createMockContext(15);

    expect(() => guard.canActivate(context)).toThrow(
      'Query depth 15 exceeds maximum allowed 10'
    );
  });
});

describe('Metadata Keys', () => {
  test('should have correct public key', () => {
    expect(IS_PUBLIC_KEY).toBe('leaven:isPublic');
  });

  test('should have correct roles key', () => {
    expect(ROLES_KEY).toBe('leaven:roles');
  });

  test('should have correct permissions key', () => {
    expect(PERMISSIONS_KEY).toBe('leaven:permissions');
  });
});
