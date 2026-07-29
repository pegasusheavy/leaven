/**
 * @leaven-graphql/plugins - Plugin system for Leaven
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 */

export { PluginManager, createPluginManager } from './manager';
export type { PluginManagerConfig } from './manager';

export type {
  Plugin,
  PluginContext,
  PluginHooks,
  PluginMetadata,
  BeforeParseHook,
  AfterParseHook,
  BeforeValidateHook,
  AfterValidateHook,
  BeforeExecuteHook,
  AfterExecuteHook,
  OnErrorHook,
} from './types';

export {
  createPlugin,
  composePlugins,
  createCachingPlugin,
  createLoggingPlugin,
  createTracingPlugin,
  createDepthLimitPlugin,
  createComplexityPlugin,
} from './builtin';
