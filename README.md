# 🥖 Leaven

> High-Performance GraphQL Library for Bun

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/runtime-Bun-black.svg)](https://bun.sh)

Leaven is a modular, high-performance GraphQL library designed specifically for the [Bun](https://bun.sh) runtime. Named after the rising agent in bread, Leaven makes your GraphQL APIs rise to their full potential.

## ✨ Features

- **🚀 Built for Bun** - Native Bun APIs for maximum performance
- **📦 Modular Architecture** - Use only what you need
- **🔒 Type Safe** - Full TypeScript with strict types
- **🧩 Plugin System** - Extensible with caching, logging, tracing
- **📊 Performance Metrics** - Built-in execution timing and caching stats
- **🔗 Context Management** - AsyncLocalStorage-based request context
- **🌐 HTTP & WebSocket** - Full HTTP server and subscription support
- **🏛️ NestJS Integration** - First-class NestJS support
- **🎮 GraphQL Playground** - Built-in IDE for development

## 📦 Installation

```bash
# Install the meta-package (includes everything)
bun add leaven graphql

# Or install individual packages
bun add @leaven-graphql/core @leaven-graphql/http graphql
```

## 🚀 Quick Start

```typescript
import { createServer } from '@leaven-graphql/http';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

// Create a schema
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => 'Hello, World!',
      },
    },
  }),
});

// Create and start the server
const server = createServer({
  schema,
  port: 4000,
  playground: true,
});

server.start();
console.log('🥖 Server ready at http://localhost:4000/graphql');
```

## 📚 Packages

| Package | Description |
|---------|-------------|
| [`@leaven-graphql/core`](./packages/core) | Core execution engine with caching and metrics |
| [`@leaven-graphql/http`](./packages/http) | High-performance HTTP server for Bun |
| [`@leaven-graphql/ws`](./packages/ws) | WebSocket subscriptions with graphql-ws protocol |
| [`@leaven-graphql/context`](./packages/context) | Request context with AsyncLocalStorage |
| [`@leaven-graphql/errors`](./packages/errors) | Error handling and formatting |
| [`@leaven-graphql/schema`](./packages/schema) | Schema building and merging utilities |
| [`@leaven-graphql/plugins`](./packages/plugins) | Plugin system with built-in plugins |
| [`@leaven-graphql/playground`](./packages/playground) | GraphQL Playground and GraphiQL |
| [`@leaven-graphql/nestjs`](./packages/nestjs) | NestJS framework integration |
| [`leaven`](./packages/leaven) | Meta-package re-exporting all modules |

## 🔧 Core Executor

The heart of Leaven is the `LeavenExecutor`:

```typescript
import { LeavenExecutor } from '@leaven-graphql/core';

const executor = new LeavenExecutor({
  schema,
  cache: {
    maxSize: 1000,
    ttl: 3600000, // 1 hour
  },
  metrics: true,
});

const result = await executor.execute({
  query: '{ hello }',
  variables: {},
});

console.log(result.response.data);
// { hello: "Hello, World!" }

console.log(result.metrics);
// { timing: { parseTime: 0.5, validationTime: 1.2, ... }, documentCached: true }
```

## 🌐 HTTP Server

Full-featured HTTP server with CORS, Playground, and custom routes:

```typescript
import { createServer } from '@leaven-graphql/http';

const server = createServer({
  schema,
  port: 4000,
  path: '/graphql',
  playground: true,
  cors: {
    origin: ['https://example.com'],
    credentials: true,
  },
  context: async (request) => ({
    user: await authenticate(request),
    db: database,
  }),
  routes: {
    '/health': () => new Response('OK'),
  },
});

server.start();
```

## 📡 Subscriptions

Real-time GraphQL with WebSocket support:

```typescript
import { createPubSub } from '@leaven-graphql/ws';

const pubsub = createPubSub();

const resolvers = {
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator('MESSAGE_ADDED'),
    },
  },
  Mutation: {
    sendMessage: async (_, { content }) => {
      const message = await db.messages.create({ content });
      pubsub.publish('MESSAGE_ADDED', message);
      return message;
    },
  },
};
```

## 🧩 Plugin System

Extend Leaven with plugins:

```typescript
import {
  createLoggingPlugin,
  createDepthLimitPlugin,
  createComplexityPlugin,
} from '@leaven-graphql/plugins';

const executor = new LeavenExecutor({
  schema,
  plugins: [
    createLoggingPlugin({ logger: console }),
    createDepthLimitPlugin({ maxDepth: 10 }),
    createComplexityPlugin({ maxComplexity: 1000 }),
  ],
});
```

## 🚨 Error Handling

Type-safe error handling with formatting:

```typescript
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from '@leaven-graphql/errors';

const resolvers = {
  Query: {
    me: (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError('Please log in');
      }
      return context.user;
    },
    user: async (_, { id }) => {
      const user = await db.users.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      return user;
    },
  },
};
```

## 🏛️ NestJS Integration

Seamless NestJS support with decorators, guards, and interceptors:

```typescript
import { Module } from '@nestjs/common';
import { LeavenModule } from '@leaven-graphql/nestjs';

@Module({
  imports: [
    LeavenModule.forRoot({
      schema,
      playground: true,
    }),
  ],
})
export class AppModule {}
```

```typescript
import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, Roles, Context } from '@leaven-graphql/nestjs';

@Resolver()
@UseGuards(AuthGuard)
export class UserResolver {
  @Query(() => User)
  @Roles('admin')
  async users(@Context() ctx) {
    return ctx.db.users.findAll();
  }
}
```

## 📖 Documentation

Visit our documentation site for comprehensive guides:

- [Quick Start](https://leaven.dev/quick-start)
- [Executor](https://leaven.dev/executor)
- [Schema Building](https://leaven.dev/schema)
- [HTTP Server](https://leaven.dev/http)
- [WebSocket Subscriptions](https://leaven.dev/websockets)
- [Plugin System](https://leaven.dev/plugins)
- [Error Handling](https://leaven.dev/errors)
- [NestJS Integration](https://leaven.dev/nestjs)

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build all packages
pnpm build
```

## 🗺️ Roadmap

- [x] Core execution engine
- [x] HTTP server integration
- [x] WebSocket subscriptions
- [x] Plugin system
- [x] NestJS integration
- [ ] Persisted queries
- [ ] Federation support
- [ ] Automatic Persisted Queries (APQ)
- [ ] Query batching

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

Apache 2.0 - [Pegasus Heavy Industries LLC](https://pegasusheavy.industries)

---

<p align="center">
  Made with 🍞 by <a href="https://pegasusheavy.industries">Pegasus Heavy Industries</a>
</p>
