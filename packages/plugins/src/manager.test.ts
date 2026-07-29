/**
 * @leaven-graphql/plugins - Plugin manager tests
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { buildSchema, parse } from 'graphql';
import { PluginManager, createPluginManager } from './manager';
import type { Plugin } from './types';

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager({ schema });
  });

  describe('constructor', () => {
    test('should create manager with schema', () => {
      expect(manager).toBeDefined();
      expect(manager.size).toBe(0);
    });

    test('should register initial plugins', async () => {
      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
      };

      const managerWithPlugins = new PluginManager({
        schema,
        plugins: [plugin],
      });

      expect(managerWithPlugins.size).toBe(1);
    });

    test('should throw synchronously for duplicate plugin names', () => {
      expect(
        () =>
          new PluginManager({
            schema,
            plugins: [
              { metadata: { name: 'dup' } },
              { metadata: { name: 'dup' } },
            ],
          })
      ).toThrow(/already registered/);
    });

    test('should throw synchronously for missing dependencies', () => {
      expect(
        () =>
          new PluginManager({
            schema,
            plugins: [
              {
                metadata: { name: 'dependent', dependencies: ['missing'] },
              },
            ],
          })
      ).toThrow(/depends on "missing" which is not registered/);
    });

    test('should defer constructor onRegister hooks until init()', async () => {
      let registerCalled = false;

      const managerWithPlugins = new PluginManager({
        schema,
        plugins: [
          {
            metadata: { name: 'deferred' },
            onRegister: () => {
              registerCalled = true;
            },
          },
        ],
      });

      // Plugin is registered synchronously, but onRegister has not fired yet
      expect(managerWithPlugins.has('deferred')).toBe(true);
      expect(registerCalled).toBe(false);

      await managerWithPlugins.init();
      expect(registerCalled).toBe(true);

      // init() is idempotent
      await managerWithPlugins.init();
    });

    test('should run deferred onRegister hooks lazily before register()', async () => {
      const calls: string[] = [];

      const managerWithPlugins = new PluginManager({
        schema,
        plugins: [
          {
            metadata: { name: 'first' },
            onRegister: () => {
              calls.push('first');
            },
          },
        ],
      });

      await managerWithPlugins.register({
        metadata: { name: 'second' },
        onRegister: () => {
          calls.push('second');
        },
      });

      expect(calls).toEqual(['first', 'second']);
    });

    test('should unwind and rethrow when a deferred onRegister fails', async () => {
      const calls: string[] = [];

      const managerWithPlugins = new PluginManager({
        schema,
        plugins: [
          {
            metadata: { name: 'first' },
            onRegister: () => {
              calls.push('first:onRegister');
            },
            onUnregister: () => {
              calls.push('first:onUnregister');
            },
          },
          {
            metadata: { name: 'failing' },
            onRegister: () => {
              calls.push('failing:onRegister');
              throw new Error('boom');
            },
          },
          {
            metadata: { name: 'never-run' },
            onRegister: () => {
              calls.push('never-run:onRegister');
            },
          },
        ],
      });

      const error = await managerWithPlugins.init().then(
        () => null,
        (e: unknown) => e as Error
      );

      expect(error).toBeInstanceOf(Error);
      expect(error!.message).toBe('Plugin initialization failed');
      expect((error!.cause as Error).message).toBe('boom');

      // The plugin that already registered is unwound; the ones after the
      // failure never ran
      expect(calls).toEqual([
        'first:onRegister',
        'failing:onRegister',
        'first:onUnregister',
      ]);
    });

    test('should retry initialization after a failed onRegister instead of caching the rejection', async () => {
      const calls: string[] = [];
      let attempts = 0;

      const managerWithPlugins = new PluginManager({
        schema,
        plugins: [
          {
            metadata: { name: 'first' },
            onRegister: () => {
              calls.push('first:onRegister');
            },
            onUnregister: () => {
              calls.push('first:onUnregister');
            },
          },
          {
            metadata: { name: 'flaky' },
            onRegister: () => {
              calls.push('flaky:onRegister');
              if (attempts++ === 0) {
                throw new Error('transient');
              }
            },
          },
        ],
      });

      // Hook dispatch surfaces the failure...
      await expect(
        managerWithPlugins.beforeParse(
          '{ hello }',
          managerWithPlugins.createContext({ query: '{ hello }' }, {})
        )
      ).rejects.toThrow('Plugin initialization failed');

      // ...and the next call retries the whole run rather than replaying it
      const result = await managerWithPlugins.beforeParse(
        '{ hello }',
        managerWithPlugins.createContext({ query: '{ hello }' }, {})
      );

      expect(result).toBe('{ hello }');
      expect(calls).toEqual([
        'first:onRegister',
        'flaky:onRegister',
        'first:onUnregister',
        'first:onRegister',
        'flaky:onRegister',
      ]);

      // Once initialized, later calls do not re-run the hooks
      await managerWithPlugins.init();
      expect(calls).toHaveLength(5);
    });

    test('should retry when the very first onRegister throws synchronously', async () => {
      let attempts = 0;

      const managerWithPlugins = new PluginManager({
        schema,
        plugins: [
          {
            metadata: { name: 'flaky' },
            onRegister: () => {
              if (attempts++ === 0) {
                throw new Error('transient');
              }
            },
          },
        ],
      });

      await expect(managerWithPlugins.init()).rejects.toThrow(
        'Plugin initialization failed'
      );
      await managerWithPlugins.init();

      expect(attempts).toBe(2);
    });

    test('should report the original failure even if unwinding fails', async () => {
      const managerWithPlugins = new PluginManager({
        schema,
        plugins: [
          {
            metadata: { name: 'first' },
            onRegister: () => {},
            onUnregister: () => {
              throw new Error('unwind failed');
            },
          },
          {
            metadata: { name: 'failing' },
            onRegister: () => {
              throw new Error('boom');
            },
          },
        ],
      });

      const error = await managerWithPlugins.init().then(
        () => null,
        (e: unknown) => e as Error
      );

      expect((error!.cause as Error).message).toBe('boom');
    });

    test('should share one failure between concurrent init callers', async () => {
      let attempts = 0;

      const managerWithPlugins = new PluginManager({
        schema,
        plugins: [
          {
            metadata: { name: 'flaky' },
            onRegister: async () => {
              await Promise.resolve();
              attempts++;
              throw new Error('transient');
            },
          },
        ],
      });

      const results = await Promise.allSettled([
        managerWithPlugins.init(),
        managerWithPlugins.init(),
      ]);

      expect(results.map((r) => r.status)).toEqual(['rejected', 'rejected']);
      expect(attempts).toBe(1);

      // The shared rejection is still not cached
      await expect(managerWithPlugins.init()).rejects.toThrow(
        'Plugin initialization failed'
      );
      expect(attempts).toBe(2);
    });
  });

  describe('register', () => {
    test('should register a plugin', async () => {
      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
      };

      await manager.register(plugin);

      expect(manager.has('test-plugin')).toBe(true);
      expect(manager.size).toBe(1);
    });

    test('should call onRegister hook', async () => {
      let registerCalled = false;

      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
        onRegister: () => {
          registerCalled = true;
        },
      };

      await manager.register(plugin);

      expect(registerCalled).toBe(true);
    });

    test('should throw for duplicate plugin', async () => {
      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
      };

      await manager.register(plugin);

      await expect(manager.register(plugin)).rejects.toThrow(/already registered/);
    });

    test('should check dependencies', async () => {
      const dependentPlugin: Plugin = {
        metadata: {
          name: 'dependent',
          dependencies: ['base-plugin'],
        },
      };

      await expect(manager.register(dependentPlugin)).rejects.toThrow(
        /depends on.*not registered/
      );
    });

    test('should allow plugin with satisfied dependencies', async () => {
      const basePlugin: Plugin = {
        metadata: { name: 'base-plugin' },
      };

      const dependentPlugin: Plugin = {
        metadata: {
          name: 'dependent',
          dependencies: ['base-plugin'],
        },
      };

      await manager.register(basePlugin);
      await manager.register(dependentPlugin);

      expect(manager.has('dependent')).toBe(true);
    });

    test('should unwind the registration when onRegister fails', async () => {
      const plugin: Plugin = {
        metadata: { name: 'failing' },
        onRegister: () => {
          throw new Error('boom');
        },
        beforeParse: (query) => query,
      };

      await expect(manager.register(plugin)).rejects.toThrow('boom');

      // The plugin must not be left registered with live request hooks
      expect(manager.has('failing')).toBe(false);
      expect(manager.size).toBe(0);
      expect(manager.getPluginNames()).toEqual([]);
      expect(manager.get('failing')).toBeUndefined();
    });

    test('should not dispatch hooks of a plugin whose onRegister failed', async () => {
      let dispatched = 0;

      const plugin: Plugin = {
        metadata: { name: 'failing' },
        onRegister: () => {
          throw new Error('boom');
        },
        beforeParse: (query) => {
          dispatched++;
          return query;
        },
        afterExecute: (response) => {
          dispatched++;
          return response;
        },
      };

      await expect(manager.register(plugin)).rejects.toThrow('boom');

      const context = manager.createContext({ query: '{ hello }' }, {});
      await manager.beforeParse('{ hello }', context);
      await manager.afterExecute({ data: {} }, context);

      expect(dispatched).toBe(0);
    });

    test('should allow retrying a registration whose onRegister failed', async () => {
      let attempts = 0;

      const plugin: Plugin = {
        metadata: { name: 'flaky' },
        onRegister: () => {
          attempts++;
          if (attempts === 1) {
            throw new Error('boom');
          }
        },
      };

      await expect(manager.register(plugin)).rejects.toThrow('boom');

      // The retry must not fail with `already registered`
      await manager.register(plugin);

      expect(attempts).toBe(2);
      expect(manager.has('flaky')).toBe(true);
      expect(manager.size).toBe(1);
    });

    test('should unwind when an async onRegister rejects', async () => {
      const plugin: Plugin = {
        metadata: { name: 'async-failing' },
        onRegister: async () => {
          await Promise.resolve();
          throw new Error('async boom');
        },
      };

      await expect(manager.register(plugin)).rejects.toThrow('async boom');

      expect(manager.has('async-failing')).toBe(false);
      expect(manager.size).toBe(0);
    });

    test('should leave a dependency-satisfied registration intact after an unwind', async () => {
      const basePlugin: Plugin = {
        metadata: { name: 'base-plugin' },
      };

      const failing: Plugin = {
        metadata: { name: 'failing', dependencies: ['base-plugin'] },
        onRegister: () => {
          throw new Error('boom');
        },
      };

      await manager.register(basePlugin);
      await expect(manager.register(failing)).rejects.toThrow('boom');

      // Only the failing plugin is unwound
      expect(manager.getPluginNames()).toEqual(['base-plugin']);

      // ...and the base plugin is still unregisterable, i.e. no phantom
      // dependent was left behind
      expect(await manager.unregister('base-plugin')).toBe(true);
    });
  });

  describe('unregister', () => {
    test('should unregister a plugin', async () => {
      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
      };

      await manager.register(plugin);
      const result = await manager.unregister('test-plugin');

      expect(result).toBe(true);
      expect(manager.has('test-plugin')).toBe(false);
    });

    test('should call onUnregister hook', async () => {
      let unregisterCalled = false;

      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
        onUnregister: () => {
          unregisterCalled = true;
        },
      };

      await manager.register(plugin);
      await manager.unregister('test-plugin');

      expect(unregisterCalled).toBe(true);
    });

    test('should return false for non-existent plugin', async () => {
      const result = await manager.unregister('non-existent');
      expect(result).toBe(false);
    });

    test('should prevent unregistering if depended upon', async () => {
      const basePlugin: Plugin = {
        metadata: { name: 'base-plugin' },
      };

      const dependentPlugin: Plugin = {
        metadata: {
          name: 'dependent',
          dependencies: ['base-plugin'],
        },
      };

      await manager.register(basePlugin);
      await manager.register(dependentPlugin);

      await expect(manager.unregister('base-plugin')).rejects.toThrow(
        /depends on it/
      );
    });
  });

  describe('get', () => {
    test('should get a registered plugin', async () => {
      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
      };

      await manager.register(plugin);
      const retrieved = manager.get('test-plugin');

      expect(retrieved).toBeDefined();
      expect(retrieved?.metadata.name).toBe('test-plugin');
    });

    test('should return undefined for non-existent plugin', () => {
      expect(manager.get('non-existent')).toBeUndefined();
    });
  });

  describe('has', () => {
    test('should return true for registered plugin', async () => {
      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
      };

      await manager.register(plugin);
      expect(manager.has('test-plugin')).toBe(true);
    });

    test('should return false for non-registered plugin', () => {
      expect(manager.has('non-existent')).toBe(false);
    });
  });

  describe('getPluginNames', () => {
    test('should return all plugin names in order', async () => {
      await manager.register({ metadata: { name: 'plugin-a' } });
      await manager.register({ metadata: { name: 'plugin-b' } });
      await manager.register({ metadata: { name: 'plugin-c' } });

      const names = manager.getPluginNames();

      expect(names).toEqual(['plugin-a', 'plugin-b', 'plugin-c']);
    });
  });

  describe('hook execution', () => {
    test('should execute beforeParse hooks', async () => {
      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
        beforeParse: (query) => query.replace('hello', 'goodbye'),
      };

      await manager.register(plugin);

      const context = manager.createContext({ query: '{ hello }' }, {});
      const result = await manager.beforeParse('{ hello }', context);

      expect(result).toBe('{ goodbye }');
    });

    test('should execute afterParse hooks', async () => {
      let parsedDocument = null;

      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
        afterParse: (doc) => {
          parsedDocument = doc;
        },
      };

      await manager.register(plugin);

      const context = manager.createContext({ query: '{ hello }' }, {});
      const document = parse('{ hello }');
      await manager.afterParse(document, context);

      expect(parsedDocument).toBeDefined();
    });

    test('should execute beforeValidate hooks', async () => {
      let validateCalled = false;

      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
        beforeValidate: () => {
          validateCalled = true;
        },
      };

      await manager.register(plugin);

      const context = manager.createContext({ query: '{ hello }' }, {});
      const document = parse('{ hello }');
      await manager.beforeValidate(document, context);

      expect(validateCalled).toBe(true);
    });

    test('should execute afterValidate hooks', async () => {
      let validationResult = null;

      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
        afterValidate: (result) => {
          validationResult = result;
        },
      };

      await manager.register(plugin);

      const context = manager.createContext({ query: '{ hello }' }, {});
      await manager.afterValidate({ valid: true, errors: [] }, context);

      expect(validationResult).toEqual({ valid: true, errors: [] });
    });

    test('should execute beforeExecute hooks', async () => {
      let executeCalled = false;

      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
        beforeExecute: () => {
          executeCalled = true;
        },
      };

      await manager.register(plugin);

      const context = manager.createContext({ query: '{ hello }' }, {});
      const document = parse('{ hello }');
      await manager.beforeExecute(document, context);

      expect(executeCalled).toBe(true);
    });

    test('should surface a response returned by beforeExecute and skip later hooks', async () => {
      const calls: string[] = [];

      const shortCircuit: Plugin = {
        metadata: { name: 'short-circuit' },
        beforeExecute: () => {
          calls.push('short-circuit');
          return { data: { hello: 'cached' } };
        },
      };

      const later: Plugin = {
        metadata: { name: 'later' },
        beforeExecute: () => {
          calls.push('later');
        },
      };

      await manager.register(shortCircuit);
      await manager.register(later);

      const context = manager.createContext({ query: '{ hello }' }, {});
      const result = await manager.beforeExecute(parse('{ hello }'), context);

      expect(result).toEqual({ data: { hello: 'cached' } });
      expect(calls).toEqual(['short-circuit']);
    });

    test('should return undefined from beforeExecute when no hook short-circuits', async () => {
      const plugin: Plugin = {
        metadata: { name: 'noop' },
        beforeExecute: () => {},
      };

      await manager.register(plugin);

      const context = manager.createContext({ query: '{ hello }' }, {});
      const result = await manager.beforeExecute(parse('{ hello }'), context);

      expect(result).toBeUndefined();
    });

    test('should execute afterExecute hooks in reverse order', async () => {
      const order: string[] = [];

      const plugin1: Plugin = {
        metadata: { name: 'plugin-1' },
        afterExecute: () => {
          order.push('plugin-1');
        },
      };

      const plugin2: Plugin = {
        metadata: { name: 'plugin-2' },
        afterExecute: () => {
          order.push('plugin-2');
        },
      };

      await manager.register(plugin1);
      await manager.register(plugin2);

      const context = manager.createContext({ query: '{ hello }' }, {});
      await manager.afterExecute({ data: { hello: 'world' } }, context);

      expect(order).toEqual(['plugin-2', 'plugin-1']);
    });

    test('should stop dispatching hooks of unregistered plugins', async () => {
      const calls: string[] = [];

      await manager.register({
        metadata: { name: 'plugin-a' },
        beforeParse: () => {
          calls.push('plugin-a');
        },
      });
      await manager.register({
        metadata: { name: 'plugin-b' },
        beforeParse: () => {
          calls.push('plugin-b');
        },
      });

      await manager.unregister('plugin-a');

      const context = manager.createContext({ query: '{ hello }' }, {});
      await manager.beforeParse('{ hello }', context);

      expect(calls).toEqual(['plugin-b']);
    });

    test('should execute onError hooks', async () => {
      let caughtError = null;

      const plugin: Plugin = {
        metadata: { name: 'test-plugin' },
        onError: (error) => {
          caughtError = error;
        },
      };

      await manager.register(plugin);

      const context = manager.createContext({ query: '{ hello }' }, {});
      const error = new Error('Test error');
      await manager.onError(error, context);

      expect(caughtError).toBe(error);
    });
  });

  describe('createContext', () => {
    test('should create plugin context', () => {
      const context = manager.createContext({ query: '{ hello }' }, { userId: '1' });

      expect(context.schema).toBe(schema);
      expect(context.request.query).toBe('{ hello }');
      expect(context.context).toEqual({ userId: '1' });
      expect(context.state).toBeInstanceOf(Map);
    });
  });

  describe('clear', () => {
    test('should clear all plugins', async () => {
      await manager.register({ metadata: { name: 'plugin-1' } });
      await manager.register({ metadata: { name: 'plugin-2' } });

      await manager.clear();

      expect(manager.size).toBe(0);
    });
  });
});

describe('createPluginManager', () => {
  test('should create a PluginManager', () => {
    const manager = createPluginManager({ schema });
    expect(manager).toBeInstanceOf(PluginManager);
  });
});
