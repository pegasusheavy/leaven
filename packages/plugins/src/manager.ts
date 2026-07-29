/**
 * @leaven-graphql/plugins - Plugin manager
 *
 * Copyright 2026 Joseph Quinn
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
 * Names of the request-lifecycle hooks a plugin can implement, in a single
 * canonical list so dispatch indexes cannot drift from the `PluginHooks` type.
 */
const HOOK_NAMES = [
  'beforeParse',
  'afterParse',
  'beforeValidate',
  'afterValidate',
  'beforeExecute',
  'afterExecute',
  'onError',
] as const;

type HookName = (typeof HOOK_NAMES)[number];

/**
 * Manages plugins and executes hooks
 */
export class PluginManager {
  private readonly schema: GraphQLSchema;
  private readonly plugins: Map<string, Plugin>;
  private readonly pluginOrder: string[];
  /**
   * Per-hook dispatch index: for each hook name, the plugins that implement
   * that hook, in registration order. Maintained on register/unregister so
   * request-time dispatch iterates only plugins that implement the hook.
   */
  private readonly hookPlugins: Record<HookName, Plugin[]>;
  /** Constructor-registered plugins whose `onRegister` hooks are still deferred. */
  private pendingOnRegister: Plugin[];
  private initPromise: Promise<void> | undefined;
  private initialized: boolean;

  constructor(config: PluginManagerConfig) {
    this.schema = config.schema;
    this.plugins = new Map();
    this.pluginOrder = [];
    this.hookPlugins = {
      beforeParse: [],
      afterParse: [],
      beforeValidate: [],
      afterValidate: [],
      beforeExecute: [],
      afterExecute: [],
      onError: [],
    };
    this.pendingOnRegister = [];
    this.initPromise = undefined;

    // Register initial plugins synchronously so misconfiguration (duplicate
    // name, unsatisfied dependency) throws here, where the caller can catch
    // it, instead of becoming an unhandled promise rejection. Only the async
    // `onRegister` hooks are deferred; they run via `init()` (or lazily
    // before the first hook dispatch / registration change).
    if (config.plugins) {
      for (const plugin of config.plugins) {
        this.addPlugin(plugin);
        if (plugin.onRegister) {
          this.pendingOnRegister.push(plugin);
        }
      }
    }

    this.initialized = this.pendingOnRegister.length === 0;
  }

  /**
   * Synchronously validate and insert a plugin (duplicate-name check,
   * dependency check, map insertion, ordering, and hook-index update).
   */
  private addPlugin(plugin: Plugin): void {
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

    for (const hook of HOOK_NAMES) {
      if (plugin[hook]) {
        this.hookPlugins[hook].push(plugin);
      }
    }
  }

  /**
   * Run the deferred `onRegister` hooks of plugins passed to the constructor.
   *
   * Idempotent: hooks run at most once, in registration order, and concurrent
   * calls await the same run. The manager also awaits this lazily before
   * registering/unregistering plugins and before dispatching any hooks, so
   * calling it explicitly is optional but lets callers observe (and handle)
   * `onRegister` failures deterministically.
   *
   * A failure is NOT cached: the hooks that already succeeded are unwound via
   * their `onUnregister`, every deferred hook is queued again, and the wrapped
   * error is rethrown, so a later call retries the whole run instead of
   * replaying the boot-time rejection forever.
   */
  public async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const attempt = (this.initPromise ??= this.runPendingOnRegister());

