import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../components/code-block';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeBlockComponent],
  template: `
    <article class="px-6 py-12 lg:py-16 max-w-4xl mx-auto" itemscope itemtype="https://schema.org/TechArticle">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-zinc-500 mb-8" aria-label="Breadcrumb">
        <a routerLink="/" class="hover:text-white transition-colors">Home</a>
        <span>/</span>
        <span class="text-zinc-300">GraphQL Playground</span>
      </nav>

      <!-- Header -->
      <header class="mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
          🎮 Developer Experience
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4" itemprop="headline">GraphQL Playground</h1>
        <p class="text-xl text-zinc-400" itemprop="description">
          Built-in GraphQL Playground and GraphiQL integration with &#64;leaven-graphql/playground.
        </p>
      </header>

      <!-- Overview -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Overview</h2>
        <p class="text-zinc-400 mb-4">
          The <code class="text-indigo-400">&#64;leaven-graphql/playground</code> package provides an interactive
          GraphQL IDE for exploring and testing your API.
        </p>
        <div class="card p-6">
          <ul class="space-y-2 text-zinc-300">
            <li><strong class="text-white">GraphQL Playground</strong> - Feature-rich GraphQL IDE</li>
            <li><strong class="text-white">GraphiQL</strong> - Official GraphQL IDE</li>
            <li><strong class="text-white">Schema Explorer</strong> - Browse types and fields</li>
            <li><strong class="text-white">Query History</strong> - Track previous queries</li>
            <li><strong class="text-white">Customizable</strong> - Themes, tabs, settings</li>
          </ul>
        </div>
      </section>

      <!-- Installation -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Installation</h2>
        <app-code-block [code]="installCode" title="terminal" />
      </section>

      <!-- Quick Start -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Quick Start</h2>
        <p class="text-zinc-400 mb-4">Enable playground with &#64;leaven-graphql/http:</p>
        <app-code-block [code]="quickStartCode" title="server.ts" />
      </section>

      <!-- Configuration -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Configuration</h2>
        <p class="text-zinc-400 mb-4">Customize the playground appearance and behavior:</p>
        <app-code-block [code]="configCode" title="playground-config.ts" />
      </section>

      <!-- Standalone Usage -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Standalone Usage</h2>
        <p class="text-zinc-400 mb-4">Use the playground handler directly:</p>
        <app-code-block [code]="standaloneCode" title="standalone.ts" />
      </section>

      <!-- GraphiQL -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">GraphiQL Alternative</h2>
        <p class="text-zinc-400 mb-4">Use GraphiQL instead of Playground:</p>
        <app-code-block [code]="graphiqlCode" title="graphiql.ts" />
      </section>

      <!-- Features -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Features</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card p-6">
            <div class="text-2xl mb-2">📝</div>
            <h3 class="font-semibold text-white mb-2">Query Editor</h3>
            <p class="text-sm text-zinc-400">Syntax highlighting, auto-complete, and error detection.</p>
          </div>
          <div class="card p-6">
            <div class="text-2xl mb-2">📊</div>
            <h3 class="font-semibold text-white mb-2">Schema Explorer</h3>
            <p class="text-sm text-zinc-400">Browse types, fields, and documentation.</p>
          </div>
          <div class="card p-6">
            <div class="text-2xl mb-2">📜</div>
            <h3 class="font-semibold text-white mb-2">Query History</h3>
            <p class="text-sm text-zinc-400">Access and replay previous queries.</p>
          </div>
          <div class="card p-6">
            <div class="text-2xl mb-2">🔐</div>
            <h3 class="font-semibold text-white mb-2">Headers Editor</h3>
            <p class="text-sm text-zinc-400">Add authentication and custom headers.</p>
          </div>
          <div class="card p-6">
            <div class="text-2xl mb-2">📑</div>
            <h3 class="font-semibold text-white mb-2">Multiple Tabs</h3>
            <p class="text-sm text-zinc-400">Work on multiple queries simultaneously.</p>
          </div>
          <div class="card p-6">
            <div class="text-2xl mb-2">🎨</div>
            <h3 class="font-semibold text-white mb-2">Themes</h3>
            <p class="text-sm text-zinc-400">Light and dark themes with customization.</p>
          </div>
        </div>
      </section>

      <!-- Security -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Security Considerations</h2>
        <div class="card p-6 border-amber-500/20 bg-amber-500/5">
          <p class="text-zinc-300 mb-4">
            <strong class="text-amber-400">⚠️ Important:</strong> Disable playground in production!
          </p>
          <app-code-block [code]="securityCode" title="production.ts" />
        </div>
      </section>

      <!-- API Reference -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">API Reference</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-zinc-800">
                <th class="py-3 pr-4 text-zinc-300 font-semibold">Export</th>
                <th class="py-3 text-zinc-300 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody class="text-zinc-400">
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-indigo-400">renderPlayground</code></td>
                <td class="py-3">Render Playground HTML</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-indigo-400">renderGraphiQL</code></td>
                <td class="py-3">Render GraphiQL HTML</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-indigo-400">createPlaygroundHandler</code></td>
                <td class="py-3">Create HTTP handler for playground</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-indigo-400">createGraphiQLHandler</code></td>
                <td class="py-3">Create HTTP handler for GraphiQL</td>
              </tr>
              <tr>
                <td class="py-3 pr-4"><code class="text-indigo-400">PlaygroundConfig</code></td>
                <td class="py-3">Configuration type</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Navigation -->
      <nav class="flex items-center justify-between pt-8 border-t border-zinc-800">
        <a routerLink="/nestjs" class="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
          </svg>
          <div class="text-right">
            <span class="text-xs text-zinc-500 block">Previous</span>
            <span class="font-medium">NestJS Integration</span>
          </div>
        </a>
        <a routerLink="/quick-start" class="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-right">
          <div>
            <span class="text-xs text-zinc-500 block">Back to</span>
            <span class="font-medium">Quick Start</span>
          </div>
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </a>
      </nav>
    </article>
  `,
})
export class PlaygroundComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updatePageSEO({
      title: 'GraphQL Playground',
      description: 'Built-in GraphQL Playground and GraphiQL integration with @leaven-graphql/playground. Explore and test your API.',
      keywords: ['GraphQL Playground', 'GraphiQL', 'API testing', 'GraphQL IDE', 'Leaven'],
      canonical: '/playground',
      ogType: 'article'
    });
  }

  installCode = `bun add @leaven-graphql/playground`;

  quickStartCode = `import { createServer } from '@leaven-graphql/http';
import { schema } from './schema';

const server = createServer({
  schema,
  port: 4000,
  // Enable GraphQL Playground
  playground: true,
});

server.start();
// Open http://localhost:4000/graphql in your browser`;

  configCode = `import { createServer } from '@leaven-graphql/http';

const server = createServer({
  schema,
  playground: {
    // Endpoint configuration
    endpoint: '/graphql',
    subscriptionEndpoint: 'ws://localhost:4000/graphql',

    // Default headers
    headers: {
      'X-Custom-Header': 'value',
    },

    // Editor settings
    settings: {
      'editor.theme': 'dark',
      'editor.fontSize': 14,
      'editor.fontFamily': '"Fira Code", monospace',
      'editor.cursorShape': 'line',

      // Request settings
      'request.credentials': 'include',

      // UI settings
      'schema.polling.enable': true,
      'schema.polling.interval': 2000,

      // Tracing
      'tracing.hideTracingResponse': false,
    },

    // Pre-populated tabs
    tabs: [
      {
        name: 'Hello Query',
        query: \`query HelloWorld {
  hello
}\`,
        variables: '{}',
      },
      {
        name: 'User Query',
        query: \`query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}\`,
        variables: '{"id": "1"}',
      },
    ],
  },
});`;

  standaloneCode = `import { createPlaygroundHandler, renderPlayground } from '@leaven-graphql/playground';

// Create a handler for use with any server
const playgroundHandler = createPlaygroundHandler({
  endpoint: '/graphql',
  settings: { 'editor.theme': 'dark' },
});

// Use with Bun.serve
Bun.serve({
  port: 4000,
  fetch(request) {
    const url = new URL(request.url);

    // Serve playground at root
    if (url.pathname === '/') {
      return playgroundHandler(request);
    }

    // Your GraphQL handler
    if (url.pathname === '/graphql') {
      return graphqlHandler(request);
    }

    return new Response('Not Found', { status: 404 });
  },
});

// Or just get the HTML
const html = renderPlayground({
  endpoint: '/graphql',
  settings: { 'editor.theme': 'dark' },
});`;

  graphiqlCode = `import { createServer } from '@leaven-graphql/http';
import { createGraphiQLHandler, renderGraphiQL } from '@leaven-graphql/playground';

// Use GraphiQL instead of Playground
const server = createServer({
  schema,
  playground: false, // Disable default playground
  routes: {
    // Serve GraphiQL at /graphiql
    '/graphiql': createGraphiQLHandler({
      endpoint: '/graphql',
      headerEditorEnabled: true,
    }),
  },
});

// Or render HTML directly
const html = renderGraphiQL({
  endpoint: '/graphql',
  defaultQuery: \`{
  hello
}\`,
});`;

  securityCode = `import { createServer } from '@leaven-graphql/http';

const server = createServer({
  schema,

  // ✅ Disable in production
  playground: process.env.NODE_ENV !== 'production',

  // Also disable introspection in production
  introspection: process.env.NODE_ENV !== 'production',
});

// Or use environment variable
const server = createServer({
  schema,
  playground: process.env.ENABLE_PLAYGROUND === 'true',
});`;
}
