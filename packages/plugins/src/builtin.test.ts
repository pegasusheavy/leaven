/**
 * @leaven-graphql/plugins - Built-in plugins tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import { buildSchema, parse } from 'graphql';
import {
  createPlugin,
  composePlugins,
  createCachingPlugin,
  createLoggingPlugin,
  createTracingPlugin,
  createDepthLimitPlugin,
  createComplexityPlugin,
} from './builtin';
import { PluginManager } from './manager';

const schema = buildSchema(`
  type Query {
    hello: String
    user(id: ID!): User
    users(first: Int): [User!]!
  }
  type User {
    id: ID!
    name: String
    posts: [Post!]!
  }
  type Post {
    id: ID!
    title: String
  }
`);

describe('createPlugin', () => {
  test('should create a plugin with metadata and hooks', () => {
    const plugin = createPlugin(
      { name: 'test-plugin', version: '1.0.0' },
      {
        beforeParse: (query) => query,
      }
    );

    expect(plugin.metadata.name).toBe('test-plugin');
    expect(plugin.metadata.version).toBe('1.0.0');
    expect(plugin.beforeParse).toBeDefined();
  });
});

describe('composePlugins', () => {
  test('should compose multiple plugins', async () => {
    const calls: string[] = [];

    const plugin1 = createPlugin(
      { name: 'plugin-1' },
      {
        beforeParse: () => {
          calls.push('plugin-1-beforeParse');
        },
      }
    );

    const plugin2 = createPlugin(
      { name: 'plugin-2' },
      {
        beforeParse: () => {
          calls.push('plugin-2-beforeParse');
        },
      }
    );

    const composed = composePlugins('composed', plugin1, plugin2);

    expect(composed.metadata.name).toBe('composed');

    const manager = new PluginManager({ schema });
    await manager.register(composed);

    const context = manager.createContext({ query: '{ hello }' }, {});
    await manager.beforeParse('{ hello }', context);

    expect(calls).toContain('plugin-1-beforeParse');
    expect(calls).toContain('plugin-2-beforeParse');
  });

  test('should chain beforeParse transformations', async () => {
    const plugin1 = createPlugin(
      { name: 'plugin-1' },
      {
        beforeParse: (query) => query.replace('hello', 'hi'),
      }
    );

    const plugin2 = createPlugin(
      { name: 'plugin-2' },
      {
        beforeParse: (query) => query.replace('hi', 'hey'),
      }
    );

    const composed = composePlugins('composed', plugin1, plugin2);

    const manager = new PluginManager({ schema });
    await manager.register(composed);

    const context = manager.createContext({ query: '{ hello }' }, {});
    const result = await manager.beforeParse('{ hello }', context);

    expect(result).toBe('{ hey }');
  });

  test('should call onRegister and onUnregister hooks', async () => {
    const calls: string[] = [];

    const plugin1 = createPlugin(
      { name: 'plugin-1' },
      {
        onRegister: () => {
          calls.push('plugin-1-onRegister');
        },
        onUnregister: () => {
          calls.push('plugin-1-onUnregister');
        },
      }
    );

    const plugin2 = createPlugin(
      { name: 'plugin-2' },
      {
        onRegister: () => {
          calls.push('plugin-2-onRegister');
        },
        onUnregister: () => {
          calls.push('plugin-2-onUnregister');
        },
      }
    );

    const composed = composePlugins('composed', plugin1, plugin2);

    const manager = new PluginManager({ schema });
    await manager.register(composed);

    expect(calls).toContain('plugin-1-onRegister');
    expect(calls).toContain('plugin-2-onRegister');

    await manager.unregister('composed');

    expect(calls).toContain('plugin-1-onUnregister');
    expect(calls).toContain('plugin-2-onUnregister');
  });

  test('should chain afterParse transformations', async () => {
    const calls: string[] = [];

    const plugin1 = createPlugin(
      { name: 'plugin-1' },
      {
        afterParse: (doc) => {
          calls.push('plugin-1-afterParse');
          return doc;
        },
      }
    );

    const plugin2 = createPlugin(
      { name: 'plugin-2' },
      {
        afterParse: (doc) => {
          calls.push('plugin-2-afterParse');
          return doc;
        },
      }
    );

    const composed = composePlugins('composed', plugin1, plugin2);

    const manager = new PluginManager({ schema });
    await manager.register(composed);

    const context = manager.createContext({ query: '{ hello }' }, {});
    const document = parse('{ hello }');

    await manager.afterParse(document, context);

    expect(calls).toContain('plugin-1-afterParse');
    expect(calls).toContain('plugin-2-afterParse');
  });

  test('should call beforeExecute hooks', async () => {
    const calls: string[] = [];

    const plugin1 = createPlugin(
      { name: 'plugin-1' },
      {
        beforeExecute: () => {
          calls.push('plugin-1-beforeExecute');
        },
      }
    );

    const plugin2 = createPlugin(
      { name: 'plugin-2' },
      {
        beforeExecute: () => {
          calls.push('plugin-2-beforeExecute');
        },
      }
    );

    const composed = composePlugins('composed', plugin1, plugin2);

    const manager = new PluginManager({ schema });
    await manager.register(composed);

    const context = manager.createContext({ query: '{ hello }' }, {});
    const document = parse('{ hello }');

    await manager.beforeExecute(document, context);

    expect(calls).toContain('plugin-1-beforeExecute');
    expect(calls).toContain('plugin-2-beforeExecute');
  });

  test('should chain afterExecute hooks in reverse order', async () => {
    const calls: string[] = [];

    const plugin1 = createPlugin(
      { name: 'plugin-1' },
      {
        afterExecute: (res) => {
          calls.push('plugin-1-afterExecute');
          return res;
        },
      }
    );

    const plugin2 = createPlugin(
      { name: 'plugin-2' },
      {
        afterExecute: (res) => {
          calls.push('plugin-2-afterExecute');
          return res;
        },
      }
    );

    const composed = composePlugins('composed', plugin1, plugin2);

    const manager = new PluginManager({ schema });
    await manager.register(composed);

    const context = manager.createContext({ query: '{ hello }' }, {});

    await manager.afterExecute({ data: { hello: 'world' } }, context);

    expect(calls).toContain('plugin-1-afterExecute');
    expect(calls).toContain('plugin-2-afterExecute');
  });

  test('should chain onError hooks', async () => {
    const calls: string[] = [];

    const plugin1 = createPlugin(
      { name: 'plugin-1' },
      {
        onError: (err) => {
          calls.push('plugin-1-onError');
          return err;
        },
      }
    );

    const plugin2 = createPlugin(
      { name: 'plugin-2' },
      {
        onError: (err) => {
          calls.push('plugin-2-onError');
          return err;
        },
      }
    );

    const composed = composePlugins('composed', plugin1, plugin2);

    const manager = new PluginManager({ schema });
    await manager.register(composed);

    const context = manager.createContext({ query: '{ hello }' }, {});

    await manager.onError(new Error('Test error'), context);

    expect(calls).toContain('plugin-1-onError');
    expect(calls).toContain('plugin-2-onError');
  });
});

describe('createCachingPlugin', () => {
  test('should create caching plugin', () => {
    const plugin = createCachingPlugin();

    expect(plugin.metadata.name).toBe('caching');
    expect(plugin.beforeExecute).toBeDefined();
    expect(plugin.afterExecute).toBeDefined();
  });

  test('should cache responses', async () => {
    const plugin = createCachingPlugin({ ttl: 60000 });

    const manager = new PluginManager({ schema });
    await manager.register(plugin);

    const context = manager.createContext(
      { query: '{ hello }', variables: {} },
      {}
    );
    const document = parse('{ hello }');

    // First execution - no cache
    await manager.beforeExecute(document, context);
    expect(context.state.get('cacheHit')).toBeFalsy();

    // Store response
    await manager.afterExecute({ data: { hello: 'world' } }, context);

    // Second execution - should hit cache
    const context2 = manager.createContext(
      { query: '{ hello }', variables: {} },
      {}
    );
    await manager.beforeExecute(document, context2);
    expect(context2.state.get('cacheHit')).toBe(true);
  });

  test('should not cache errors', async () => {
    const plugin = createCachingPlugin({ ttl: 60000 });

    const manager = new PluginManager({ schema });
    await manager.register(plugin);

    const context = manager.createContext(
      { query: '{ hello }', variables: {} },
      {}
    );
    const document = parse('{ hello }');

    await manager.beforeExecute(document, context);

    // Store response with errors
    await manager.afterExecute(
      { data: null, errors: [{ message: 'Error' }] },
      context
    );

    // Second execution - should not hit cache
    const context2 = manager.createContext(
      { query: '{ hello }', variables: {} },
      {}
    );
    await manager.beforeExecute(document, context2);
    expect(context2.state.get('cacheHit')).toBeFalsy();
  });

  test('should return cached response from afterExecute', async () => {
    const plugin = createCachingPlugin({ ttl: 60000 });

    const manager = new PluginManager({ schema });
    await manager.register(plugin);

    const context = manager.createContext(
      { query: '{ hello }', variables: {} },
      {}
    );
    const document = parse('{ hello }');

    // First execution
    await manager.beforeExecute(document, context);
    await manager.afterExecute({ data: { hello: 'cached' } }, context);

    // Second execution - cache hit
    const context2 = manager.createContext(
      { query: '{ hello }', variables: {} },
      {}
    );
    await manager.beforeExecute(document, context2);
    const response = await manager.afterExecute({ data: { hello: 'new' } }, context2);

    // Should return cached response
    expect(response.data).toEqual({ hello: 'cached' });
  });

  test('should evict old entries when max size reached', async () => {
    const plugin = createCachingPlugin({ ttl: 60000, maxSize: 2 });

    const manager = new PluginManager({ schema });
    await manager.register(plugin);

    const document = parse('{ hello }');

    // First query
    const context1 = manager.createContext({ query: '{ hello }', variables: {} }, {});
    await manager.beforeExecute(document, context1);
    await manager.afterExecute({ data: { hello: 'first' } }, context1);

    // Second query
    const context2 = manager.createContext({ query: '{ world }', variables: {} }, {});
    await manager.beforeExecute(document, context2);
    await manager.afterExecute({ data: { world: 'second' } }, context2);

    // Third query - should evict the first one
    const context3 = manager.createContext({ query: '{ foo }', variables: {} }, {});
    await manager.beforeExecute(document, context3);
    await manager.afterExecute({ data: { foo: 'third' } }, context3);

    // First query should miss cache now
    const context4 = manager.createContext({ query: '{ hello }', variables: {} }, {});
    await manager.beforeExecute(document, context4);
    expect(context4.state.get('cacheHit')).toBeFalsy();
  });
});

describe('createLoggingPlugin', () => {
  test('should create logging plugin', () => {
    const plugin = createLoggingPlugin();

    expect(plugin.metadata.name).toBe('logging');
    expect(plugin.beforeExecute).toBeDefined();
    expect(plugin.afterExecute).toBeDefined();
    expect(plugin.onError).toBeDefined();
  });

  test('should log with custom logger', async () => {
    const logs: Array<{ level: string; msg: string }> = [];

    const plugin = createLoggingPlugin({
      level: 'debug',
      logger: {
        debug: (msg) => logs.push({ level: 'debug', msg }),
        info: (msg) => logs.push({ level: 'info', msg }),
        warn: (msg) => logs.push({ level: 'warn', msg }),
        error: (msg) => logs.push({ level: 'error', msg }),
      },
    });

    const manager = new PluginManager({ schema });
    await manager.register(plugin);

    const context = manager.createContext(
      { query: '{ hello }', operationName: 'TestQuery' },
      {}
    );
    const document = parse('{ hello }');

    await manager.beforeExecute(document, context);
    await manager.afterExecute({ data: { hello: 'world' } }, context);

    expect(logs.length).toBeGreaterThan(0);
  });

  test('should log errors when response has errors', async () => {
    const logs: Array<{ level: string; msg: string }> = [];

    const plugin = createLoggingPlugin({
      level: 'debug',
      logger: {
        debug: (msg) => logs.push({ level: 'debug', msg }),
        info: (msg) => logs.push({ level: 'info', msg }),
        warn: (msg) => logs.push({ level: 'warn', msg }),
        error: (msg) => logs.push({ level: 'error', msg }),
      },
    });

    const manager = new PluginManager({ schema });
    await manager.register(plugin);

    const context = manager.createContext(
      { query: '{ hello }', operationName: 'TestQuery' },
      {}
    );
    const document = parse('{ hello }');

    await manager.beforeExecute(document, context);
    await manager.afterExecute({ data: null, errors: [{ message: 'Test error' }] }, context);

    expect(logs.some(l => l.level === 'error')).toBe(true);
  });

  test('should log on error handler', async () => {
    const logs: Array<{ level: string; msg: string }> = [];

    const plugin = createLoggingPlugin({
      level: 'debug',
      logger: {
        debug: (msg) => logs.push({ level: 'debug', msg }),
        info: (msg) => logs.push({ level: 'info', msg }),
        warn: (msg) => logs.push({ level: 'warn', msg }),
        error: (msg) => logs.push({ level: 'error', msg }),
      },
    });

    const manager = new PluginManager({ schema });
    await manager.register(plugin);

    const context = manager.createContext(
      { query: '{ hello }', operationName: 'TestQuery' },
      {}
    );

    await manager.onError(new Error('Execution failed'), context);

    expect(logs.some(l => l.level === 'error')).toBe(true);
  });
});

describe('createTracingPlugin', () => {
  test('should create tracing plugin', () => {
    const plugin = createTracingPlugin();

    expect(plugin.metadata.name).toBe('tracing');
    expect(plugin.beforeExecute).toBeDefined();
    expect(plugin.afterExecute).toBeDefined();
  });

  test('should add tracing to response', async () => {
    const plugin = createTracingPlugin();

    const manager = new PluginManager({ schema });
    await manager.register(plugin);

    const context = manager.createContext({ query: '{ hello }' }, {});
    const document = parse('{ hello }');

    await manager.beforeExecute(document, context);

    const response = await manager.afterExecute(
      { data: { hello: 'world' } },
      context
    );

    expect(response.extensions?.tracing).toBeDefined();
    expect((response.extensions?.tracing as { version: number }).version).toBe(1);
    expect((response.extensions?.tracing as { duration: number }).duration).toBeGreaterThan(0);
  });
});

describe('createDepthLimitPlugin', () => {
  test('should create depth limit plugin', () => {
    const plugin = createDepthLimitPlugin(5);

    expect(plugin.metadata.name).toBe('depth-limit');
    expect(plugin.afterParse).toBeDefined();
  });

  test('should allow queries within depth limit', async () => {
    const plugin = createDepthLimitPlugin(5);

    const manager = new PluginManager({ schema });
    await manager.register(plugin);

    const context = manager.createContext({ query: '{ hello }' }, {});
    const document = parse('{ hello }');

    // Should not throw
    await manager.afterParse(document, context);
  });

  test('should reject queries exceeding depth limit', async () => {
    const plugin = createDepthLimitPlugin(2);

    const manager = new PluginManager({ schema });
    await manager.register(plugin);

    const context = manager.createContext(
      { query: '{ user(id: "1") { posts { title } } }' },
      {}
    );
    const document = parse('{ user(id: "1") { posts { title } } }');

    await expect(manager.afterParse(document, context)).rejects.toThrow(
      /exceeds maximum allowed depth/
    );
  });
});

describe('createComplexityPlugin', () => {
  test('should create complexity plugin', () => {
    const plugin = createComplexityPlugin({ maxComplexity: 100 });

    expect(plugin.metadata.name).toBe('complexity');
    expect(plugin.afterParse).toBeDefined();
  });

  test('should allow queries within complexity limit', async () => {
    const plugin = createComplexityPlugin({ maxComplexity: 100 });

    const manager = new PluginManager({ schema });
    await manager.register(plugin);

    const context = manager.createContext({ query: '{ hello }' }, {});
    const document = parse('{ hello }');

    // Should not throw
    await manager.afterParse(document, context);
  });

  test('should reject queries exceeding complexity limit', async () => {
    const plugin = createComplexityPlugin({ maxComplexity: 2 });

    const manager = new PluginManager({ schema });
    await manager.register(plugin);

    const context = manager.createContext(
      { query: '{ user(id: "1") { id name posts { id title } } }' },
      {}
    );
    const document = parse('{ user(id: "1") { id name posts { id title } } }');

    await expect(manager.afterParse(document, context)).rejects.toThrow(
      /exceeds maximum allowed complexity/
    );
  });

  test('should consider list arguments as multipliers', async () => {
    const plugin = createComplexityPlugin({
      maxComplexity: 20,
      defaultComplexity: 1,
    });

    const manager = new PluginManager({ schema });
    await manager.register(plugin);

    const context = manager.createContext(
      { query: '{ users(first: 100) { id } }' },
      {}
    );
    const document = parse('{ users(first: 100) { id } }');

    await expect(manager.afterParse(document, context)).rejects.toThrow(
      /exceeds maximum allowed complexity/
    );
  });
});
