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

// Check cache statistics
const stats = await executor.getCacheStats();
console.log(stats);
// {
//   document: { size: 42, hits: 156, hitRate: 0.93 },
//   compiled: { size: 38 }
// }
```

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
//   queryCached: false,
//   resolverCount: 5
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
| `compilerOptions` | `CompilerOptions` | `undefined` | Query compiler options |
| `maxDepth` | `number` | `undefined` | Maximum query depth |
| `maxComplexity` | `number` | `undefined` | Maximum query complexity |
| `hooks` | `ExecutionHooks` | `undefined` | Lifecycle hooks |
| `metrics` | `boolean` | `false` | Enable execution metrics |
| `introspection` | `boolean` | `true` | Enable introspection queries |

## API Reference

### LeavenExecutor

The main executor class.

```typescript
class LeavenExecutor {
  constructor(config: ExecutorConfig);

  // Execute a GraphQL request
  execute<TData = Record<string, unknown>>(
    request: GraphQLRequest,
    context?: unknown
  ): Promise<ExecutionResult<TData>>;

  // Parse a query string into a DocumentNode
  parse(query: string): DocumentNode;

  // Validate a document against the schema
  validate(document: DocumentNode): ValidationResult;

  // Get cache statistics
  getCacheStats(): CacheStats;

  // Clear the document cache
  clearCache(): void;
}
```

### GraphQLRequest

```typescript
interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}
```

### ExecutionResult

```typescript
interface ExecutionResult<TData = Record<string, unknown>> {
  response: {
    data?: TData;
    errors?: GraphQLError[];
    extensions?: Record<string, unknown>;
  };
  metrics?: ExecutionMetrics;
}
```

## License

Apache 2.0 - Pegasus Heavy Industries LLC
