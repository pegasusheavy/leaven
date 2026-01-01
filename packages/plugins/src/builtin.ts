/**
 * @leaven-graphql/plugins - Built-in plugins
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { Kind } from 'graphql';
import type { Plugin, PluginHooks, PluginMetadata } from './types';

/**
 * Create a custom plugin
 */
export function createPlugin(
  metadata: PluginMetadata,
  hooks: PluginHooks
): Plugin {
  return {
    metadata,
    ...hooks,
  };
}

/**
 * Compose multiple plugins into one
 */
export function composePlugins(name: string, ...plugins: Plugin[]): Plugin {
  return {
    metadata: {
      name,
      description: `Composed plugin from: ${plugins.map((p) => p.metadata.name).join(', ')}`,
    },

    async onRegister(schema) {
      for (const plugin of plugins) {
        await plugin.onRegister?.(schema);
      }
    },

    async onUnregister() {
      for (const plugin of plugins) {
        await plugin.onUnregister?.();
      }
    },

    async beforeParse(query, context) {
      let result = query;
      for (const plugin of plugins) {
        if (plugin.beforeParse) {
          const modified = await plugin.beforeParse(result, context);
          if (typeof modified === 'string') {
            result = modified;
          }
        }
      }
      return result;
    },

    async afterParse(document, context) {
      let result = document;
      for (const plugin of plugins) {
        if (plugin.afterParse) {
          const modified = await plugin.afterParse(result, context);
          if (modified) {
            result = modified;
          }
        }
      }
      return result;
    },

    async beforeExecute(document, context) {
      for (const plugin of plugins) {
        await plugin.beforeExecute?.(document, context);
      }
    },

    async afterExecute(response, context) {
      let result = response;
      for (const plugin of plugins.slice().reverse()) {
        if (plugin.afterExecute) {
          const modified = await plugin.afterExecute(result, context);
          if (modified) {
            result = modified;
          }
        }
      }
      return result;
    },

    async onError(error, context) {
      let result = error;
      for (const plugin of plugins) {
        if (plugin.onError) {
          const modified = await plugin.onError(result, context);
          if (modified instanceof Error) {
            result = modified;
          }
        }
      }
      return result;
    },
  };
}

/**
 * Create a caching plugin
 */
export function createCachingPlugin(options?: {
  /** Maximum cache size */
  maxSize?: number;
  /** Cache TTL in milliseconds */
  ttl?: number;
}): Plugin {
  const cache = new Map<string, { data: unknown; expires: number }>();
  const maxSize = options?.maxSize ?? 100;
  const ttl = options?.ttl ?? 60000;

  return {
    metadata: {
      name: 'caching',
      version: '1.0.0',
      description: 'Caches query results',
    },

    async beforeExecute(document, context) {
      const key = JSON.stringify({
        query: context.request.query,
        variables: context.request.variables,
      });

      const cached = cache.get(key);
      if (cached && cached.expires > Date.now()) {
        context.state.set('cacheHit', true);
        context.state.set('cachedResponse', cached.data);
      }
    },

    async afterExecute(response, context) {
      if (context.state.get('cacheHit')) {
        return context.state.get('cachedResponse') as typeof response;
      }

      // Don't cache errors
      if (response.errors && response.errors.length > 0) {
        return response;
      }

      const key = JSON.stringify({
        query: context.request.query,
        variables: context.request.variables,
      });

      // Evict old entries if at max size
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }

      cache.set(key, {
        data: response,
        expires: Date.now() + ttl,
      });

      return response;
    },
  };
}

/**
 * Create a logging plugin
 */
export function createLoggingPlugin(options?: {
  /** Log level */
  level?: 'debug' | 'info' | 'warn' | 'error';
  /** Custom logger */
  logger?: {
    debug: (msg: string, data?: unknown) => void;
    info: (msg: string, data?: unknown) => void;
    warn: (msg: string, data?: unknown) => void;
    error: (msg: string, data?: unknown) => void;
  };
}): Plugin {
  const logger = options?.logger ?? console;
  const level = options?.level ?? 'info';

  const shouldLog = (msgLevel: string): boolean => {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(msgLevel) >= levels.indexOf(level);
  };

  return {
    metadata: {
      name: 'logging',
      version: '1.0.0',
      description: 'Logs GraphQL operations',
    },

    async beforeExecute(document, context) {
      context.state.set('startTime', performance.now());

      if (shouldLog('debug')) {
        logger.debug('Executing GraphQL operation', {
          operationName: context.request.operationName,
          query: context.request.query,
        });
      }
    },

    async afterExecute(response, context) {
      const startTime = context.state.get('startTime') as number;
      const duration = performance.now() - startTime;

      if (response.errors && response.errors.length > 0) {
        if (shouldLog('error')) {
          logger.error('GraphQL operation completed with errors', {
            operationName: context.request.operationName,
            duration: `${duration.toFixed(2)}ms`,
            errors: response.errors,
          });
        }
      } else {
        if (shouldLog('info')) {
          logger.info('GraphQL operation completed', {
            operationName: context.request.operationName,
            duration: `${duration.toFixed(2)}ms`,
          });
        }
      }

      return response;
    },

    async onError(error, context) {
      if (shouldLog('error')) {
        logger.error('GraphQL operation failed', {
          operationName: context.request.operationName,
          error: error.message,
        });
      }
      return error;
    },
  };
}

