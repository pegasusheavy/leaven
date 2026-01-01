/**
 * @leaven-graphql/playground - GraphiQL rendering
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * GraphiQL configuration
 */
export interface GraphiQLConfig {
  /** GraphQL endpoint URL */
  endpoint: string;
  /** Subscription WebSocket endpoint */
  subscriptionEndpoint?: string;
  /** Page title */
  title?: string;
  /** Default query */
  defaultQuery?: string;
  /** Default variables */
  defaultVariables?: string;
  /** Default headers */
  headers?: Record<string, string>;
  /** GraphiQL version */
  version?: string;
  /** Enable Explorer plugin */
  explorer?: boolean;
}

/**
 * Render GraphiQL HTML
 */
export function renderGraphiQL(config: GraphiQLConfig): string {
  const {
    endpoint,
    subscriptionEndpoint,
    title = 'Leaven GraphiQL',
    defaultQuery = `# Welcome to Leaven GraphiQL
#
# GraphiQL is an in-browser tool for writing, validating, and
# testing GraphQL queries.
#
# Type queries into this side of the screen, and you will see
# intelligent typeaheads aware of the current GraphQL type schema
# and live syntax and validation errors highlighted within the text.
#
# GraphQL queries typically start with a "{" character. Lines that
# start with a # are ignored.
#
# An example GraphQL query might look like:
#
#     {
#       users {
#         id
#         name
#       }
#     }
#
`,
    defaultVariables = '',
    headers = {},
    version = '3.0.10',
    explorer = true,
  } = config;

  const fetcherCode = subscriptionEndpoint
    ? `
    const fetcher = GraphiQL.createFetcher({
      url: ${JSON.stringify(endpoint)},
      subscriptionUrl: ${JSON.stringify(subscriptionEndpoint)},
      headers: ${JSON.stringify(headers)},
    });`
    : `
    const fetcher = GraphiQL.createFetcher({
      url: ${JSON.stringify(endpoint)},
      headers: ${JSON.stringify(headers)},
    });`;

  const explorerPlugin = explorer
    ? `
    <script src="https://unpkg.com/@graphiql/plugin-explorer@1.0.3/dist/index.umd.js" crossorigin></script>
    <link rel="stylesheet" href="https://unpkg.com/@graphiql/plugin-explorer@1.0.3/dist/style.css" />`
    : '';

  const explorerInit = explorer
    ? `
      const explorerPlugin = GraphiQLPluginExplorer.explorerPlugin();
      plugins: [explorerPlugin],`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link
    rel="stylesheet"
    href="https://unpkg.com/graphiql@${version}/graphiql.min.css"
  />
  <link
    rel="shortcut icon"
    href="https://graphql.org/favicon.ico"
  />
  ${explorerPlugin}
  <style>
    html, body, #graphiql {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div id="graphiql">Loading...</div>
  <script
    src="https://unpkg.com/react@18/umd/react.production.min.js"
    crossorigin
  ></script>
  <script
    src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
    crossorigin
  ></script>
  <script
    src="https://unpkg.com/graphiql@${version}/graphiql.min.js"
    crossorigin
  ></script>
  <script>
    ${fetcherCode}

    const root = ReactDOM.createRoot(document.getElementById('graphiql'));
    root.render(
      React.createElement(GraphiQL, {
        fetcher,
        defaultQuery: ${JSON.stringify(defaultQuery)},
        variables: ${JSON.stringify(defaultVariables)},
        ${explorerInit}
      })
    );
  </script>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Create a Bun request handler for GraphiQL
 */
export function createGraphiQLHandler(config: GraphiQLConfig): (request: Request) => Response {
  const html = renderGraphiQL(config);

  return (request: Request): Response => {
    // Only serve on GET requests
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  };
}
