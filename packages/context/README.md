# @leaven-graphql/context

Request context management for Leaven using AsyncLocalStorage.

## Installation

```bash
bun add @leaven-graphql/context
```

## Quick Start

```typescript
import { createRequestContext, ContextStore } from '@leaven-graphql/context';

// Create context from an HTTP request
const context = createRequestContext(request, {
  includeHeaders: true,
  includeIp: true,
});

console.log(context.requestId);   // Unique request ID
console.log(context.url);         // Request URL
console.log(context.method);      // HTTP method
```

## Features

### Request Context

Create context from HTTP requests:

```typescript
import { createRequestContext, RequestContext } from '@leaven-graphql/context';

const context = createRequestContext(request, {
  includeHeaders: true,
  includeIp: true,
});

// Properties available
context.requestId;    // Unique ID for the request
context.url;          // Request URL
context.method;       // HTTP method (GET, POST, etc.)
context.headers;      // Request headers (Map)
context.ip;           // Client IP address
context.userAgent;    // User agent string
context.startTime;    // Request start timestamp
```

### Context Store

Use AsyncLocalStorage for request-scoped context:

```typescript
import { ContextStore, createContextStore } from '@leaven-graphql/context';

const store = createContextStore();

// Run code with context
store.run({ userId: '123', role: 'admin' }, async () => {
  // Context is available anywhere in this async scope
  const context = store.getContext();
  console.log(context.userId); // '123'

  // Works in nested function calls
  await someNestedFunction();
});

async function someNestedFunction() {
  const context = store.getContext();
  console.log(context.role); // 'admin'
}
```

### Context Builder

Build complex contexts with the fluent API:

```typescript
import { ContextBuilder, createContextBuilder } from '@leaven-graphql/context';

const context = createContextBuilder()
  .withRequest(request)
  .withUser(authenticatedUser)
  .withDatabase(dbConnection)
  .withLogger(logger)
  .withTracing(traceId)
  .build();
```

### Custom Context Types

Extend the base context with your own types:

```typescript
import type { BaseContext, ContextExtension } from '@leaven-graphql/context';

interface AppContext extends BaseContext {
  user: User | null;
  db: Database;
  cache: CacheClient;
  permissions: string[];
}

function createAppContext(request: Request): AppContext {
  return {
    requestId: crypto.randomUUID(),
    startTime: Date.now(),
    user: null,
    db: database,
    cache: cacheClient,
    permissions: [],
  };
}
```

## Integration with HTTP

```typescript
import { createServer } from '@leaven-graphql/http';
import { createRequestContext } from '@leaven-graphql/context';

const server = createServer({
  schema,
  context: async (request, graphqlRequest) => {
    const baseContext = createRequestContext(request);
    const user = await authenticateRequest(request);
    const db = await getDatabase();

    return {
      ...baseContext,
      user,
      db,
    };
  },
});
```

## API Reference

### createRequestContext

```typescript
function createRequestContext(
  request: Request,
  options?: RequestContextConfig
): RequestContext;

interface RequestContextConfig {
  includeHeaders?: boolean;
  includeIp?: boolean;
  customProperties?: Record<string, unknown>;
}
```

### ContextStore

```typescript
class ContextStore<T> {
  // Run code with the given context
  run<R>(context: T, callback: () => R): R;

  // Get the current context (throws if none)
  getContext(): T;

  // Get the current context or undefined
  getContextOrNull(): T | undefined;

  // Check if context is available
  hasContext(): boolean;
}
```

### ContextBuilder

```typescript
class ContextBuilder<T extends BaseContext> {
  withRequest(request: Request): this;
  withUser<U>(user: U): this;
  withDatabase<D>(db: D): this;
  withLogger<L>(logger: L): this;
  withTracing(traceId: string): this;
  with<K extends string, V>(key: K, value: V): this;
  build(): T;
}
```

## License

Apache 2.0 - Pegasus Heavy Industries LLC
