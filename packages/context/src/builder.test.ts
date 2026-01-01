/**
 * @leaven-graphql/context - Builder tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import { ContextBuilder, createContextBuilder } from './builder';
import type { BaseContext } from './types';

interface TestContext extends BaseContext {
  userId?: string;
  role?: string;
}

describe('ContextBuilder', () => {
  describe('constructor', () => {
    test('should create builder with factory', () => {
      const builder = new ContextBuilder<{ userId: string }, TestContext>({
        factory: (input) => ({
          requestId: 'test-123',
          startTime: Date.now(),
          userId: input.userId,
        }),
      });

      expect(builder).toBeDefined();
    });
  });

  describe('build', () => {
    test('should build context using factory', async () => {
      const builder = new ContextBuilder<{ userId: string }, TestContext>({
        factory: (input) => ({
          requestId: 'test-123',
          startTime: Date.now(),
          userId: input.userId,
        }),
      });

      const context = await builder.build({ userId: 'user-1' });

      expect(context.requestId).toBe('test-123');
      expect(context.userId).toBe('user-1');
    });

    test('should handle async factory', async () => {
      const builder = new ContextBuilder<{ userId: string }, TestContext>({
        factory: async (input) => {
          await new Promise((r) => setTimeout(r, 10));
          return {
            requestId: 'async-123',
            startTime: Date.now(),
            userId: input.userId,
          };
        },
      });

      const context = await builder.build({ userId: 'user-1' });

      expect(context.requestId).toBe('async-123');
    });
  });

  describe('extend', () => {
    test('should add extension to context', async () => {
      const builder = new ContextBuilder<{ userId: string }, TestContext>({
        factory: (input) => ({
          requestId: 'test-123',
          startTime: Date.now(),
          userId: input.userId,
        }),
      });

      const extendedBuilder = builder.extend<{ role: string }>((_ctx) => ({
        role: 'admin',
      }));

      const context = await extendedBuilder.build({ userId: 'user-1' });

      expect(context.userId).toBe('user-1');
      expect(context.role).toBe('admin');
    });

    test('should chain multiple extensions', async () => {
      const builder = new ContextBuilder<{ userId: string }, TestContext>({
        factory: (input) => ({
          requestId: 'test-123',
          startTime: Date.now(),
          userId: input.userId,
        }),
      });

      const extendedBuilder = builder
        .extend<{ role: string }>(() => ({ role: 'admin' }))
        .extend<{ permissions: string[] }>(() => ({ permissions: ['read', 'write'] }));

      const context = await extendedBuilder.build({ userId: 'user-1' });

      expect(context.role).toBe('admin');
      expect((context as unknown as { permissions: string[] }).permissions).toEqual(['read', 'write']);
    });

    test('should handle async extensions', async () => {
      const builder = new ContextBuilder<{ userId: string }, TestContext>({
        factory: (input) => ({
          requestId: 'test-123',
          startTime: Date.now(),
          userId: input.userId,
        }),
      });

      const extendedBuilder = builder.extend<{ role: string }>(async () => {
        await new Promise((r) => setTimeout(r, 10));
        return { role: 'user' };
      });

      const context = await extendedBuilder.build({ userId: 'user-1' });

      expect(context.role).toBe('user');
    });
  });

  describe('withInput', () => {
    test('should transform input type', async () => {
      const builder = new ContextBuilder<{ userId: string }, TestContext>({
        factory: (input) => ({
          requestId: 'test-123',
          startTime: Date.now(),
          userId: input.userId,
        }),
      });

      const transformedBuilder = builder.withInput<{ user: { id: string } }>(
        (input) => ({ userId: input.user.id })
      );

      const context = await transformedBuilder.build({ user: { id: 'transformed-1' } });

      expect(context.userId).toBe('transformed-1');
    });

    test('should handle async transform', async () => {
      const builder = new ContextBuilder<{ userId: string }, TestContext>({
        factory: (input) => ({
          requestId: 'test-123',
          startTime: Date.now(),
          userId: input.userId,
        }),
      });

      const transformedBuilder = builder.withInput<{ token: string }>(
        async (input) => {
          await new Promise((r) => setTimeout(r, 10));
          return { userId: `from-token-${input.token}` };
        }
      );

      const context = await transformedBuilder.build({ token: 'abc' });

      expect(context.userId).toBe('from-token-abc');
    });
  });
});

describe('createContextBuilder', () => {
  test('should create a ContextBuilder', async () => {
    const builder = createContextBuilder<{ id: string }, TestContext>(
      (input) => ({
        requestId: input.id,
        startTime: Date.now(),
      })
    );

    const context = await builder.build({ id: 'test-id' });

    expect(context.requestId).toBe('test-id');
    expect(builder).toBeInstanceOf(ContextBuilder);
  });
});
