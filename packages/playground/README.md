# @leaven-graphql/playground

GraphQL Playground and GraphiQL renderers for Leaven.

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

## In-server IDE

`playground` on `HandlerConfig` / `ServerConfig` is a **boolean**, not a config
object. When it is `true`, the handler renders **GraphiQL** — with default
options and the Explorer plugin enabled — and serves it at `config.path`
(default `/graphql`), the same path the GraphQL endpoint uses:

```typescript
const server = createServer({
  schema,
  playground: true,
  path: '/api/graphql', // the IDE is served here too, pointed at this endpoint
});
```

The IDE is returned only for a request that is all of: `GET`, `Accept:
text/html`, and carrying no `query` search parameter — so ordinary GET queries
and `POST` operations are unaffected.

There is nothing else to configure through this option. Passing an object
(`playground: { endpoint, settings, tabs }`) does not type-check, and at runtime
an object is merely truthy: every field would be ignored. For a configured IDE,
mount a handler on `routes` instead — see below.

`renderPlayground` (GraphQL Playground, as opposed to GraphiQL) is **not**
reachable through `createServer` or `createHandler` at all. Use
`createPlaygroundHandler` directly if you want it.

## Standalone Handler

Mount a fully configured IDE on its own route. `createPlaygroundHandler` renders
GraphQL Playground; `createGraphiQLHandler` renders GraphiQL. Both take a
**required** config whose `endpoint` is also required.

```typescript
import { createServer } from '@leaven-graphql/http';
import { createPlaygroundHandler } from '@leaven-graphql/playground';

const server = createServer({
  schema,
  playground: false, // disable the built-in GraphiQL at /graphql
  routes: {
    '/playground': createPlaygroundHandler({
      endpoint: '/graphql',
      subscriptionEndpoint: 'ws://localhost:4000/graphql',
      title: 'My API',
      theme: 'dark',
      defaultQuery: `query HelloWorld {
  hello
}`,
      defaultVariables: '{}',
      headers: {
        'X-Custom-Header': 'value',
      },
      settings: {
        'editor.theme': 'dark',
        'editor.fontSize': 14,
        'editor.fontFamily': '"Fira Code", monospace',
        'request.credentials': 'include',
        'tracing.hideTracingResponse': false,
      },
    }),
  },
});
```

Handlers respond `200` with `Content-Type: text/html; charset=utf-8` and
`Cache-Control: no-store` to `GET`, and `405` to every other method. The HTML is
rendered once, when the handler is created.

They are plain `(request: Request) => Response` functions, so they work with
`Bun.serve` directly:

```typescript
import { createPlaygroundHandler } from '@leaven-graphql/playground';

const playgroundHandler = createPlaygroundHandler({ endpoint: '/graphql' });

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
```

Or render the HTML yourself:

```typescript
import { renderPlayground, renderGraphiQL } from '@leaven-graphql/playground';

const playgroundHtml = renderPlayground({ endpoint: '/graphql' });
const graphiqlHtml = renderGraphiQL({ endpoint: '/graphql' });
```

### GraphiQL

```typescript
import { createGraphiQLHandler, renderGraphiQL } from '@leaven-graphql/playground';

const server = createServer({
  schema,
  playground: false,
  routes: {
    '/graphiql': createGraphiQLHandler({
      endpoint: '/graphql',
      subscriptionEndpoint: 'ws://localhost:4000/graphql',
      title: 'My API',
      version: '3.0.10',
      explorer: true,
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

GraphiQL has no `settings` object and no theme option — those belong to
GraphQL Playground.

## Security

**Important:** Disable the IDE in production.

```typescript
const server = createServer({
  schema,
  playground: process.env.NODE_ENV !== 'production',
  introspection: process.env.NODE_ENV !== 'production',
});

// Or use an environment variable
const server = createServer({
  schema,
  playground: process.env.ENABLE_PLAYGROUND === 'true',
});
```

Every value interpolated into the rendered HTML is escaped — `title` and
`version` as HTML, and all script-context values (`endpoint`, queries,
variables, headers, settings) as script-safe JSON — so a configured value cannot
break out of its attribute or close the inline `<script>` block. Configuration
still comes from your own code, not from request input; do not feed
user-supplied data into these renderers.

## API Reference

### renderPlayground

Renders GraphQL Playground. `config` is required, as is `config.endpoint`.

```typescript
function renderPlayground(config: PlaygroundConfig): string;

type PlaygroundTheme = 'dark' | 'light';

interface PlaygroundConfig {
  /** GraphQL endpoint URL */
  endpoint: string;
  /** Subscription WebSocket endpoint */
  subscriptionEndpoint?: string;
  /** Page title (default: 'Leaven GraphQL Playground') */
  title?: string;
  /** Theme (default: 'dark') */
  theme?: PlaygroundTheme;
  /** Default query */
  defaultQuery?: string;
  /** Default variables */
  defaultVariables?: string;
  /** Default headers */
  headers?: Record<string, string>;
  /** Editor settings */
  settings?: {
    'editor.theme'?: PlaygroundTheme;
    'editor.fontSize'?: number;
    'editor.fontFamily'?: string;
    'request.credentials'?: 'include' | 'omit' | 'same-origin';
    'tracing.hideTracingResponse'?: boolean;
  };
}
```

`defaultQuery`, `defaultVariables`, and `headers` populate a single initial tab.
There is no `tabs` option and no `PlaygroundTab` type.

### renderGraphiQL

Renders GraphiQL. `config` is required, as is `config.endpoint`.

```typescript
function renderGraphiQL(config: GraphiQLConfig): string;

interface GraphiQLConfig {
  /** GraphQL endpoint URL */
  endpoint: string;
  /** Subscription WebSocket endpoint */
  subscriptionEndpoint?: string;
  /** Page title (default: 'Leaven GraphiQL') */
  title?: string;
  /** Default query (default: a commented welcome message) */
  defaultQuery?: string;
  /** Default variables */
  defaultVariables?: string;
  /** Default headers, passed to the fetcher */
  headers?: Record<string, string>;
  /** GraphiQL version loaded from unpkg (default: '3.0.10') */
  version?: string;
  /** Enable the Explorer plugin (default: true) */
  explorer?: boolean;
}
```

There are no `headerEditorEnabled` or `shouldPersistHeaders` options.

### Handlers

```typescript
function createPlaygroundHandler(config: PlaygroundConfig): RequestHandler;
function createGraphiQLHandler(config: GraphiQLConfig): RequestHandler;

type RequestHandler = (request: Request) => Response;
```

### Playground Settings

Supplied values are merged over the defaults below; `editor.theme` defaults to
the `theme` option. Keys outside this table are not part of `PlaygroundConfig`.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `editor.theme` | `'dark' \| 'light'` | `theme` (`'dark'`) | Editor theme |
| `editor.fontSize` | `number` | `14` | Font size |
| `editor.fontFamily` | `string` | `'Source Code Pro', 'Consolas', 'Monaco', monospace` | Font family |
| `request.credentials` | `'include' \| 'omit' \| 'same-origin'` | `'include'` | Fetch credentials |
| `tracing.hideTracingResponse` | `boolean` | unset | Hide tracing extensions |

## License

Apache 2.0 - Joseph Quinn
