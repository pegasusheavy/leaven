# @leaven-graphql/http

High-performance GraphQL HTTP server for Leaven, built on Bun's native APIs.

## Installation

```bash
bun add @leaven-graphql/http @leaven-graphql/core graphql
```

## Quick Start

```typescript
import { createServer } from '@leaven-graphql/http';
import { schema } from './schema';

const server = createServer({
  schema,
  port: 4000,
  playground: true,
});

const info = server.start();
console.log(`🚀 Server ready at ${info.url}`);
```

## Features

### Server Configuration

Full configuration options:

```typescript
import { createServer } from '@leaven-graphql/http';

const server = createServer({
  // Required
  schema,

  // Server options
  port: 4000,                    // Default: 4000
  hostname: '0.0.0.0',           // Default: '0.0.0.0'
  path: '/graphql',              // Default: '/graphql'

  // Features
  playground: true,              // Enable GraphQL Playground
  introspection: true,           // Enable introspection
  cors: true,                    // Enable CORS

  // Performance
  cache: {
    maxSize: 1000,
    ttl: 3600000,
  },

  // Error handling
  errorFormatting: {
    maskErrors: true,
    includeStackTrace: false,
  },

  // Body limits
  maxBodySize: 1024 * 1024,      // 1MB

  // Lifecycle hooks
  onStart: (server) => console.log('Server started'),
  onStop: () => console.log('Server stopped'),
  onError: (error, request) => new Response('Error', { status: 500 }),
});
```

### CORS Configuration

```typescript
const server = createServer({
  schema,
  cors: {
    origin: ['https://example.com', 'https://app.example.com'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-Id'],
    credentials: true,
    maxAge: 86400,
  },
});
```

### Custom Context

Add authentication and custom data:

```typescript
const server = createServer({
  schema,
  context: async (request, graphqlRequest) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? await verifyToken(token) : null;
    const db = await getDatabase();

    return {
      user,
      db,
      requestId: crypto.randomUUID(),
    };
  },
});
```

### Multiple Routes

Add custom routes alongside GraphQL:

```typescript
const server = createServer({
  schema,
  routes: {
    '/health': () => new Response('OK'),
    '/metrics': async () => {
      const metrics = await collectMetrics();
      return Response.json(metrics);
    },
  },
  fallback: (request) => new Response('Not Found', { status: 404 }),
});
```

### Standalone Handler

Use just the handler with your own Bun server:

```typescript
import { createHandler } from '@leaven-graphql/http';

const graphqlHandler = createHandler({
  schema,
  playground: true,
  cors: true,
});

Bun.serve({
  port: 4000,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/graphql') {
      return graphqlHandler(request);
    }

    return new Response('Not Found', { status: 404 });
  },
});
```

## API Reference

### createServer

```typescript
function createServer<TContext = unknown>(
  config: ServerConfig<TContext>
): LeavenServer;

interface ServerConfig<TContext = unknown> {
  schema: GraphQLSchema;
  port?: number;
  hostname?: string;
  path?: string;
  playground?: boolean | PlaygroundConfig;
  introspection?: boolean;
  cors?: boolean | CorsConfig;
  cache?: boolean | DocumentCacheConfig;
  context?: ContextFactory<TContext>;
  errorFormatting?: ErrorMaskingOptions;
  maxBodySize?: number;
  routes?: Record<string, RouteHandler>;
  fallback?: (request: Request) => Response | Promise<Response>;
  onStart?: (server: Server) => void;
  onStop?: () => void;
  onError?: (error: Error, request: Request) => Response | Promise<Response>;
}
```

### LeavenServer

```typescript
class LeavenServer {
  start(): ServerInfo;
  stop(): void;
  readonly url: string;
  readonly port: number;
}

interface ServerInfo {
  url: string;
  port: number;
  hostname: string;
}
```

### createHandler

```typescript
function createHandler<TContext = unknown>(
  config: HandlerConfig<TContext>
): GraphQLHandler;

type GraphQLHandler = (request: Request) => Promise<Response>;
```

### Request Utilities

```typescript
import { parseBody, parseQuery, validateRequest } from '@leaven-graphql/http';

// Parse request body (JSON, GraphQL, multipart)
const body = await parseBody(request);

// Parse query string parameters
const params = parseQuery(request);

// Validate a GraphQL request
const validation = validateRequest(body);
```

### Response Utilities

```typescript
import { buildResponse, sendResponse, corsHeaders } from '@leaven-graphql/http';

// Build a GraphQL response
const response = buildResponse(result, {
  status: 200,
  headers: { 'X-Request-Id': '123' },
});

// Get CORS headers
const headers = corsHeaders(config);
```

## License

Apache 2.0 - Pegasus Heavy Industries LLC
