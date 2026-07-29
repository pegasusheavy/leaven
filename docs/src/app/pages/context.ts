import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../components/code-block';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-context',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeBlockComponent],
  template: `
    <article class="px-6 py-12 lg:py-16 max-w-4xl mx-auto" itemscope itemtype="https://schema.org/TechArticle">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-zinc-500 mb-8" aria-label="Breadcrumb">
        <a routerLink="/" class="hover:text-white transition-colors">Home</a>
        <span>/</span>
        <span class="text-zinc-300">Request Context</span>
      </nav>

      <!-- Header -->
      <header class="mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-4">
          🔗 Core Package
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4" itemprop="headline">Request Context</h1>
        <p class="text-xl text-zinc-400" itemprop="description">
          Manage request-scoped data with AsyncLocalStorage using &#64;leaven-graphql/context.
        </p>
      </header>

      <!-- Overview -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Overview</h2>
        <p class="text-zinc-400 mb-4">
          The <code class="text-teal-400">&#64;leaven-graphql/context</code> package provides request-scoped context
          management using Node.js AsyncLocalStorage. Access request data anywhere without prop drilling.
        </p>
        <div class="card p-6">
          <ul class="space-y-2 text-zinc-300">
            <li><strong class="text-white">RequestContext</strong> - Per-request context with metadata</li>
            <li><strong class="text-white">ContextStore</strong> - AsyncLocalStorage-based storage</li>
            <li><strong class="text-white">ContextBuilder</strong> - Fluent API for context creation</li>
            <li><strong class="text-white">Type Safety</strong> - Full TypeScript support</li>
          </ul>
        </div>
      </section>

      <!-- Installation -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Installation</h2>
        <app-code-block [code]="installCode" title="terminal" />
      </section>

      <!-- Basic Usage -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Basic Usage</h2>
        <p class="text-zinc-400 mb-4">Create request context from an HTTP request:</p>
        <app-code-block [code]="basicCode" title="context.ts" />
      </section>

      <!-- Context Store -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Context Store</h2>
        <p class="text-zinc-400 mb-4">Use the context store to access context anywhere in your application:</p>
        <app-code-block [code]="storeCode" title="store.ts" />
      </section>

      <!-- Context Builder -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Context Builder</h2>
        <p class="text-zinc-400 mb-4">Build complex contexts with the fluent API:</p>
        <app-code-block [code]="builderCode" title="builder.ts" />
      </section>

      <!-- Custom Context -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Custom Context Types</h2>
        <p class="text-zinc-400 mb-4">Extend the base context with your own types:</p>
        <app-code-block [code]="customCode" title="custom-context.ts" />
      </section>

      <!-- Integration -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Integration with HTTP</h2>
        <p class="text-zinc-400 mb-4">Integrate with &#64;leaven-graphql/http for automatic context handling:</p>
        <app-code-block [code]="integrationCode" title="server.ts" />
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
                <td class="py-3 pr-4"><code class="text-teal-400">RequestContext</code></td>
                <td class="py-3">Per-request context class</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-teal-400">createRequestContext</code></td>
                <td class="py-3">Create context from a Request</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-teal-400">ContextStore</code></td>
                <td class="py-3">AsyncLocalStorage-based store</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-teal-400">ContextBuilder</code></td>
                <td class="py-3">Fluent API for building contexts</td>
              </tr>
              <tr>
                <td class="py-3 pr-4"><code class="text-teal-400">BaseContext</code></td>
                <td class="py-3">Type interface for custom contexts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Navigation -->
      <nav class="flex items-center justify-between pt-8 border-t border-zinc-800">
        <a routerLink="/schema" class="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
          </svg>
          <div class="text-right">
            <span class="text-xs text-zinc-500 block">Previous</span>
            <span class="font-medium">Schema Building</span>
          </div>
        </a>
        <a routerLink="/plugins" class="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-right">
          <div>
            <span class="text-xs text-zinc-500 block">Next</span>
            <span class="font-medium">Plugin System</span>
          </div>
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </a>
      </nav>
    </article>
  `,
})
export class ContextComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updatePageSEO({
      title: 'Request Context',
      description: 'Manage request-scoped data with AsyncLocalStorage using @leaven-graphql/context. Access request info anywhere in your resolvers.',
      keywords: ['request context', 'AsyncLocalStorage', 'GraphQL context', 'Bun context', 'Leaven'],
      canonical: '/context',
      ogType: 'article'
    });

    // Emit the JSON-LD counterpart of this page's TechArticle microdata,
    // plus the breadcrumb trail rendered at the top of the article.
    this.seoService.updateStructuredData([
      this.seoService.generateTechArticleSchema({
        title: 'Request Context',
        description: 'Manage request-scoped data with AsyncLocalStorage using @leaven-graphql/context. Access request info anywhere in your resolvers.',
        url: '/context'
      }),
      this.seoService.generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Request Context', url: '/context' }
      ])
    ]);
  }

  // doc-check: skip - shell command, not TypeScript
  installCode = `bun add @leaven-graphql/context`;

  basicCode = `import { createRequestContext } from '@leaven-graphql/context';

// Create context from a Request. The third argument supplies the peer IP,
// which \`Request\` does not carry (e.g. server.requestIP(request)?.address).
const context = createRequestContext(request, {
  trustProxy: true,
  proxyHeaders: ['x-forwarded-for', 'x-real-ip'],
}, clientIp);

// Access context properties
console.log(context.requestId);           // Unique request ID
console.log(context.startTime);           // Request start time (ms)
console.log(context.request.url);         // Request URL
console.log(context.request.method);      // HTTP method
console.log(context.request.headers);     // Request headers
console.log(context.request.userAgent);   // User agent string

// Helper methods
console.log(context.getClientIp());              // Client IP (honours trustProxy)
console.log(context.getHeader('authorization')); // Case-insensitive lookup
console.log(context.getElapsedTime());           // ms since startTime
console.log(context.toJSON());                   // { requestId, startTime, method, url }`;

  storeCode = `import { ContextStore, createContextStore } from '@leaven-graphql/context';
import type { BaseContext } from '@leaven-graphql/context';

// The type parameter is what puts your own fields on the stored context
interface SessionContext extends BaseContext {
  userId: string;
  role: string;
}

// Create a global context store
const store = createContextStore<SessionContext>();

// Run code with context
store.run({ requestId: 'req-1', startTime: Date.now(), userId: '123', role: 'admin' }, async () => {
  // Access context anywhere. getContext() returns \`TContext | undefined\`;
  // requireContext() throws instead of handing back undefined.
  const context = store.requireContext();
  console.log(context.userId); // '123'

  // Context is available in nested functions
  await someNestedFunction();
});

// In a nested function
async function someNestedFunction() {
  const context = store.requireContext();
  console.log(context.role); // 'admin'
}`;

  builderCode = `import { createContextBuilder, createRequestContext } from '@leaven-graphql/context';

// createContextBuilder takes a factory that turns an input into a base context.
// Each .extend() adds properties, and the result type is inferred as you chain.
const builder = createContextBuilder((request: Request) =>
  createRequestContext(request, { trustProxy: true })
)
  .extend(async (ctx) => ({ user: await authenticate(ctx.getHeader('authorization')) }))
  .extend((ctx) => ({ db: getDatabase(), logger: logger.child({ requestId: ctx.requestId }) }));

// build() is async and takes the input the factory expects
const context = await builder.build(request);

// Optionally adapt the builder to a different input type
const fromEvent = builder.withInput((event: FetchEvent) => event.request);

// Use in resolvers
const resolvers = {
  Query: {
    me: (_, __, ctx: typeof context) => ctx.user,
    posts: async (_, __, ctx: typeof context) => {
      ctx.logger.info('Fetching posts');
      return ctx.db.posts.findAll();
    },
  },
};`;

  customCode = `import { LeavenExecutor } from '@leaven-graphql/core';
import type { BaseContext, ContextExtension } from '@leaven-graphql/context';

// Define your custom context type
interface AppContext extends BaseContext {
  user: User | null;
  db: Database;
  cache: CacheClient;
  permissions: string[];
}

// Create typed context
function createAppContext(request: Request): AppContext {
  return {
    requestId: crypto.randomUUID(),
    startTime: Date.now(),
    user: null,
    db: database,
    cache: cacheClient,
    permissions: [],
  };
}

// Use with executor
const executor = new LeavenExecutor({ schema });

const result = await executor.execute<QueryData>(
  { query: '{ me { name } }' },
  createAppContext(request)
);`;

  integrationCode = `import { createServer } from '@leaven-graphql/http';
import { createRequestContext } from '@leaven-graphql/context';

const server = createServer({
  schema,
  // Custom context factory
  context: async (request, graphqlRequest) => {
    const baseContext = createRequestContext(request);

    // Add authentication
    const user = await authenticateRequest(request);

    // Add database connection
    const db = await getDatabase();

    return {
      ...baseContext,
      user,
      db,
    };
  },
});

server.start();
console.log('Server ready with context support');`;
}
