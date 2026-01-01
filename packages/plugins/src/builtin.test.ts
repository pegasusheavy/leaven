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
