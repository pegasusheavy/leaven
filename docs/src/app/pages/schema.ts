import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../components/code-block';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-schema',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeBlockComponent],
  template: `
    <article class="px-6 py-12 lg:py-16 max-w-4xl mx-auto" itemscope itemtype="https://schema.org/TechArticle">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-zinc-500 mb-8" aria-label="Breadcrumb">
        <a routerLink="/" class="hover:text-white transition-colors">Home</a>
        <span>/</span>
        <span class="text-zinc-300">Schema Building</span>
      </nav>

      <!-- Header -->
      <header class="mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-4">
          🏗️ Core Package
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4" itemprop="headline">Schema Building</h1>
        <p class="text-xl text-zinc-400" itemprop="description">
          Build, merge, and manage GraphQL schemas with &#64;leaven/schema.
        </p>
      </header>

      <!-- Overview -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Overview</h2>
        <p class="text-zinc-400 mb-4">
          The <code class="text-amber-400">&#64;leaven/schema</code> package provides utilities for building
          GraphQL schemas programmatically. It supports both code-first and SDL-first approaches.
        </p>
        <div class="card p-6">
          <ul class="space-y-2 text-zinc-300">
            <li><strong class="text-white">SchemaBuilder</strong> - Fluent API for building schemas</li>
            <li><strong class="text-white">Schema Merging</strong> - Combine multiple schemas seamlessly</li>
            <li><strong class="text-white">Resolvers</strong> - Type-safe resolver creation</li>
            <li><strong class="text-white">Directives</strong> - Custom directive support</li>
            <li><strong class="text-white">File Loaders</strong> - Load schemas from .graphql files</li>
          </ul>
        </div>
      </section>

      <!-- Installation -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Installation</h2>
        <app-code-block [code]="installCode" title="terminal" />
      </section>

      <!-- Schema Builder -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Schema Builder</h2>
        <p class="text-zinc-400 mb-4">Use the fluent API to build schemas programmatically:</p>
        <app-code-block [code]="builderCode" title="schema.ts" />
      </section>

      <!-- Merging Schemas -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Merging Schemas</h2>
        <p class="text-zinc-400 mb-4">Combine multiple schemas with automatic type merging:</p>
        <app-code-block [code]="mergeCode" title="merge.ts" />
      </section>

      <!-- Resolvers -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Creating Resolvers</h2>
        <p class="text-zinc-400 mb-4">Create type-safe resolvers with helper functions:</p>
        <app-code-block [code]="resolversCode" title="resolvers.ts" />
      </section>

      <!-- File Loading -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Loading from Files</h2>
        <p class="text-zinc-400 mb-4">Load schemas from .graphql files:</p>
        <app-code-block [code]="loaderCode" title="loader.ts" />
      </section>

      <!-- Directives -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Custom Directives</h2>
        <p class="text-zinc-400 mb-4">Add custom directives to your schema:</p>
        <app-code-block [code]="directivesCode" title="directives.ts" />
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
                <td class="py-3 pr-4"><code class="text-amber-400">SchemaBuilder</code></td>
                <td class="py-3">Fluent API for building schemas</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-amber-400">mergeSchemas</code></td>
                <td class="py-3">Merge multiple GraphQL schemas</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-amber-400">createResolvers</code></td>
                <td class="py-3">Create type-safe resolver objects</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-amber-400">loadSchemaFromFile</code></td>
                <td class="py-3">Load schema from a single file</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-amber-400">loadSchemaFromGlob</code></td>
                <td class="py-3">Load schemas matching a glob pattern</td>
              </tr>
              <tr>
                <td class="py-3 pr-4"><code class="text-amber-400">createDirective</code></td>
                <td class="py-3">Create a custom schema directive</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Navigation -->
      <nav class="flex items-center justify-between pt-8 border-t border-zinc-800">
        <a routerLink="/executor" class="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
          </svg>
          <div class="text-right">
            <span class="text-xs text-zinc-500 block">Previous</span>
            <span class="font-medium">Executor</span>
          </div>
        </a>
        <a routerLink="/context" class="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-right">
          <div>
            <span class="text-xs text-zinc-500 block">Next</span>
            <span class="font-medium">Request Context</span>
          </div>
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </a>
      </nav>
    </article>
  `,
})
export class SchemaComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updatePageSEO({
      title: 'Schema Building',
      description: 'Build, merge, and manage GraphQL schemas with @leaven-graphql/schema. Fluent API, file loading, and custom directives.',
      keywords: ['GraphQL schema', 'schema building', 'type definitions', 'schema merging', 'Leaven'],
      canonical: '/schema',
      ogType: 'article'
    });
  }

  installCode = `bun add @leaven-graphql/schema graphql`;

  builderCode = `import { SchemaBuilder } from '@leaven-graphql/schema';

const builder = new SchemaBuilder();

// Define types
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

// Define queries
builder.addQuery('user', {
  type: 'User',
  args: { id: 'ID!' },
});

builder.addQuery('users', {
  type: '[User!]!',
});

// Build the schema
const schema = builder.build();`;

  mergeCode = `import { mergeSchemas, mergeSchemasFromStrings } from '@leaven-graphql/schema';

// Merge existing schemas
const merged = mergeSchemas([
  usersSchema,
  postsSchema,
  commentsSchema,
]);

// Or merge from SDL strings
const schema = mergeSchemasFromStrings([
  \`
    type Query {
      users: [User!]!
    }
    type User {
      id: ID!
      name: String!
    }
  \`,
  \`
    extend type Query {
      posts: [Post!]!
    }
    type Post {
      id: ID!
      title: String!
    }
  \`,
]);`;

  resolversCode = `import { createResolvers, mergeResolvers } from '@leaven-graphql/schema';

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
const resolvers = mergeResolvers([userResolvers, postResolvers]);`;

  loaderCode = `import {
  loadSchemaFromFile,
  loadSchemaFromDirectory,
  loadSchemaFromGlob
} from '@leaven-graphql/schema';

// Load a single file
const schema1 = await loadSchemaFromFile('./schema.graphql');

// Load all files in a directory
const schema2 = await loadSchemaFromDirectory('./schemas');

// Load files matching a glob pattern
const schema3 = await loadSchemaFromGlob('./modules/**/*.graphql');`;

  directivesCode = `import { createDirective, applyDirectives } from '@leaven-graphql/schema';

// Create an @auth directive
const authDirective = createDirective({
  name: 'auth',
  locations: ['FIELD_DEFINITION'],
  args: {
    requires: 'Role = USER',
  },
  transform: (schema, directiveArgs) => {
    // Transform the field to add auth check
    return wrapFieldWithAuth(schema, directiveArgs.requires);
  },
});

// Create a @deprecated directive
const deprecatedDirective = createDirective({
  name: 'deprecated',
  locations: ['FIELD_DEFINITION', 'ENUM_VALUE'],
  args: {
    reason: 'String',
  },
});

// Apply directives to schema
const schema = applyDirectives(baseSchema, [
  authDirective,
  deprecatedDirective,
]);`;
}
