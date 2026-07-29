# @leaven-graphql/core

The core GraphQL execution engine for Leaven - a high-performance GraphQL library for Bun.

## Installation

```bash
bun add @leaven-graphql/core graphql
```

## Quick Start

```typescript
import { LeavenExecutor } from '@leaven-graphql/core';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

// Create a simple schema
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => 'Hello, world!',
      },
    },
  }),
});

// Create the executor
const executor = new LeavenExecutor({
  schema,
  cache: true,
});

// Execute a query
const result = await executor.execute({
  query: '{ hello }',
});

console.log(result.response.data);
// { hello: "Hello, world!" }
```

## Features

### Document Caching

Cache parsed documents and validation results for improved performance:

```typescript
const executor = new LeavenExecutor({
  schema,
  cache: {
    maxSize: 1000,      // Maximum cached documents
    ttl: 3600000,       // TTL in milliseconds (1 hour)
  },
});

// Check cache statistics (async — a Redis-backed cache answers over the wire)
const stats = await executor.getCacheStats();
console.log(stats);
// {
//   document: {
//     size: 42,        // entries currently cached
//     maxSize: 1000,
//     hitRate: 3.71,   // AVERAGE HITS PER ENTRY, not a hit/miss ratio
//     totalHits: 156,
//     entries: 42      // alias for `size`
//   },
//   compiled: { size: 38, maxSize: 1000 }
// }
```

`stats.document` is `null` when the executor was created with `cache: false`.

**`hitRate` is not a percentage.** It is `totalHits / size` — the average number
of times each cached entry has been reused. Misses are not tracked at all, so
the value is unbounded and routinely exceeds `1` on a warm cache.

`size` (and its alias `entries`) is exact for the in-memory cache. The Redis
cache maintains it as a counter updated on writes and deletes and cannot
observe server-side TTL expirations, so there it is an upper bound that drifts
upward.

### Redis Cache (Distributed)

For distributed deployments, use Redis as a cache backend:

```typescript
import { LeavenExecutor, createRedisCache } from '@leaven-graphql/core';
import Redis from 'ioredis';

const redis = new Redis();

const executor = new LeavenExecutor({
  schema,
  cache: createRedisCache({
    client: redis,
    prefix: 'gql:doc:',     // Redis key prefix
    ttl: 3600,              // TTL in seconds
    compress: true,         // Enable gzip compression
    compressionThreshold: 1024, // Compress documents > 1KB
    trackHits: false,       // Skip the per-hit INCR on a hot deployment
  }),
});
```

The Redis cache supports:
- **Distributed caching** across multiple server instances
- **Automatic TTL** handled by Redis
- **Gzip compression** for large documents
- **Validation caching** for faster repeated queries

### Lifecycle Hooks

Hook into the execution lifecycle:

```typescript
const executor = new LeavenExecutor({
  schema,
  hooks: {
    onParse(query) {
      console.log('Parsing query:', query);
    },
    onValidated(result) {
      if (!result.valid) {
        console.error('Validation errors:', result.errors);
      }
    },
    async onExecute(context, document) {
      console.log('Executing:', context.operationName);
    },
    async onExecuted(result) {
      console.log('Execution completed');
    },
    onError(error) {
      console.error('Execution error:', error);
    },
  },
});
```

`subscribe` runs the same hooks up to and including `onExecute`. It does not
call `onExecuted`, because a subscription yields a stream rather than one
response.

`onError` fires when the operation itself fails — a parse error, a
depth/token/complexity rejection, or anything thrown by an earlier hook. It
does **not** fire for resolver-level errors: graphql-js collects those into
`result.errors` and returns a normal (possibly partial) response. Inspect
`result.errors` in `onExecuted` to observe them.

### Execution Metrics

Track execution performance:

```typescript
const executor = new LeavenExecutor({
  schema,
  metrics: true,
});

const result = await executor.execute({ query: '{ users { name } }' });

console.log(result.metrics);
// {
//   timing: {
//     parseTime: 0.5,
//     validationTime: 1.2,
//     executionTime: 3.8,
//     totalTime: 5.5
//   },
//   documentCached: true,
//   validationCached: true,
//   queryCached: false
// }
```

