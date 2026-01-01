# @leaven-graphql/nestjs

NestJS integration for Leaven GraphQL - a high-performance GraphQL execution engine for Bun.

> **Note:** This package assumes you're using [@pegasusheavy/nestjs-platform-bun](https://github.com/PegasusHeavyIndustries/nestjs-platform-bun) as your NestJS HTTP adapter for Bun runtime support.

## Installation

```bash
bun add @leaven-graphql/nestjs @leaven-graphql/core @leaven-graphql/context @leaven-graphql/errors @pegasusheavy/nestjs-platform-bun
```

## Quick Start

### Bootstrap with Bun

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { BunAdapter } from '@pegasusheavy/nestjs-platform-bun';
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

Enable WebSocket-based GraphQL subscriptions:

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

Use the `@Subscription` decorator in resolvers:

```typescript
import { Resolver } from '@nestjs/graphql';
import { Subscription } from '@leaven-graphql/nestjs';

@Resolver()
export class MessageResolver {
  @Subscription(() => Message, {
    filter: (payload, variables) => payload.roomId === variables.roomId,
  })
  messageAdded() {
    return this.pubSub.asyncIterator('MESSAGE_ADDED');
  }
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
| `playground` | `boolean` | `true` (dev) | Enable GraphQL Playground |
| `introspection` | `boolean` | `true` (dev) | Enable introspection |
| `cache` | `DocumentCacheConfig \| boolean` | - | Document cache configuration |
| `maxComplexity` | `number` | - | Maximum query complexity |
| `maxDepth` | `number` | - | Maximum query depth |
| `metrics` | `boolean` | `false` | Enable execution metrics |
| `debug` | `boolean` | `false` | Enable debug mode |
| `context` | `ContextFactory` | - | Custom context factory |
| `formatError` | `FormatErrorFn` | - | Error formatting function |
| `cors` | `boolean \| CorsOptions` | - | CORS configuration |

## Integration with @nestjs/graphql

This package can be used alongside `@nestjs/graphql` to use Leaven as the execution engine:

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { LeavenModule, LeavenDriver } from '@leaven-graphql/nestjs';

@Module({
  imports: [
    LeavenModule.forRoot({
      playground: true,
      cache: { maxSize: 1000 },
    }),
    GraphQLModule.forRoot({
      driver: LeavenDriver,
      autoSchemaFile: true,
    }),
  ],
})
export class AppModule {}
```

## License

Apache 2.0 - Pegasus Heavy Industries LLC
