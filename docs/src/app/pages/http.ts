import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../components/code-block';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-http',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeBlockComponent],
  template: `
    <article class="px-6 py-12 lg:py-16 max-w-4xl mx-auto" itemscope itemtype="https://schema.org/TechArticle">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-zinc-500 mb-8" aria-label="Breadcrumb">
        <a routerLink="/" class="hover:text-white transition-colors">Home</a>
        <span>/</span>
        <span class="text-zinc-300">HTTP Server</span>
      </nav>

      <!-- Header -->
      <header class="mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
          🌐 Integration
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4" itemprop="headline">HTTP Server</h1>
        <p class="text-xl text-zinc-400" itemprop="description">
          Set up a high-performance GraphQL HTTP server with &#64;leaven/http using native Bun APIs.
        </p>
      </header>

      <!-- Overview -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Overview</h2>
        <p class="text-zinc-400 mb-4">
          The <code class="text-blue-400">&#64;leaven/http</code> package provides a complete HTTP server
          built on Bun's native HTTP APIs for maximum performance.
        </p>
        <div class="card p-6">
          <ul class="space-y-2 text-zinc-300">
            <li><strong class="text-white">Native Bun APIs</strong> - Maximum performance with Bun.serve()</li>
            <li><strong class="text-white">CORS Support</strong> - Configurable CORS handling</li>
            <li><strong class="text-white">Request Parsing</strong> - JSON, GraphQL, multipart support</li>
            <li><strong class="text-white">Playground</strong> - Built-in GraphQL Playground</li>
            <li><strong class="text-white">Multiple Routes</strong> - Custom route handling</li>
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
        <p class="text-zinc-400 mb-4">Create a GraphQL server in seconds:</p>
        <app-code-block [code]="quickStartCode" title="server.ts" />
      </section>

      <!-- Server Configuration -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Server Configuration</h2>
        <p class="text-zinc-400 mb-4">Full configuration options:</p>
        <app-code-block [code]="configCode" title="config.ts" />
      </section>

      <!-- CORS -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">CORS Configuration</h2>
        <p class="text-zinc-400 mb-4">Configure Cross-Origin Resource Sharing:</p>
        <app-code-block [code]="corsCode" title="cors.ts" />
      </section>

      <!-- Custom Context -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Custom Context</h2>
        <p class="text-zinc-400 mb-4">Add authentication and custom data to the context:</p>
        <app-code-block [code]="contextCode" title="context.ts" />
      </section>

      <!-- Handler Only -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Handler Only</h2>
        <p class="text-zinc-400 mb-4">Use just the handler with your own Bun server:</p>
        <app-code-block [code]="handlerCode" title="handler.ts" />
      </section>

      <!-- Multiple Routes -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Multiple Routes</h2>
        <p class="text-zinc-400 mb-4">Add custom routes alongside GraphQL:</p>
        <app-code-block [code]="routesCode" title="routes.ts" />
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
                <td class="py-3 pr-4"><code class="text-blue-400">createServer</code></td>
                <td class="py-3">Create a LeavenServer instance</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-blue-400">createHandler</code></td>
                <td class="py-3">Create a standalone request handler</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-blue-400">LeavenServer</code></td>
                <td class="py-3">Server class with start/stop methods</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-blue-400">parseBody</code></td>
                <td class="py-3">Parse request body (JSON/GraphQL/multipart)</td>
              </tr>
              <tr>
                <td class="py-3 pr-4"><code class="text-blue-400">buildResponse</code></td>
                <td class="py-3">Build a Response with proper headers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Navigation -->
      <nav class="flex items-center justify-between pt-8 border-t border-zinc-800">
        <a routerLink="/errors" class="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
          </svg>
          <div class="text-right">
            <span class="text-xs text-zinc-500 block">Previous</span>
            <span class="font-medium">Error Handling</span>
          </div>
        </a>
        <a routerLink="/websockets" class="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-right">
          <div>
            <span class="text-xs text-zinc-500 block">Next</span>
            <span class="font-medium">WebSocket Subscriptions</span>
          </div>
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </a>
      </nav>
    </article>
  `,
})
export class HttpComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updatePageSEO({
      title: 'HTTP Server',
      description: 'Set up a high-performance GraphQL HTTP server with @leaven-graphql/http. CORS, authentication, and Bun-native APIs.',
      keywords: ['GraphQL HTTP', 'GraphQL server', 'Bun HTTP', 'GraphQL API', 'Leaven'],
      canonical: '/http',
      ogType: 'article'
    });
  }

  installCode = `bun add @leaven-graphql/http @leaven-graphql/core graphql`;

  quickStartCode = `import { createServer } from '@leaven-graphql/http';
import { schema } from './schema';

const server = createServer({
  schema,
  port: 4000,
  playground: true,
});

const info = server.start();
console.log(\`🚀 Server ready at \${info.url}\`);
// 🚀 Server ready at http://localhost:4000/graphql`;

  configCode = `import { createServer } from '@leaven-graphql/http';

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

  // Caching & Performance
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
  onStart: (server) => {
    console.log('Server started');
  },
  onStop: () => {
    console.log('Server stopped');
  },
  onError: (error, request) => {
    console.error('Error:', error);
    return new Response('Error', { status: 500 });
  },
});`;

  corsCode = `import { createServer } from '@leaven-graphql/http';

const server = createServer({
  schema,
  cors: {
    // Allowed origins
    origin: ['https://example.com', 'https://app.example.com'],
    // Or use a function
    // origin: (request) => request.headers.get('origin'),

    // Allowed methods
    methods: ['GET', 'POST', 'OPTIONS'],

    // Allowed headers
    allowedHeaders: ['Content-Type', 'Authorization'],

    // Exposed headers
    exposedHeaders: ['X-Request-Id'],

    // Allow credentials
    credentials: true,

    // Preflight cache duration
    maxAge: 86400, // 24 hours
  },
});`;

  contextCode = `import { createServer } from '@leaven-graphql/http';
import { verifyToken } from './auth';

const server = createServer({
  schema,

  // Custom context factory
  context: async (request, graphqlRequest) => {
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // Verify and get user
    const user = token ? await verifyToken(token) : null;

    // Get database connection
    const db = await getDatabase();

    return {
      user,
      db,
      requestId: crypto.randomUUID(),
      startTime: Date.now(),
    };
  },
});

// Access in resolvers
const resolvers = {
  Query: {
    me: (_, __, context) => context.user,
    posts: (_, __, context) => context.db.posts.findAll(),
  },
};`;

  handlerCode = `import { createHandler } from '@leaven-graphql/http';
import { schema } from './schema';

// Create just the handler
const graphqlHandler = createHandler({
  schema,
  playground: true,
  cors: true,
});

// Use with Bun.serve directly
Bun.serve({
  port: 4000,
  async fetch(request) {
    const url = new URL(request.url);

    // GraphQL endpoint
    if (url.pathname === '/graphql') {
      return graphqlHandler(request);
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response('OK');
    }

    return new Response('Not Found', { status: 404 });
  },
});`;

  routesCode = `import { createServer } from '@leaven-graphql/http';

const server = createServer({
  schema,

  // Additional routes
  routes: {
    '/health': () => new Response('OK'),

    '/metrics': async () => {
      const metrics = await collectMetrics();
      return new Response(JSON.stringify(metrics), {
        headers: { 'Content-Type': 'application/json' },
      });
    },

    '/api/upload': async (request) => {
      const formData = await request.formData();
      const file = formData.get('file');
      // Handle file upload
      return new Response(JSON.stringify({ success: true }));
    },
  },

  // Fallback for unmatched routes
  fallback: (request) => {
    return new Response('Not Found', { status: 404 });
  },
});`;
}
