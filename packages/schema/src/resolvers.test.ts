/**
 * @leaven-graphql/schema - Resolvers tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import {
  createResolvers,
  mergeResolvers,
  wrapResolver,
  defaultResolver,
  constantResolver,
} from './resolvers';

describe('createResolvers', () => {
  test('should create typed resolvers object', () => {
    const resolvers = createResolvers({
      Query: {
        hello: () => 'Hello',
        user: (_, { id }: { id: string }) => ({ id, name: 'Test' }),
      },
      User: {
        fullName: (parent: { firstName: string; lastName: string }) =>
          `${parent.firstName} ${parent.lastName}`,
      },
    });

    expect(resolvers.Query?.hello).toBeDefined();
    expect(resolvers.Query?.user).toBeDefined();
    expect(resolvers.User?.fullName).toBeDefined();
  });
});

describe('mergeResolvers', () => {
  test('should merge multiple resolver sets', () => {
    const resolvers1 = {
      Query: {
        hello: () => 'Hello',
      },
    };

    const resolvers2 = {
      Query: {
        goodbye: () => 'Goodbye',
      },
    };

    const merged = mergeResolvers(resolvers1, resolvers2);

    expect(merged.Query?.hello).toBeDefined();
    expect(merged.Query?.goodbye).toBeDefined();
  });

  test('should merge nested resolvers', () => {
    const resolvers1 = {
      User: {
        name: () => 'John',
      },
    };

    const resolvers2 = {
      User: {
        email: () => 'john@test.com',
      },
    };

    const merged = mergeResolvers(resolvers1, resolvers2);

    expect(merged.User?.name).toBeDefined();
    expect(merged.User?.email).toBeDefined();
  });

  test('should override with later resolvers', () => {
    const resolvers1 = {
      Query: {
        hello: () => 'Hello 1',
      },
    };

    const resolvers2 = {
      Query: {
        hello: () => 'Hello 2',
      },
    };

    const merged = mergeResolvers(resolvers1, resolvers2);

    const result = (merged.Query?.hello as () => string)?.();
    expect(result).toBe('Hello 2');
  });

  test('should merge resolve/subscribe objects', () => {
    const resolvers1 = {
      Subscription: {
        messageAdded: {
          resolve: (payload: string) => payload,
        },
      },
    };

    const resolvers2 = {
      Subscription: {
        messageAdded: {
          subscribe: () => ({ next: () => ({ value: 'test', done: false }) }),
        },
      },
    };

    const merged = mergeResolvers(resolvers1, resolvers2);

    const messageAdded = merged.Subscription?.messageAdded as {
      resolve?: unknown;
      subscribe?: unknown;
    };
    expect(messageAdded.resolve).toBeDefined();
    expect(messageAdded.subscribe).toBeDefined();
  });

  test('should handle empty resolver sets', () => {
    const merged = mergeResolvers({}, {}, {});
    expect(merged).toEqual({});
  });
});

describe('wrapResolver', () => {
  test('should wrap resolver with middleware', async () => {
    const originalResolver = () => 'original';
    const calls: string[] = [];

    const wrapped = wrapResolver(originalResolver, (next, parent, args, context, info) => {
      calls.push('before');
      const result = next(parent, args, context, info);
      calls.push('after');
      return result;
    });

    const result = wrapped(null, {}, null, {} as never);

    expect(result).toBe('original');
    expect(calls).toEqual(['before', 'after']);
  });

  test('should allow middleware to modify result', async () => {
    const originalResolver = () => 'original';

    const wrapped = wrapResolver(originalResolver, (next, parent, args, context, info) => {
      const result = next(parent, args, context, info);
      return `${result} - modified`;
    });

    const result = wrapped(null, {}, null, {} as never);

    expect(result).toBe('original - modified');
  });

  test('should allow middleware to short-circuit', async () => {
    const originalResolver = () => 'original';

    const wrapped = wrapResolver(originalResolver, () => {
      return 'short-circuited';
    });

    const result = wrapped(null, {}, null, {} as never);

    expect(result).toBe('short-circuited');
  });

  test('should handle async resolvers', async () => {
    const originalResolver = async () => {
      await new Promise((r) => setTimeout(r, 10));
      return 'async result';
    };

    const wrapped = wrapResolver(originalResolver, async (next, parent, args, context, info) => {
      const result = await next(parent, args, context, info);
      return `${result} - wrapped`;
    });

    const result = await wrapped(null, {}, null, {} as never);

    expect(result).toBe('async result - wrapped');
  });
});

describe('defaultResolver', () => {
  test('should return property from parent', () => {
    const resolver = defaultResolver<{ name: string }>('name');
    const result = resolver({ name: 'Test' }, {}, null, {} as never);

    expect(result).toBe('Test');
  });

  test('should return undefined for missing property', () => {
    const resolver = defaultResolver<{ name?: string }>('name');
    const result = resolver({}, {}, null, {} as never);

    expect(result).toBeUndefined();
  });
});

describe('constantResolver', () => {
  test('should always return the constant value', () => {
    const resolver = constantResolver('constant');

    expect(resolver(null, {}, null, {} as never)).toBe('constant');
    expect(resolver({}, { arg: 'value' }, {}, {} as never)).toBe('constant');
  });

  test('should work with objects', () => {
    const obj = { key: 'value' };
    const resolver = constantResolver(obj);

    expect(resolver(null, {}, null, {} as never)).toBe(obj);
  });
});
