# leaven

The meta-package that re-exports all Leaven modules - a high-performance GraphQL library for Bun.

## Installation

```bash
bun add leaven graphql
```

Or install individual packages:

```bash
bun add @leaven-graphql/core @leaven-graphql/http @leaven-graphql/context @leaven-graphql/errors
```

## Quick Start

```typescript
import { createServer, LeavenExecutor } from 'leaven';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

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

const server = createServer({
  schema,
  port: 4000,
  playground: true,
});

server.start();
console.log('🚀 Server ready at http://localhost:4000/graphql');
```

## Included Packages

| Package | Description |
|---------|-------------|
| `@leaven-graphql/core` | Core execution engine |
| `@leaven-graphql/http` | HTTP server integration |
| `@leaven-graphql/ws` | WebSocket subscriptions |
| `@leaven-graphql/context` | Request context management |
| `@leaven-graphql/errors` | Error handling utilities |
| `@leaven-graphql/schema` | Schema building utilities |
| `@leaven-graphql/plugins` | Plugin system |
| `@leaven-graphql/playground` | GraphQL Playground |
| `@leaven-graphql/nestjs` | NestJS integration |

## Usage

### From Core

```typescript
import { LeavenExecutor } from 'leaven';

const executor = new LeavenExecutor({
  schema,
  cache: true,
  metrics: true,
});

const result = await executor.execute({
  query: '{ hello }',
});
```

### From HTTP

```typescript
import { createServer, createHandler } from 'leaven';

const server = createServer({
  schema,
  port: 4000,
  playground: true,
  cors: true,
});

server.start();
```

### From Context

```typescript
import { createRequestContext, ContextStore } from 'leaven';

const context = createRequestContext(request);
console.log(context.requestId);
```

### From Errors

```typescript
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError
} from 'leaven';

throw new AuthenticationError('Please log in');
```

### From Schema

```typescript
import { SchemaBuilder, mergeSchemas } from 'leaven';

const builder = new SchemaBuilder();
builder.addType('User', { id: 'ID!', name: 'String!' });
builder.addQuery('users', { type: '[User!]!' });

const schema = builder.build();
```

### From Plugins

```typescript
import {
  createLoggingPlugin,
  createDepthLimitPlugin,
  createComplexityPlugin
} from 'leaven';

const plugins = [
  createLoggingPlugin({ logger: console }),
  createDepthLimitPlugin({ maxDepth: 10 }),
  createComplexityPlugin({ maxComplexity: 1000 }),
];
```

### From WebSocket

```typescript
import { createPubSub } from 'leaven';

const pubsub = createPubSub();

pubsub.publish('MESSAGE_ADDED', message);
const iterator = pubsub.asyncIterator('MESSAGE_ADDED');
```

## Documentation

For full documentation, visit the [Leaven Documentation](https://leaven.dev).

### Core Concepts

- [Quick Start](/quick-start) - Get up and running
- [Executor](/executor) - Core execution engine
- [Schema Building](/schema) - Build and merge schemas
- [Request Context](/context) - Context management

### Integrations

- [HTTP Server](/http) - Bun HTTP integration
- [WebSocket](/websockets) - Real-time subscriptions
- [NestJS](/nestjs) - NestJS framework integration
- [Playground](/playground) - GraphQL IDE

### Advanced

- [Plugin System](/plugins) - Extend with plugins
- [Error Handling](/errors) - Error formatting and masking

## Why Leaven?

- **Built for Bun** - Native Bun APIs for maximum performance
- **Type Safe** - Full TypeScript support with strict types
- **Modular** - Use only what you need
- **Extensible** - Plugin system for customization
- **Standards Compliant** - Follows GraphQL specification

## License

Apache 2.0 - Pegasus Heavy Industries LLC
