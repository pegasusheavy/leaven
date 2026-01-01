# @leaven-graphql/schema

Schema building and merging utilities for Leaven.

## Installation

```bash
bun add @leaven-graphql/schema graphql
```

## Quick Start

```typescript
import { SchemaBuilder, createSchemaBuilder } from '@leaven-graphql/schema';

const builder = new SchemaBuilder();

// Define types
builder.addType('User', {
  id: 'ID!',
  name: 'String!',
  email: 'String!',
});

// Define queries
builder.addQuery('user', {
  type: 'User',
  args: { id: 'ID!' },
});

// Build the schema
const schema = builder.build();
```

## Features

### Schema Builder

Fluent API for building schemas programmatically:

```typescript
import { SchemaBuilder } from '@leaven-graphql/schema';

const builder = new SchemaBuilder();

// Add object types
builder.addType('User', {
  id: 'ID!',
  name: 'String!',
  email: 'String!',
  posts: '[Post!]!',
});

builder.addType('Post', {
  id: 'ID!',
  title: 'String!',
  content: 'String',
  author: 'User!',
});

// Add queries
builder.addQuery('user', {
  type: 'User',
  args: { id: 'ID!' },
});

builder.addQuery('users', {
  type: '[User!]!',
});

// Add mutations
builder.addMutation('createUser', {
  type: 'User!',
  args: {
    name: 'String!',
    email: 'String!',
  },
});

const schema = builder.build();
```

### Schema Merging

Combine multiple schemas:

```typescript
import { mergeSchemas, mergeSchemasFromStrings } from '@leaven-graphql/schema';

// Merge existing schemas
const merged = mergeSchemas([
  usersSchema,
  postsSchema,
  commentsSchema,
]);

// Merge from SDL strings
const schema = mergeSchemasFromStrings([
  `
    type Query {
      users: [User!]!
    }
    type User {
      id: ID!
      name: String!
    }
  `,
  `
    extend type Query {
      posts: [Post!]!
    }
    type Post {
      id: ID!
      title: String!
    }
  `,
]);
```

### Resolvers

Create and merge type-safe resolvers:

```typescript
import { createResolvers, mergeResolvers } from '@leaven-graphql/schema';

const userResolvers = createResolvers({
  Query: {
    user: async (_, { id }, context) => {
      return context.db.users.findById(id);
    },
    users: async (_, __, context) => {
      return context.db.users.findAll();
    },
  },
  User: {
    posts: async (user, _, context) => {
      return context.db.posts.findByAuthor(user.id);
    },
  },
});

const postResolvers = createResolvers({
  Query: {
    posts: async (_, __, context) => {
      return context.db.posts.findAll();
    },
  },
  Post: {
    author: async (post, _, context) => {
      return context.db.users.findById(post.authorId);
    },
  },
});

// Merge resolvers
const resolvers = mergeResolvers([userResolvers, postResolvers]);
```

### File Loaders

Load schemas from .graphql files:

```typescript
import {
  loadSchemaFromFile,
  loadSchemaFromDirectory,
  loadSchemaFromGlob
} from '@leaven-graphql/schema';

// Load a single file
const schema1 = await loadSchemaFromFile('./schema.graphql');

// Load all files in a directory
const schema2 = await loadSchemaFromDirectory('./schemas');

// Load files matching a glob pattern
const schema3 = await loadSchemaFromGlob('./modules/**/*.graphql');
```

### Custom Directives

Create and apply custom directives:

```typescript
import { createDirective, applyDirectives } from '@leaven-graphql/schema';

// Create an @auth directive
const authDirective = createDirective({
  name: 'auth',
  locations: ['FIELD_DEFINITION'],
  args: {
    requires: 'Role = USER',
  },
  transform: (schema, directiveArgs) => {
    return wrapFieldWithAuth(schema, directiveArgs.requires);
  },
});

// Apply directives to schema
const schema = applyDirectives(baseSchema, [authDirective]);
```

## API Reference

### SchemaBuilder

```typescript
class SchemaBuilder {
  addType(name: string, fields: Record<string, string | FieldDefinition>): this;
  addInput(name: string, fields: Record<string, string>): this;
  addEnum(name: string, values: string[]): this;
  addInterface(name: string, fields: Record<string, string | FieldDefinition>): this;
  addUnion(name: string, types: string[]): this;
  addQuery(name: string, definition: FieldDefinition): this;
  addMutation(name: string, definition: FieldDefinition): this;
  addSubscription(name: string, definition: FieldDefinition): this;
  build(): GraphQLSchema;
}
```

### Schema Merging

```typescript
function mergeSchemas(schemas: GraphQLSchema[], options?: MergeOptions): GraphQLSchema;
function mergeSchemasFromStrings(sdls: string[], options?: MergeOptions): GraphQLSchema;

interface MergeOptions {
  onTypeConflict?: 'error' | 'first' | 'last' | 'merge';
  onFieldConflict?: 'error' | 'first' | 'last';
}
```

### File Loaders

```typescript
function loadSchemaFromFile(path: string, options?: LoaderOptions): Promise<GraphQLSchema>;
function loadSchemaFromDirectory(path: string, options?: LoaderOptions): Promise<GraphQLSchema>;
function loadSchemaFromGlob(pattern: string, options?: LoaderOptions): Promise<GraphQLSchema>;

interface LoaderOptions {
  encoding?: BufferEncoding;
  resolvers?: Resolvers;
}
```

## License

Apache 2.0 - Pegasus Heavy Industries LLC
