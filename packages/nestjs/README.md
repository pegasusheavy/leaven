# @leaven-graphql/nestjs

NestJS integration for Leaven GraphQL - a high-performance GraphQL execution engine for Bun.

> **Note:** This package assumes you're using `@lexmata/nestjs-platform-bun` as your NestJS HTTP adapter for Bun runtime support.

## Installation

```bash
bun add @leaven-graphql/nestjs @leaven-graphql/core @leaven-graphql/context @leaven-graphql/errors @lexmata/nestjs-platform-bun
```

## Quick Start

### Bootstrap with Bun

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { BunAdapter } from '@lexmata/nestjs-platform-bun';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new BunAdapter());

  await app.listen(3000);
  console.log('🚀 Server running at http://localhost:3000/graphql');
}

bootstrap();
```

### Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { LeavenModule } from '@leaven-graphql/nestjs';
import { makeExecutableSchema } from '@graphql-tools/schema';

const schema = makeExecutableSchema({
  typeDefs: `
    type Query {
      hello: String!
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'Hello World!',
    },
  },
});

@Module({
  imports: [
    LeavenModule.forRoot({
      schema,
      playground: true,
      introspection: true,
    }),
  ],
})
export class AppModule {}
```

### Async Configuration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LeavenModule } from '@leaven-graphql/nestjs';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LeavenModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        playground: configService.get('GRAPHQL_PLAYGROUND') === 'true',
        introspection: configService.get('GRAPHQL_INTROSPECTION') === 'true',
        maxComplexity: configService.get('GRAPHQL_MAX_COMPLEXITY', 100),
        maxDepth: configService.get('GRAPHQL_MAX_DEPTH', 10),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Features

> ### ⚠️ What actually executes today
>
> Read this before the sections below.
>
> `LeavenModule` builds a schema from `schema`, or from `typeDefs` + `resolvers`,
> and serves it over HTTP. In that path **your resolvers are plain functions
> invoked directly by graphql-js.** They are not NestJS route handlers, so the
> NestJS execution pipeline never runs around them:
>
> - `@UseGuards(...)` — `AuthGuard`, `RolesGuard`, `PermissionsGuard`,
>   `ComplexityGuard`, `DepthGuard` — **does not fire.**
> - `@UseInterceptors(...)` — `LoggingInterceptor`, `MetricsInterceptor`,
>   `ComplexityInterceptor`, `CachingInterceptor`,
>   `ErrorFormattingInterceptor` — **does not fire.**
> - Parameter decorators — `@Args()`, `@Context()`, `@Info()`, `@Root()`,
>   `@Parent()`, and anything built with `createContextDecorator()` — **are not
>   applied**; your resolver receives the raw graphql-js
>   `(root, args, context, info)` positional arguments instead.
>
> Those constructs only run when something registers your resolvers as NestJS
> handlers, which means a `@nestjs/graphql` driver bridge
> (`AbstractGraphQLDriver`). **Leaven does not ship one yet** — see
> [Integration with @nestjs/graphql](#integration-with-nestjsgraphql).
>
> What *does* work today, unconditionally: the schema build (including
> `@Description` / `@Deprecated`), the HTTP endpoint and playground, the
> `context` factory, `formatError`, the document cache, metrics, `@InjectPubSub`,
> and `SubscriptionManager`'s graphql-ws protocol handling.
>
> The guards, interceptors, decorators and `GqlExecutionContext` documented below
> are also usable directly — they are ordinary NestJS classes and helpers, and
> they work in any NestJS pipeline you invoke them from (including one you build
> yourself, and including unit tests). The examples are written against the
> `@Resolver`-based style they are designed for; treat them as the target shape,
> not as something the shipped HTTP path will run for you.

### Decorators

#### Parameter Decorators

```typescript
import { Resolver, Query } from '@nestjs/graphql';
import { Context, Args, Info, Root } from '@leaven-graphql/nestjs';

@Resolver()
export class UserResolver {
  @Query(() => User)
  async me(@Context() ctx: GqlContext) {
    return ctx.req.user;
  }

