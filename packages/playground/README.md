# @leaven-graphql/playground

GraphQL Playground and GraphiQL integration for Leaven.

## Installation

```bash
bun add @leaven-graphql/playground
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

server.start();
// Open http://localhost:4000/graphql in your browser
```

## Features

### GraphQL Playground

Feature-rich GraphQL IDE with:

- Syntax highlighting and auto-complete
- Schema explorer and documentation
- Query history
- Multiple tabs
- Headers editor
- Variables panel
- Customizable themes

### Configuration

```typescript
import { createServer } from '@leaven-graphql/http';

const server = createServer({
  schema,
  playground: {
    endpoint: '/graphql',
    subscriptionEndpoint: 'ws://localhost:4000/graphql',

    headers: {
      'X-Custom-Header': 'value',
    },

    settings: {
      'editor.theme': 'dark',
      'editor.fontSize': 14,
      'editor.fontFamily': '"Fira Code", monospace',
      'editor.cursorShape': 'line',
      'request.credentials': 'include',
      'schema.polling.enable': true,
      'schema.polling.interval': 2000,
      'tracing.hideTracingResponse': false,
    },

    tabs: [
      {
        name: 'Hello Query',
        query: `query HelloWorld {
  hello
}`,
        variables: '{}',
      },
      {
        name: 'User Query',
        query: `query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}`,
        variables: '{"id": "1"}',
      },
    ],
  },
});
```

### Standalone Handler

```typescript
import { createPlaygroundHandler, renderPlayground } from '@leaven-graphql/playground';

// Create a handler
const playgroundHandler = createPlaygroundHandler({
  endpoint: '/graphql',
  settings: { 'editor.theme': 'dark' },
});

Bun.serve({
  port: 4000,
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return playgroundHandler(request);
    }

    if (url.pathname === '/graphql') {
      return graphqlHandler(request);
    }

    return new Response('Not Found', { status: 404 });
  },
});

// Or just render the HTML
const html = renderPlayground({
  endpoint: '/graphql',
  settings: { 'editor.theme': 'dark' },
});
```

### GraphiQL Alternative

```typescript
import { createGraphiQLHandler, renderGraphiQL } from '@leaven-graphql/playground';

const server = createServer({
  schema,
  playground: false,
  routes: {
    '/graphiql': createGraphiQLHandler({
      endpoint: '/graphql',
      headerEditorEnabled: true,
    }),
  },
});

// Or render HTML directly
const html = renderGraphiQL({
  endpoint: '/graphql',
  defaultQuery: `{
  hello
}`,
});
```

### Security

**Important:** Disable playground in production!

```typescript
const server = createServer({
  schema,
  playground: process.env.NODE_ENV !== 'production',
  introspection: process.env.NODE_ENV !== 'production',
});

// Or use environment variable
const server = createServer({
  schema,
  playground: process.env.ENABLE_PLAYGROUND === 'true',
});
```

## API Reference

### renderPlayground

```typescript
function renderPlayground(config?: PlaygroundConfig): string;

interface PlaygroundConfig {
  endpoint?: string;
  subscriptionEndpoint?: string;
  headers?: Record<string, string>;
  settings?: PlaygroundSettings;
  tabs?: PlaygroundTab[];
}

interface PlaygroundTab {
  name: string;
  query: string;
  variables?: string;
  headers?: Record<string, string>;
}
```

### renderGraphiQL

```typescript
function renderGraphiQL(config?: GraphiQLConfig): string;

interface GraphiQLConfig {
  endpoint?: string;
  defaultQuery?: string;
  headerEditorEnabled?: boolean;
  shouldPersistHeaders?: boolean;
}
```

### Handlers

```typescript
function createPlaygroundHandler(config?: PlaygroundConfig): RequestHandler;
function createGraphiQLHandler(config?: GraphiQLConfig): RequestHandler;

type RequestHandler = (request: Request) => Response;
```

### Playground Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `editor.theme` | `'dark' \| 'light'` | `'dark'` | Editor theme |
| `editor.fontSize` | `number` | `14` | Font size |
| `editor.fontFamily` | `string` | `monospace` | Font family |
| `editor.cursorShape` | `string` | `'line'` | Cursor style |
| `request.credentials` | `string` | `'omit'` | Fetch credentials |
| `schema.polling.enable` | `boolean` | `false` | Auto-refresh schema |
| `schema.polling.interval` | `number` | `2000` | Polling interval (ms) |

## License

Apache 2.0 - Pegasus Heavy Industries LLC