### Context Support

Pass context to resolvers:

```typescript
interface AppContext {
  user: User | null;
  db: Database;
}

const result = await executor.execute<QueryData>(
  { query: '{ me { name } }' },
  {
    user: authenticatedUser,
    db: databaseConnection,
  }
);
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `schema` | `GraphQLSchema` | Required | Your GraphQL schema |
| `rootValue` | `unknown` | `undefined` | Root resolver value |
| `cache` | `DocumentCacheConfig \| boolean \| IDocumentCache` | `true` | Document cache configuration or custom cache |
| `parseOptions` | `ParseOptions` | `{}` | Parser options: `maxDepth`, `maxTokens`, and raw `graphqlOptions` |
| `compilerOptions` | `CompilerOptions` | `undefined` | Query compiler options |
| `maxDepth` | `number` | `undefined` | Maximum query depth (overrides `parseOptions.maxDepth`) |
| `maxComplexity` | `number` | `undefined` | Maximum query complexity (implies `compilerOptions.calculateComplexity`) |
| `hooks` | `ExecutionHooks` | `undefined` | Lifecycle hooks |
| `metrics` | `boolean` | `false` | Enable execution metrics (reported by `execute` only) |
| `introspection` | `boolean` | `true` | Enable introspection queries |

`maxDepth`, `maxComplexity` and `hooks` apply to subscriptions as well as
queries and mutations — `execute` and `subscribe` share one
parse/validate/compile pipeline.

## API Reference

### LeavenExecutor

The main executor class.

```typescript
class LeavenExecutor {
  constructor(config: ExecutorConfig);

  // Execute a query or mutation
  execute<TData = Record<string, unknown>, TContext = unknown>(
    request: GraphQLRequest,
    context?: TContext
  ): Promise<ExecutionResult<TData>>;

  // Start a subscription. Resolves to an async iterator on success, or to a
  // GraphQLResponse carrying `errors` on any failure — it never rejects.
  subscribe<TData = Record<string, unknown>, TContext = unknown>(
    request: GraphQLRequest,
    context?: TContext
  ): Promise<SubscriptionIterator<TData> | GraphQLResponse<TData>>;

  // Document and compiled-query cache statistics
  getCacheStats(): Promise<{
    document: CacheStats | null;
    compiled: { size: number; maxSize: number };
  }>;

  // Clear both the document cache and the compiled-query cache
  clearCaches(): Promise<void>;

  // The schema this executor was built with
  getSchema(): GraphQLSchema;
}
```

Parsing and validation are internal to `execute`/`subscribe`. To do them
yourself, use the standalone `parseDocument(query, options)` and
`validateDocument(schema, document, options)` exports.

### GraphQLRequest

```typescript
interface GraphQLRequest {
  query: string;
  operationName?: string;
  variables?: Record<string, unknown>;
  extensions?: Record<string, unknown>;
}
```

### ExecutionResult

```typescript
interface ExecutionResult<TData = Record<string, unknown>> {
  response: GraphQLResponse<TData>;
  metrics?: ExecutionMetrics;
}

interface GraphQLResponse<TData = Record<string, unknown>> {
  data?: TData | null;
  // Already formatted for the wire — spec-shaped plain objects, not
  // GraphQLError instances
  errors?: readonly GraphQLFormattedError[];
  extensions?: Record<string, unknown>;
}
```

Rejections carry a machine-readable `extensions.code` from
`@leaven-graphql/errors` — `DEPTH_LIMIT`, `COMPLEXITY_LIMIT`, `RATE_LIMITED`,
`INTERNAL_ERROR` and so on — which the HTTP layer maps to a status code.

### CacheStats

```typescript
interface CacheStats {
  // Exact in memory; an upward-drifting upper bound on Redis, which cannot
  // observe TTL expirations
  size: number;
  maxSize: number;
  // Average hits per entry (totalHits / size) — NOT a hit/miss ratio
  hitRate: number;
  totalHits: number;
  // Alias for `size`
  entries: number;
}
```

## License

Apache 2.0 - Joseph Quinn