  @Query(() => User)
  async user(@Args('id') id: string) {
    return this.userService.findById(id);
  }
}
```

#### Method Decorators

```typescript
import { Resolver, Query } from '@nestjs/graphql';
import { Complexity, Description, CacheHint, Deprecated } from '@leaven-graphql/nestjs';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  @Complexity(10)
  @Description('Fetch all posts')
  @CacheHint({ maxAge: 60, scope: 'PUBLIC' })
  async posts() {
    return this.postService.findAll();
  }

  @Query(() => [Post])
  @Deprecated('Use posts() instead')
  async allPosts() {
    return this.postService.findAll();
  }
}
```

`@Description` and `@Deprecated` are applied to the emitted schema when the
module builds it from `typeDefs` + `resolvers`: the annotated resolver's field
gets the description, and a deprecated field is printed with
`@deprecated(reason: ...)` so client tooling sees it. A pre-built `schema`
passed via the `schema` option is used exactly as given, so annotate its fields
there instead.

The other two carry caveats:

- **`@Complexity(n)` is observational only.** `ComplexityInterceptor` reads it
  and accumulates the total onto the request context's
  `_resolvedFieldComplexity` key. Nothing in this package reads that key back —
  in particular it is deliberately *not* `_queryComplexity`, the key the driver
  computes statically and `ComplexityGuard` enforces. NestJS runs guards before
  interceptors, so a value accumulated during a request could never gate that
  same request anyway. Consume `_resolvedFieldComplexity` yourself from logging
  or metrics after execution. To actually *reject* expensive queries, set
  `maxComplexity` — the executor enforces that one directly, before any resolver
  runs — rather than annotating fields.
- **`@CacheHint(...)` is a no-op.** `CachingInterceptor` forwards the hint to
  `info.cacheControl.setCacheHint(...)`, but `info.cacheControl` is an Apollo
  Server construct and Leaven never attaches it — so the guarded call is always
  skipped and no cache header or hint is ever produced. Treat it as deprecated:
  it is retained only so existing code keeps compiling. Set cache headers in
  your own middleware, or configure the `cache` option for Leaven's document
  cache (which caches parsed/compiled documents, not responses).

### Guards

#### Authentication Guard

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard, Public } from '@leaven-graphql/nestjs';

@Resolver()
@UseGuards(AuthGuard)
export class UserResolver {
  @Query(() => User)
  async me(@Context() ctx: GqlContext) {
    return ctx.user;
  }

  @Query(() => String)
  @Public()  // No authentication required
  async publicInfo() {
    return 'This is public';
  }
}
```

#### Role-Based Access

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard, Roles } from '@leaven-graphql/nestjs';

@Resolver()
@UseGuards(AuthGuard, RolesGuard)
export class AdminResolver {
  @Query(() => [User])
  @Roles('admin')
  async users() {
    return this.userService.findAll();
  }

  @Mutation(() => User)
  @Roles('admin', 'moderator')
  async banUser(@Args('id') id: string) {
    return this.userService.ban(id);
  }
}
```

#### Permission-Based Access

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard, PermissionsGuard, Permissions } from '@leaven-graphql/nestjs';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class PostResolver {
  @Mutation(() => Post)
  @Permissions('posts:write')
  async createPost(@Args('input') input: CreatePostInput) {
    return this.postService.create(input);
  }

  @Mutation(() => Boolean)
  @Permissions('posts:delete')
  async deletePost(@Args('id') id: string) {
    return this.postService.delete(id);
  }
}
```

### Interceptors

#### Logging

```typescript
import { UseInterceptors } from '@nestjs/common';
import { LoggingInterceptor } from '@leaven-graphql/nestjs';

@Resolver()
@UseInterceptors(LoggingInterceptor)
export class UserResolver {
  // All resolvers in this class will be logged
}
```

#### Metrics

```typescript
import { UseInterceptors } from '@nestjs/common';
import { MetricsInterceptor } from '@leaven-graphql/nestjs';

@Resolver()
@UseInterceptors(MetricsInterceptor)
export class UserResolver {
  // Metrics will be collected for all resolvers
}
```

### Custom Context Decorator

```typescript
import { createContextDecorator } from '@leaven-graphql/nestjs';

// Create a custom decorator for accessing the current user
export const CurrentUser = createContextDecorator<User>('user');

// Usage
@Resolver()
export class ProfileResolver {
  @Query(() => Profile)
  async profile(@CurrentUser() user: User) {
    return this.profileService.getByUserId(user.id);
  }
}
```

