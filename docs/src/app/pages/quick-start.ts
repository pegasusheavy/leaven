import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../components/code-block';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-quick-start',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeBlockComponent],
  template: `
    <article class="px-6 py-12 lg:py-16 max-w-4xl mx-auto" itemscope itemtype="https://schema.org/HowTo">
      <meta itemprop="totalTime" content="PT5M">
      <meta itemprop="tool" content="Bun Runtime">
      <meta itemprop="tool" content="Text Editor">

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-zinc-500 mb-8" aria-label="Breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
        <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a routerLink="/" class="hover:text-white transition-colors" itemprop="item">
            <span itemprop="name">Home</span>
          </a>
          <meta itemprop="position" content="1">
        </span>
        <span aria-hidden="true">/</span>
        <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <span class="text-zinc-300" itemprop="name">Quick Start</span>
          <meta itemprop="position" content="2">
        </span>
      </nav>

      <!-- Header -->
      <header class="mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-4">
          <span aria-hidden="true">⚡</span> 5 min read
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4" itemprop="name">Quick Start Guide: Getting Started with Leaven GraphQL</h1>
        <p class="text-xl text-zinc-400" itemprop="description">
          Get up and running with Leaven GraphQL in under 5 minutes. Learn how to install, configure, and run your first GraphQL server on Bun.
        </p>
      </header>

      <!-- Prerequisites -->
      <section class="mb-12" aria-labelledby="prerequisites-heading">
        <h2 id="prerequisites-heading" class="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
          <span class="text-amber-400" aria-hidden="true">📋</span>
          Prerequisites
        </h2>
        <div class="card p-6">
          <ul class="space-y-3 text-zinc-300" role="list" itemprop="supply" itemscope itemtype="https://schema.org/HowToSupply">
            <li class="flex items-start gap-3">
              <svg class="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span itemprop="name"><strong>Bun</strong> v1.0 or later - <a href="https://bun.sh" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:underline">Install Bun</a></span>
            </li>
            <li class="flex items-start gap-3">
              <svg class="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span><strong>TypeScript</strong> knowledge (recommended)</span>
            </li>
            <li class="flex items-start gap-3">
              <svg class="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span>Basic <strong>GraphQL</strong> understanding</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Step 1 -->
      <section class="mb-12" aria-labelledby="step1-heading" itemprop="step" itemscope itemtype="https://schema.org/HowToStep">
        <meta itemprop="position" content="1">
        <h2 id="step1-heading" class="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold" aria-hidden="true">1</span>
          <span itemprop="name">Install Leaven GraphQL Package</span>
        </h2>
        <div itemprop="itemListElement" itemscope itemtype="https://schema.org/HowToDirection">
          <p class="text-zinc-400 mb-4" itemprop="text">
            Install the Leaven meta-package which includes all modules for a complete GraphQL setup:
          </p>
        </div>
        <app-code-block [code]="installCode" title="terminal" />
        <p class="text-sm text-zinc-500 mt-3">
          Or install individual packages for a minimal setup:
        </p>
        <app-code-block [code]="minimalInstallCode" title="terminal" />
      </section>

      <!-- Step 2 -->
      <section class="mb-12" aria-labelledby="step2-heading" itemprop="step" itemscope itemtype="https://schema.org/HowToStep">
        <meta itemprop="position" content="2">
        <h2 id="step2-heading" class="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold" aria-hidden="true">2</span>
          <span itemprop="name">Define Your GraphQL Schema</span>
        </h2>
        <div itemprop="itemListElement" itemscope itemtype="https://schema.org/HowToDirection">
          <p class="text-zinc-400 mb-4" itemprop="text">
            Create a GraphQL schema using the programmatic API. Define types, queries, and resolvers:
          </p>
        </div>
        <app-code-block [code]="schemaCode" title="schema.ts" />
      </section>

      <!-- Step 3 -->
      <section class="mb-12" aria-labelledby="step3-heading" itemprop="step" itemscope itemtype="https://schema.org/HowToStep">
        <meta itemprop="position" content="3">
        <h2 id="step3-heading" class="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold" aria-hidden="true">3</span>
          <span itemprop="name">Create Your GraphQL Server</span>
        </h2>
        <div itemprop="itemListElement" itemscope itemtype="https://schema.org/HowToDirection">
          <p class="text-zinc-400 mb-4" itemprop="text">
            Set up a Leaven HTTP server with playground enabled for development:
          </p>
        </div>
        <app-code-block [code]="serverCode" title="server.ts" />
      </section>

      <!-- Step 4 -->
      <section class="mb-12" aria-labelledby="step4-heading" itemprop="step" itemscope itemtype="https://schema.org/HowToStep">
        <meta itemprop="position" content="4">
        <h2 id="step4-heading" class="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold" aria-hidden="true">4</span>
          <span itemprop="name">Run Your GraphQL Server</span>
        </h2>
        <div itemprop="itemListElement" itemscope itemtype="https://schema.org/HowToDirection">
          <p class="text-zinc-400 mb-4" itemprop="text">
            Start the server with Bun runtime:
          </p>
        </div>
        <app-code-block [code]="runCode" title="terminal" />
        <div class="mt-6 p-6 rounded-xl bg-green-500/10 border border-green-500/20" role="alert">
          <div class="flex items-start gap-3">
            <span class="text-2xl" aria-hidden="true">✅</span>
            <div>
              <h3 class="font-semibold text-green-400 mb-1">You're all set!</h3>
              <p class="text-zinc-400">
                Open <a href="http://localhost:4000/graphql" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:underline">http://localhost:4000/graphql</a>
                to access the GraphQL Playground and start querying your API.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Try It Out -->
      <section class="mb-12" aria-labelledby="tryit-heading">
        <h2 id="tryit-heading" class="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
          <span class="text-amber-400" aria-hidden="true">🧪</span>
          Try It Out: Your First GraphQL Query
        </h2>
        <p class="text-zinc-400 mb-4">
          Run this query in the GraphQL playground to test your server:
        </p>
        <app-code-block [code]="queryCode" title="query" language="graphql" />
      </section>

      <!-- Expected Response -->
      <section class="mb-12" aria-labelledby="response-heading">
        <h2 id="response-heading" class="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
          <span class="text-amber-400" aria-hidden="true">📥</span>
          Expected Response
        </h2>
        <p class="text-zinc-400 mb-4">
          Your GraphQL server will return this JSON response:
        </p>
        <app-code-block [code]="responseCode" title="response.json" language="json" />
      </section>

      <!-- Next Steps -->
      <section class="mb-12" aria-labelledby="nextsteps-heading">
        <h2 id="nextsteps-heading" class="text-2xl font-semibold text-white mb-6">What's Next?</h2>
        <nav class="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Next steps navigation">
          <a routerLink="/executor" class="card p-6 group" aria-label="Learn about the Leaven Executor">
            <div class="flex items-start gap-4">
              <span class="text-3xl" aria-hidden="true">🔄</span>
              <div>
                <h3 class="font-semibold text-white group-hover:text-amber-400 transition-colors">Learn the Executor</h3>
                <p class="text-sm text-zinc-500 mt-1">Understand the core execution engine and its features</p>
              </div>
            </div>
          </a>
          <a routerLink="/context" class="card p-6 group" aria-label="Learn about Request Context">
            <div class="flex items-start gap-4">
              <span class="text-3xl" aria-hidden="true">🔗</span>
              <div>
                <h3 class="font-semibold text-white group-hover:text-amber-400 transition-colors">Request Context</h3>
                <p class="text-sm text-zinc-500 mt-1">Manage request-scoped data with AsyncLocalStorage</p>
              </div>
            </div>
          </a>
          <a routerLink="/plugins" class="card p-6 group" aria-label="Learn about Plugins">
            <div class="flex items-start gap-4">
              <span class="text-3xl" aria-hidden="true">🧩</span>
              <div>
                <h3 class="font-semibold text-white group-hover:text-amber-400 transition-colors">Plugins</h3>
                <p class="text-sm text-zinc-500 mt-1">Extend with caching, logging, tracing, and more</p>
              </div>
            </div>
          </a>
          <a routerLink="/websockets" class="card p-6 group" aria-label="Learn about Subscriptions">
            <div class="flex items-start gap-4">
              <span class="text-3xl" aria-hidden="true">📡</span>
              <div>
                <h3 class="font-semibold text-white group-hover:text-amber-400 transition-colors">Subscriptions</h3>
                <p class="text-sm text-zinc-500 mt-1">Real-time updates with WebSockets (graphql-ws)</p>
              </div>
            </div>
          </a>
        </nav>
      </section>
    </article>
  `,
})
export class QuickStartComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    // Set page SEO
    this.seoService.updatePageSEO({
      title: 'Quick Start Guide - Getting Started with Leaven GraphQL',
      description: 'Learn how to install and set up Leaven GraphQL in under 5 minutes. Step-by-step tutorial for creating your first GraphQL server on Bun runtime with TypeScript.',
      keywords: [
        'Leaven quick start',
        'GraphQL tutorial',
        'Bun GraphQL',
        'GraphQL server setup',
        'TypeScript GraphQL',
        'getting started GraphQL',
        'GraphQL installation',
        'Leaven tutorial'
      ],
      canonical: '/quick-start',
      ogType: 'article',
      articlePublishedTime: '2026-01-01',
      articleModifiedTime: '2026-01-01'
    });

    // Add HowTo structured data for AEO
    this.seoService.updateStructuredData(
      this.seoService.generateHowToSchema({
        name: 'How to Set Up Leaven GraphQL Server on Bun',
        description: 'A step-by-step guide to installing Leaven GraphQL and creating your first GraphQL server on Bun runtime.',
        totalTime: 'PT5M',
        steps: [
          {
            name: 'Install Leaven GraphQL Package',
            text: 'Install Leaven using Bun package manager with the command: bun add leaven graphql',
            code: 'bun add leaven graphql'
          },
          {
            name: 'Define Your GraphQL Schema',
            text: 'Create a schema.ts file with your GraphQL types, queries, and resolvers using the graphql-js API.',
            code: 'export const schema = new GraphQLSchema({ query: ... })'
          },
          {
            name: 'Create Your GraphQL Server',
            text: 'Set up a Leaven HTTP server with playground enabled for development in server.ts',
            code: 'const server = createServer({ schema, port: 4000, playground: true })'
          },
          {
            name: 'Run Your GraphQL Server',
            text: 'Start the server using Bun runtime and access the GraphQL Playground at localhost:4000/graphql',
            code: 'bun run server.ts'
          }
        ]
      })
    );
  }

  installCode = `bun add leaven graphql`;

  minimalInstallCode = `bun add @leaven-graphql/core @leaven-graphql/http graphql`;

  schemaCode = `import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
  },
});

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => 'Hello, Leaven!',
      },
      users: {
        type: new GraphQLList(UserType),
        resolve: () => [
          { id: '1', name: 'Alice', email: 'alice@example.com' },
          { id: '2', name: 'Bob', email: 'bob@example.com' },
        ],
      },
    },
  }),
});`;

  serverCode = `import { createServer } from '@leaven-graphql/http';
import { schema } from './schema';

const server = createServer({
  schema,
  port: 4000,
  path: '/graphql',
  playground: true, // Enable GraphQL Playground
});

const info = server.start();
console.log(\`🚀 Server ready at \${info.url}\`);`;

  runCode = `bun run server.ts`;

  queryCode = `query {
  hello
  users {
    id
    name
    email
  }
}`;

  responseCode = `{
  "data": {
    "hello": "Hello, Leaven!",
    "users": [
      { "id": "1", "name": "Alice", "email": "alice@example.com" },
      { "id": "2", "name": "Bob", "email": "bob@example.com" }
    ]
  }
}`;
}
