/**
 * @leaven-graphql/plugins - Plugin manager
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { DocumentNode, GraphQLSchema, GraphQLError } from 'graphql';
import type { GraphQLRequest, GraphQLResponse } from '@leaven-graphql/core';
import type { Plugin, PluginContext } from './types';

/**
 * Plugin manager configuration
 */
export interface PluginManagerConfig {
  /** GraphQL schema */
  schema: GraphQLSchema;
  /** Initial plugins to register */
  plugins?: Plugin[];
}

/**
 * Manages plugins and executes hooks
 */
export class PluginManager {
  private readonly schema: GraphQLSchema;
  private readonly plugins: Map<string, Plugin>;
  private readonly pluginOrder: string[];

  constructor(config: PluginManagerConfig) {
    this.schema = config.schema;
    this.plugins = new Map();
    this.pluginOrder = [];

    // Register initial plugins
    if (config.plugins) {
      for (const plugin of config.plugins) {
        this.register(plugin);
      }
    }
  }

  /**
   * Register a plugin
   */
  public async register(plugin: Plugin): Promise<void> {
    const { name } = plugin.metadata;

    if (this.plugins.has(name)) {
      throw new Error(`Plugin "${name}" is already registered`);
    }

    // Check dependencies
    if (plugin.metadata.dependencies) {
      for (const dep of plugin.metadata.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(
            `Plugin "${name}" depends on "${dep}" which is not registered`
          );
        }
      }
    }

    this.plugins.set(name, plugin);
    this.pluginOrder.push(name);

    // Call onRegister hook
    await plugin.onRegister?.(this.schema);
  }

  /**
   * Unregister a plugin
   */
  public async unregister(name: string): Promise<boolean> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      return false;
    }

    // Check if other plugins depend on this one
    for (const [otherName, otherPlugin] of this.plugins) {
      if (
        otherPlugin.metadata.dependencies?.includes(name) &&
        otherName !== name
      ) {
        throw new Error(
          `Cannot unregister "${name}": "${otherName}" depends on it`
        );
      }
    }

    // Call onUnregister hook
    await plugin.onUnregister?.();

    this.plugins.delete(name);
    const index = this.pluginOrder.indexOf(name);
    if (index !== -1) {
      this.pluginOrder.splice(index, 1);
    }

    return true;
  }

  /**
   * Get a plugin by name
   */
  public get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Check if a plugin is registered
   */
  public has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Get all registered plugin names
   */
  public getPluginNames(): string[] {
    return [...this.pluginOrder];
  }

  /**
   * Create a plugin context
   */
  public createContext<TContext>(
    request: GraphQLRequest,
    userContext: TContext
  ): PluginContext<TContext> {
    return {
      schema: this.schema,
      request,
      context: userContext,
      state: new Map(),
    };
  }

  /**
   * Execute beforeParse hooks
   */
  public async beforeParse(
    query: string,
    context: PluginContext
  ): Promise<string> {
    let result = query;

    for (const name of this.pluginOrder) {
      const plugin = this.plugins.get(name)!;
      if (plugin.beforeParse) {
        const modified = await plugin.beforeParse(result, context);
        if (typeof modified === 'string') {
          result = modified;
        }
      }
    }

    return result;
  }

  /**
   * Execute afterParse hooks
   */
  public async afterParse(
    document: DocumentNode,
    context: PluginContext
  ): Promise<DocumentNode> {
    let result = document;

    for (const name of this.pluginOrder) {
      const plugin = this.plugins.get(name)!;
      if (plugin.afterParse) {
        const modified = await plugin.afterParse(result, context);
        if (modified) {
          result = modified;
        }
      }
    }

    return result;
  }

  /**
   * Execute beforeValidate hooks
   */
  public async beforeValidate(
    document: DocumentNode,
    context: PluginContext
  ): Promise<void> {
    for (const name of this.pluginOrder) {
      const plugin = this.plugins.get(name)!;
      if (plugin.beforeValidate) {
        await plugin.beforeValidate(document, context);
      }
    }
  }

  /**
   * Execute afterValidate hooks
   */
  public async afterValidate(
    result: { valid: boolean; errors: readonly GraphQLError[] },
    context: PluginContext
  ): Promise<void> {
    for (const name of this.pluginOrder) {
      const plugin = this.plugins.get(name)!;
      if (plugin.afterValidate) {
        await plugin.afterValidate(result, context);
      }
    }
  }

  /**
   * Execute beforeExecute hooks
   */
  public async beforeExecute(
    document: DocumentNode,
    context: PluginContext
  ): Promise<void> {
    for (const name of this.pluginOrder) {
      const plugin = this.plugins.get(name)!;
      if (plugin.beforeExecute) {
        await plugin.beforeExecute(document, context);
      }
    }
  }

  /**
   * Execute afterExecute hooks
   */
  public async afterExecute(
    response: GraphQLResponse,
    context: PluginContext
  ): Promise<GraphQLResponse> {
    let result = response;

    // Execute in reverse order for after hooks
    for (let i = this.pluginOrder.length - 1; i >= 0; i--) {
      const name = this.pluginOrder[i]!;
      const plugin = this.plugins.get(name)!;
      if (plugin.afterExecute) {
        const modified = await plugin.afterExecute(result, context);
        if (modified) {
          result = modified;
        }
      }
    }

    return result;
  }

  /**
   * Execute onError hooks
   */
  public async onError(error: Error, context: PluginContext): Promise<Error> {
    let result = error;

    for (const name of this.pluginOrder) {
      const plugin = this.plugins.get(name)!;
      if (plugin.onError) {
        const modified = await plugin.onError(result, context);
        if (modified instanceof Error) {
          result = modified;
        }
      }
    }

    return result;
  }

  /**
   * Get the number of registered plugins
   */
  public get size(): number {
    return this.plugins.size;
  }

  /**
   * Clear all plugins
   */
  public async clear(): Promise<void> {
    // Unregister in reverse order
    for (let i = this.pluginOrder.length - 1; i >= 0; i--) {
      await this.unregister(this.pluginOrder[i]!);
    }
  }
}

/**
 * Create a new plugin manager
 */
export function createPluginManager(config: PluginManagerConfig): PluginManager {
  return new PluginManager(config);
}