### GqlExecutionContext

Use `GqlExecutionContext` in guards, interceptors, and other NestJS constructs to access GraphQL-specific context:

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@leaven-graphql/nestjs';

@Injectable()
export class CustomGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const gqlContext = GqlExecutionContext.create(context);

    // Access GraphQL resolver arguments
    const ctx = gqlContext.getContext();   // The context object
    const args = gqlContext.getArgs();     // Resolver arguments
    const info = gqlContext.getInfo();     // GraphQL resolve info
    const root = gqlContext.getRoot();     // Parent/root value

    // Helper methods
    const fieldName = gqlContext.getFieldName();
    const operationType = gqlContext.getOperationType();
    const selectedFields = gqlContext.getSelectedFields();

    return !!ctx.user;
  }
}
```

### Subscriptions

> **`SubscriptionManager` speaks the graphql-ws protocol; it does not own a
> server.** Importing `LeavenModule` registers the manager but does **not** open
> a WebSocket endpoint — nothing here calls `server.upgrade()`, because the HTTP
> server belongs to your Nest adapter, not to this package. Configuring
> `subscriptions` alone gets you a configured object and no listening socket.
> You must wire the transport yourself, as shown below.

Configure the protocol behaviour on the module:

```typescript
import { Module } from '@nestjs/common';
import { LeavenModule, SubscriptionManager } from '@leaven-graphql/nestjs';

@Module({
  imports: [
    LeavenModule.forRoot({
      schema,
      subscriptions: {
        path: '/graphql',
        keepAlive: 12000,
        onConnect: (ctx) => {
          // Validate connection
          return !!ctx.connectionParams?.token;
        },
        onDisconnect: (ctx) => {
          console.log('Client disconnected');
        },
      },
    }),
  ],
})
export class AppModule {}
```

#### Wiring the WebSocket transport

Two things are yours to do: **register the upgrade route**, and **hand each
socket to the manager**. `SubscriptionManager.getPath()` reports the path it was
configured for (`subscriptions.path`, falling back to `options.path`, then
`/graphql`), so route against that rather than a duplicated constant.

Under Bun, sockets arrive as `ServerWebSocket`, which has no `addEventListener`.
`getWebSocketConfig()` returns `open`/`message`/`close` handlers already bound to
the manager, ready to drop into `Bun.serve`:

```typescript
import { NestFactory } from '@nestjs/core';
import { BunAdapter } from '@lexmata/nestjs-platform-bun';
import { SubscriptionManager } from '@leaven-graphql/nestjs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new BunAdapter());
  await app.init();

  const subscriptions = app.get(SubscriptionManager);

  Bun.serve({
    port: 3000,
    // The upgrade route. The manager never calls server.upgrade() itself —
    // it does not have the Server instance.
    fetch(request, server) {
      const { pathname } = new URL(request.url);
      if (
        pathname === subscriptions.getPath() &&
        request.headers.get('upgrade')?.toLowerCase() === 'websocket'
      ) {
        return server.upgrade(request)
          ? undefined
          : new Response('Upgrade failed', { status: 400 });
      }
      // Everything else stays on the Nest HTTP pipeline, including the
      // GraphQL POST endpoint served by GraphQLMiddleware.
      return app.getHttpAdapter().getInstance().fetch(request);
    },
    websocket: subscriptions.getWebSocketConfig(),
  });
}