    try {
      await attempt;
    } catch (error) {
      // Drop the memoized rejection so the next call can retry — unless a
      // retry is already in flight, whose promise must not be discarded.
      if (this.initPromise === attempt) {
        this.initPromise = undefined;
      }
      throw error;
    }
  }

  private async runPendingOnRegister(): Promise<void> {
    const pending = this.pendingOnRegister;
    this.pendingOnRegister = [];

    const registered: Plugin[] = [];

    for (const plugin of pending) {
      try {
        await plugin.onRegister?.(this.schema);
      } catch (error) {
        // Unwind the plugins that already registered, in reverse order, so a
        // partial initialization does not leak whatever they opened. Each
        // unwind is isolated: one failing `onUnregister` must not hide the
        // original error or skip the remaining unwinds.
        for (let i = registered.length - 1; i >= 0; i--) {
          try {
            await registered[i]!.onUnregister?.();
          } catch {
            // Ignored: the initialization error below is the real failure.
          }
        }

        // Nothing is initialized now, so every deferred hook — including the
        // ones that were unwound — is pending again for the next attempt.
        this.pendingOnRegister = pending;

        throw new Error('Plugin initialization failed', { cause: error });
      }

      registered.push(plugin);
    }

    this.initialized = true;
  }

  /**
   * Remove a plugin from the registry, ordering, and every hook dispatch
   * index. The inverse of {@link addPlugin}; it does NOT run `onUnregister`.
   */
  private removePlugin(plugin: Plugin): void {
    const { name } = plugin.metadata;

    this.plugins.delete(name);
    const index = this.pluginOrder.indexOf(name);
    if (index !== -1) {
      this.pluginOrder.splice(index, 1);
    }

    for (const hook of HOOK_NAMES) {
      const list = this.hookPlugins[hook];
      const hookIndex = list.indexOf(plugin);
      if (hookIndex !== -1) {
        list.splice(hookIndex, 1);
      }
    }
  }

  /**
   * Register a plugin
   *
   * A failing `onRegister` unwinds the insertion: the plugin is removed from
   * the registry and every hook index before the error is rethrown, so a
   * plugin that failed to initialize never has its request hooks dispatched
   * and the same registration can be retried.
   */
  public async register(plugin: Plugin): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }

    this.addPlugin(plugin);

    // Call onRegister hook
    try {
      await plugin.onRegister?.(this.schema);
    } catch (error) {
      this.removePlugin(plugin);
      throw error;
    }
  }

  /**
   * Unregister a plugin
   */
  public async unregister(name: string): Promise<boolean> {
    if (!this.initialized) {
      await this.init();
    }

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

    this.removePlugin(plugin);

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
    if (!this.initialized) {
      await this.init();
    }

    let result = query;

    for (const plugin of this.hookPlugins.beforeParse) {
      const modified = await plugin.beforeParse!(result, context);
      if (typeof modified === 'string') {
        result = modified;
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
    if (!this.initialized) {
      await this.init();
    }

    let result = document;

    for (const plugin of this.hookPlugins.afterParse) {
      const modified = await plugin.afterParse!(result, context);
      if (modified) {
        result = modified;
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
    if (!this.initialized) {
      await this.init();
    }

    for (const plugin of this.hookPlugins.beforeValidate) {
      await plugin.beforeValidate!(document, context);
    }
  }

  /**
   * Execute afterValidate hooks
   */
  public async afterValidate(
    result: { valid: boolean; errors: readonly GraphQLError[] },
    context: PluginContext
  ): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }

    for (const plugin of this.hookPlugins.afterValidate) {
      await plugin.afterValidate!(result, context);
    }
  }

  /**
   * Execute beforeExecute hooks
   *
   * If a hook returns a {@link GraphQLResponse}, dispatch stops (later
   * `beforeExecute` hooks are skipped) and the response is returned so the
   * caller may use it as the operation result and skip execution — e.g. a
   * caching plugin serving a stored response. Returns `undefined` when no
   * hook short-circuits, in which case the caller proceeds with execution
   * exactly as before.
   */
  public async beforeExecute(
    document: DocumentNode,
    context: PluginContext
  ): Promise<GraphQLResponse | undefined> {
    if (!this.initialized) {
      await this.init();
    }

    for (const plugin of this.hookPlugins.beforeExecute) {
      const response = await plugin.beforeExecute!(document, context);
      if (response) {
        return response;
      }
    }

    return undefined;
  }

  /**
   * Execute afterExecute hooks
   */
  public async afterExecute(
    response: GraphQLResponse,
    context: PluginContext
  ): Promise<GraphQLResponse> {
    if (!this.initialized) {
      await this.init();
    }

    let result = response;

    // Execute in reverse order for after hooks
    const list = this.hookPlugins.afterExecute;
    for (let i = list.length - 1; i >= 0; i--) {
      const modified = await list[i]!.afterExecute!(result, context);
      if (modified) {
        result = modified;
      }
    }

    return result;
  }

  /**
   * Execute onError hooks
   */
  public async onError(error: Error, context: PluginContext): Promise<Error> {
    if (!this.initialized) {
      await this.init();
    }

    let result = error;

    for (const plugin of this.hookPlugins.onError) {
      const modified = await plugin.onError!(result, context);
      if (modified instanceof Error) {
        result = modified;
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
