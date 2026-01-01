# @leaven-graphql/plugins

Plugin system for extending Leaven with caching, logging, tracing, and more.

## Installation

```bash
bun add @leaven-graphql/plugins
```

## Quick Start

```typescript
import { createLoggingPlugin, createDepthLimitPlugin } from '@leaven-graphql/plugins';
import { LeavenExecutor } from '@leaven-graphql/core';

const executor = new LeavenExecutor({
  schema,
  plugins: [
    createLoggingPlugin({ logger: console }),
    createDepthLimitPlugin({ maxDepth: 10 }),
  ],
});
```

## Built-in Plugins

### Logging Plugin

```typescript
import { createLoggingPlugin } from '@leaven-graphql/plugins';

const loggingPlugin = createLoggingPlugin({
  logger: console,
  logLevel: 'info',
  includeVariables: false,
  includeResult: false,
});

// Output:
// [GraphQL] Query getUser started
// [GraphQL] Query getUser completed in 15ms
```

### Tracing Plugin

```typescript
import { createTracingPlugin } from '@leaven-graphql/plugins';

const tracingPlugin = createTracingPlugin({
  includeResolvers: true,
  includeValidation: true,
});

// Adds tracing to response extensions:
// {
//   extensions: {
//     tracing: {
//       version: 1,
//       startTime: "2026-01-01T12:00:00.000Z",
//       duration: 15000000,
//       execution: { ... }
//     }
//   }
// }
```

### Depth Limit Plugin

```typescript
import { createDepthLimitPlugin } from '@leaven-graphql/plugins';

const depthLimitPlugin = createDepthLimitPlugin({
  maxDepth: 10,
  ignoreIntrospection: true,
});

// Rejects queries that are too deeply nested
```

### Complexity Plugin

```typescript
import { createComplexityPlugin } from '@leaven-graphql/plugins';

const complexityPlugin = createComplexityPlugin({
  maxComplexity: 1000,
  defaultFieldComplexity: 1,
  scalarCost: 0,
  objectCost: 1,
  listFactor: 10,
});

// Calculates and enforces query complexity
```

### Caching Plugin

```typescript
import { createCachingPlugin } from '@leaven-graphql/plugins';

const cachingPlugin = createCachingPlugin({
  ttl: 60000,           // Cache TTL in ms
  maxSize: 100,         // Max cached responses
  keyGenerator: (request) => {
    return `${request.query}:${JSON.stringify(request.variables)}`;
  },
});
```

## Creating Custom Plugins

```typescript
import { createPlugin } from '@leaven-graphql/plugins';

const metricsPlugin = createPlugin({
  name: 'metrics',
  version: '1.0.0',

  beforeParse: (query, context) => {
    context.startTime = performance.now();
    return query;
  },

  afterExecute: (result, context) => {
    const duration = performance.now() - context.startTime;

    metrics.record({
      operation: context.operationName,
      duration,
      errors: result.errors?.length ?? 0,
    });

    return result;
  },

  onError: (error, context) => {
    metrics.recordError({
      operation: context.operationName,
      error: error.message,
    });
  },
});
```

## Plugin Manager

```typescript
import { PluginManager, createPluginManager } from '@leaven-graphql/plugins';

const manager = createPluginManager({
  schema,
  plugins: [
    createLoggingPlugin({ logger: console }),
    createTracingPlugin(),
    createDepthLimitPlugin({ maxDepth: 10 }),
  ],
});

// Register additional plugins
manager.register(myCustomPlugin);

// Unregister plugins
manager.unregister('logging');

// Get registered plugin names
const plugins = manager.getPluginNames();
```

## Composing Plugins

```typescript
import { composePlugins } from '@leaven-graphql/plugins';

const combinedPlugin = composePlugins([
  createLoggingPlugin({ logger: console }),
  createTracingPlugin(),
  createDepthLimitPlugin({ maxDepth: 10 }),
  createComplexityPlugin({ maxComplexity: 500 }),
]);

const executor = new LeavenExecutor({
  schema,
  plugins: [combinedPlugin],
});
```

## Plugin Hooks

| Hook | Description |
|------|-------------|
| `beforeParse` | Called before parsing the query string |
| `afterParse` | Called after parsing, receives DocumentNode |
| `beforeValidate` | Called before schema validation |
| `afterValidate` | Called after validation with results |
| `beforeExecute` | Called before resolver execution |
| `afterExecute` | Called after execution with results |
| `onError` | Called when an error occurs |

## API Reference

### Plugin Interface

```typescript
interface Plugin {
  name: string;
  version?: string;

  beforeParse?(query: string, context: PluginContext): string | void;
  afterParse?(document: DocumentNode, context: PluginContext): DocumentNode | void;
  beforeValidate?(document: DocumentNode, context: PluginContext): void;
  afterValidate?(result: ValidationResult, context: PluginContext): void;
  beforeExecute?(context: PluginContext): void | Promise<void>;
  afterExecute?(result: ExecutionResult, context: PluginContext): ExecutionResult | void;
  onError?(error: Error, context: PluginContext): void;
}
```

### createPlugin

```typescript
function createPlugin(config: Plugin): Plugin;
```

### composePlugins

```typescript
function composePlugins(plugins: Plugin[]): Plugin;
```

### PluginManager

```typescript
class PluginManager {
  register(plugin: Plugin): void;
  unregister(name: string): void;
  getPluginNames(): string[];
  execute<T>(hookName: string, ...args: unknown[]): T;
}
```

## License

Apache 2.0 - Pegasus Heavy Industries LLC