bootstrap();
```

`subscriptions.path` defaults to `options.path`, so the GraphQL POST endpoint and
the WebSocket endpoint share `/graphql` by default — they are told apart by the
`Upgrade` header, as above. Set `subscriptions.path` to something else to
separate them.

**The upgrade request is not threaded through `getWebSocketConfig()`**, so
`ctx.request` is `undefined` inside `onConnect` / `context` hooks when you use it.
If a hook needs the original request (to read a cookie or the `Sec-WebSocket-Protocol`
header, say), skip the packaged config and call `handleOpen` yourself with the
request in hand:

```typescript
websocket: {
  open: (socket) => subscriptions.handleOpen(socket, socket.data.request),
  message: (socket, message) => void subscriptions.handleMessage(socket, message),
  close: (socket) => void subscriptions.handleClose(socket),
},
```

stashing it at upgrade time with `server.upgrade(request, { data: { request } })`.
Authenticating from `connectionParams` in `onConnect` avoids the problem entirely
and is the more common graphql-ws pattern.

If your sockets are DOM-shaped `WebSocket` objects instead (a `ws`-style server,
or a test harness), hand each one to `handleConnection` and the manager attaches
its own `message`/`close`/`error` listeners:

```typescript
await subscriptions.handleConnection(socket, request);
```

Inject the module's shared `PubSub` with `@InjectPubSub()` and use the
`@Subscription` decorator in resolvers:

```typescript
import { Resolver } from '@nestjs/graphql';
import { InjectPubSub, Subscription } from '@leaven-graphql/nestjs';
import type { PubSub } from '@leaven-graphql/ws';

@Resolver()
export class MessageResolver {
  constructor(@InjectPubSub() private readonly pubSub: PubSub) {}

  @Subscription(() => Message, {
    filter: (payload, variables) => payload.roomId === variables.roomId,
  })
  messageAdded() {
    return this.pubSub.asyncIterator('MESSAGE_ADDED');
  }

  publish(roomId: string, body: string) {
    this.pubSub.publish('MESSAGE_ADDED', { messageAdded: { roomId, body } });
  }
}
```

`@InjectPubSub()` resolves the module's own in-memory instance by default, so a
publisher and a subscriber in different providers share the same topics. Pass a
`pubSub` option to `forRoot()`/`forRootAsync()` to supply your own — for example
a distributed engine, so events published on one server instance reach
subscribers on another.

`@SubscriptionFilter` is the standalone equivalent of the `filter` option, and
preserves the decorated method's return kind: a method returning an async
iterable still returns one, so `for await (const event of resolver.messageAdded())`
works in tests and direct callers.

```typescript
import { SubscriptionFilter } from '@leaven-graphql/nestjs';

@Subscription(() => Comment)
@SubscriptionFilter((payload, variables) => payload.postId === variables.postId)
commentAdded() {
  return this.pubSub.asyncIterator('COMMENT_ADDED');
}
```

### Schema Builder

For applications that need to build schemas from type definitions:

```typescript
import { Injectable } from '@nestjs/common';
import { SchemaBuilderService, generateSchemaFile } from '@leaven-graphql/nestjs';

@Injectable()
export class SchemaService {
  constructor(private schemaBuilder: SchemaBuilderService) {}