/**
 * Create a tracing plugin
 */
export function createTracingPlugin(): Plugin {
  return {
    metadata: {
      name: 'tracing',
      version: '1.0.0',
      description: 'Adds tracing information to responses',
    },

    async beforeExecute(document, context) {
      context.state.set('tracing', {
        version: 1,
        startTime: new Date().toISOString(),
        startHrTime: process.hrtime.bigint(),
        parsing: { startOffset: 0, duration: 0 },
        validation: { startOffset: 0, duration: 0 },
        execution: { startOffset: 0, duration: 0 },
      });
    },

    async afterExecute(response, context) {
      const tracing = context.state.get('tracing') as {
        version: number;
        startTime: string;
        startHrTime: bigint;
        parsing: { startOffset: number; duration: number };
        validation: { startOffset: number; duration: number };
        execution: { startOffset: number; duration: number };
      };

      if (!tracing) return response;

      const endHrTime = process.hrtime.bigint();
      const duration = Number(endHrTime - tracing.startHrTime);

      return {
        ...response,
        extensions: {
          ...response.extensions,
          tracing: {
            version: tracing.version,
            startTime: tracing.startTime,
            endTime: new Date().toISOString(),
            duration,
            parsing: tracing.parsing,
            validation: tracing.validation,
            execution: {
              ...tracing.execution,
              duration,
            },
          },
        },
      };
    },
  };
}

/**
 * Create a depth limit plugin
 */
export function createDepthLimitPlugin(maxDepth: number): Plugin {
  function calculateDepth(node: unknown, currentDepth: number = 0): number {
    if (!node || typeof node !== 'object') return currentDepth;

    const typedNode = node as {
      kind?: string;
      selectionSet?: { selections: unknown[] };
    };

    let maxFoundDepth = currentDepth;

    if (typedNode.kind === Kind.FIELD) {
      maxFoundDepth = currentDepth + 1;
    }

    if (typedNode.selectionSet) {
      for (const selection of typedNode.selectionSet.selections) {
        const depth = calculateDepth(selection, maxFoundDepth);
        if (depth > maxFoundDepth) {
          maxFoundDepth = depth;
        }
      }
    }

    return maxFoundDepth;
  }

  return {
    metadata: {
      name: 'depth-limit',
      version: '1.0.0',
      description: `Limits query depth to ${maxDepth}`,
    },

    async afterParse(document, _context) {
      let depth = 0;

      for (const definition of document.definitions) {
        if ((definition as { kind: string }).kind === Kind.OPERATION_DEFINITION) {
          const opDepth = calculateDepth(definition, 0);
          if (opDepth > depth) {
            depth = opDepth;
          }
        }
      }

      if (depth > maxDepth) {
        throw new Error(
          `Query depth of ${depth} exceeds maximum allowed depth of ${maxDepth}`
        );
      }

      return document;
    },
  };
}

/**
 * Create a complexity plugin
 */
export function createComplexityPlugin(options: {
  /** Maximum allowed complexity */
  maxComplexity: number;
  /** Default field complexity */
  defaultComplexity?: number;
  /** Custom complexity calculator */
  calculator?: (
    node: unknown,
    childComplexity: number
  ) => number;
}): Plugin {
  const { maxComplexity, defaultComplexity = 1 } = options;

  function calculateComplexity(
    node: unknown,
    depth: number = 0
  ): number {
    if (!node || typeof node !== 'object') return 0;

    const typedNode = node as {
      kind?: string;
      selectionSet?: { selections: unknown[] };
      arguments?: Array<{ name: { value: string }; value: { value?: string } }>;
    };

    let complexity = 0;

    if (typedNode.kind === Kind.FIELD) {
      // Check for list arguments that multiply complexity
      let multiplier = 1;
      if (typedNode.arguments) {
        for (const arg of typedNode.arguments) {
          if (
            arg.name.value === 'first' ||
            arg.name.value === 'last' ||
            arg.name.value === 'limit'
          ) {
            const value = parseInt(arg.value.value ?? '10', 10);
            if (!isNaN(value)) {
              multiplier = value;
            }
          }
        }
      }

      complexity = defaultComplexity * multiplier;
    }

    if (typedNode.selectionSet) {
      for (const selection of typedNode.selectionSet.selections) {
        complexity += calculateComplexity(selection, depth + 1);
      }
    }

    return complexity;
  }

  return {
    metadata: {
      name: 'complexity',
      version: '1.0.0',
      description: `Limits query complexity to ${maxComplexity}`,
    },

    async afterParse(document, context) {
      let totalComplexity = 0;

      for (const definition of document.definitions) {
        if ((definition as { kind: string }).kind === Kind.OPERATION_DEFINITION) {
          totalComplexity += calculateComplexity(definition, 0);
        }
      }

      context.state.set('complexity', totalComplexity);

      if (totalComplexity > maxComplexity) {
        throw new Error(
          `Query complexity of ${totalComplexity} exceeds maximum allowed complexity of ${maxComplexity}`
        );
      }

      return document;
    },
  };
}
