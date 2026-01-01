/**
 * @leaven-graphql/plugins - Plugin manager tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
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