  async exportSchema() {
    const schema = this.schemaBuilder.getSchema();
    if (schema) {
      await generateSchemaFile(schema, {
        path: './schema.graphql',
        sortSchema: true,
      });
    }
  }
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `path` | `string` | `/graphql` | GraphQL endpoint path |
| `schema` | `GraphQLSchema` | - | Pre-built GraphQL schema |
| `typeDefs` | `string \| DocumentNode \| Array<string \| DocumentNode>` | - | SDL type definitions |
| `resolvers` | `Record<string, unknown> \| Array<Record<string, unknown>>` | - | Resolver map merged into `typeDefs` |
| `subscriptions` | `SubscriptionConfig` | - | GraphQL-over-WebSocket configuration: lifecycle hooks (`onConnect`, `onDisconnect`, `onSubscribe`, `onOperation`, `onComplete`), per-connection context factory, keep-alive, connection-init timeout, and max subscriptions per connection |
| `pubSub` | `PubSub` | per-module in-memory instance | Instance resolved by `@InjectPubSub()`; supply your own to share it across modules or to use a distributed engine |
| `playground` | `boolean` | `true` (dev) | Enable GraphQL Playground |
| `introspection` | `boolean` | `true` (dev) | Enable introspection |
| `cache` | `DocumentCacheConfig \| boolean` | - | Document cache configuration |
| `maxComplexity` | `number` | - | Maximum query complexity. Enforced by the executor before any resolver runs — an over-budget document is rejected with a `ComplexityError` |
| `maxDepth` | `number` | - | Maximum query depth. **Only recorded on the context** (as `_queryDepth`) for `DepthGuard`, so it is not enforced on the shipped HTTP path — see the caveat under [Features](#features) |
| `metrics` | `boolean` | `false` | Enable execution metrics |
| `context` | `ContextFactory` | - | Custom context factory |
| `formatError` | `FormatErrorFn` | - | Error formatting function |
| `publicUrl` | `string` | `http://localhost` | Canonical origin (scheme + authority) used to build `request.url` for the context factory. The `Host` header is client-controlled, so it is not trusted: set this when a factory resolves tenancy or issues redirects from `request.url` |
| `cors` | `boolean \| CorsOptions` | *unset — no CORS headers* | CORS handling. **Opt-in:** while unset the endpoint emits no `Access-Control-*` headers and delegates `OPTIONS` preflights to the next handler. `true` (or an options object without `origin`) enables `Access-Control-Allow-Origin: *`; set `origin` to narrow it. `false` is equivalent to unset |
| `includeStacktraceInErrorResponses` | `boolean` | `false` | Include stack traces in errors (also suppresses production masking — honored in every environment, not just development) |

### Deprecated options

These are accepted so existing configurations keep compiling, but nothing reads
them. Removal target: 0.3.0.

| Option | Type | Status |
|--------|------|--------|
| `debug` | `boolean` | Not implemented; setting it has no effect |
| `sortSchema` | `boolean` | No effect — pass `sortSchema` to `generateSchemaFile` instead |
| `buildSchemaOptions` | `BuildSchemaOptions` | No effect — there is no code-first pipeline |
| `plugins` | `LeavenPlugin[]` | No effect — use NestJS interceptors and guards |
| `autoSchemaFile` | `boolean \| string` | Not implemented; configuring it without `schema` or `typeDefs` throws at bootstrap |

## Integration with @nestjs/graphql

**There is no `@nestjs/graphql` integration yet, and `LeavenDriver` is not a
`@nestjs/graphql` driver.**

`GraphQLModule.forRoot({ driver })` requires a `Type<AbstractGraphQLDriver>` —
a class extending `AbstractGraphQLDriver` and implementing its abstract
`start(options)` and `stop()`. `LeavenDriver` extends nothing and has neither
method, so passing it as `driver` does not typecheck and would throw at
bootstrap. Do not do it.

This is the gap behind the caveat at the top of [Features](#features).
`@nestjs/graphql` is what turns `@Resolver`-decorated classes into NestJS
handlers, which is what makes `@UseGuards`, `@UseInterceptors`, and parameter
decorators such as `@Args()` and `@Context()` run at all. Without a driver
bridge there is no supported route by which any of them execute against a
Leaven-served schema.

Until a `LeavenGraphQLDriver extends AbstractGraphQLDriver` exists, use the
supported path — `LeavenModule.forRoot({ schema })` or
`LeavenModule.forRoot({ typeDefs, resolvers })` — and put authorization,
logging, and argument handling inside your resolver functions or in the
`context` factory, which runs once per request before execution:

```typescript
import { Module } from '@nestjs/common';
import { LeavenModule } from '@leaven-graphql/nestjs';
import { AuthorizationError } from '@leaven-graphql/errors';

@Module({
  imports: [
    LeavenModule.forRoot({
      typeDefs,
      resolvers,
      cache: { maxSize: 1000 },
      playground: true,
      // Runs before execution. Throwing a Leaven error here reaches the client
      // with its own status (401 for AuthenticationError), so this is the
      // practical stand-in for an AuthGuard today.
      context: async (request) => {
        const token = request.headers.get('authorization');
        return { user: token ? await verify(token) : null };
      },
    }),
  ],
})
export class AppModule {}
```

Per-field checks then read `context.user` from the resolver's third positional
argument:

```typescript
const resolvers = {
  Query: {
    adminReport: (_root, _args, context) => {
      if (!context.user?.roles.includes('admin')) {
        throw new AuthorizationError('admin role required');
      }
      return reportService.build();
    },
  },
};
```

One cost limit does not depend on the bridge: **`maxComplexity` is enforced by
the executor itself**, which rejects an over-budget document with a
`ComplexityError` before any resolver runs. `maxDepth` is *not* — it is only
recorded on the context for `DepthGuard`, so it needs the bridge like every
other guard.

## License

Apache 2.0 - Joseph Quinn
