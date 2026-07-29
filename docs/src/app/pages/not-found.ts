import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { SeoService } from '../services/seo.service';

interface PageData {
  title: string;
  description: string;
  icon: string;
  keywords?: string[];
}

/**
 * Registry of the documentation sections, used by {@link NotFoundComponent} to
 * offer real destinations instead of a dead end.
 *
 * This previously doubled as the registry of *pending* sections for a
 * "Coming Soon" `PlaceholderComponent`. Every key here now has a real page
 * component and an explicit route in `app.routes.ts`, so that component was
 * unreachable and has been deleted. Keep this table in sync with the routes.
 */
const PAGE_DATA: Record<string, PageData> = {
  schema: {
    title: 'Schema Building',
    description: 'Learn how to build and merge GraphQL schemas with @leaven-graphql/schema. Create types, interfaces, unions, and more programmatically.',
    icon: '🏗️',
    keywords: ['GraphQL schema', 'schema building', 'type definitions', 'GraphQL types', 'schema merging']
  },
  context: {
    title: 'Request Context',
    description: 'Manage request-scoped data with @leaven-graphql/context using AsyncLocalStorage. Access request info anywhere in your resolvers.',
    icon: '🔗',
    keywords: ['request context', 'AsyncLocalStorage', 'resolver context', 'GraphQL context', 'Bun context']
  },
  plugins: {
    title: 'Plugin System',
    description: 'Extend Leaven with plugins for caching, logging, tracing, depth limiting, and complexity analysis. Build custom plugins.',
    icon: '🧩',
    keywords: ['GraphQL plugins', 'middleware', 'caching', 'logging', 'tracing', 'depth limiting']
  },
  errors: {
    title: 'Error Handling',
    description: 'Handle and format GraphQL errors with @leaven-graphql/errors. Custom error types, error masking, and production-safe responses.',
    icon: '🚨',
    keywords: ['GraphQL errors', 'error handling', 'error formatting', 'error masking', 'production errors']
  },
  http: {
    title: 'HTTP Server',
    description: 'Set up a high-performance GraphQL HTTP server with @leaven-graphql/http. CORS, compression, and Bun-native APIs.',
    icon: '🌐',
    keywords: ['GraphQL HTTP', 'GraphQL server', 'Bun HTTP', 'REST to GraphQL', 'API server']
  },
  websockets: {
    title: 'WebSocket Subscriptions',
    description: 'Implement real-time GraphQL subscriptions with @leaven-graphql/ws using the graphql-ws protocol. PubSub included.',
    icon: '📡',
    keywords: ['GraphQL subscriptions', 'WebSocket', 'real-time GraphQL', 'PubSub', 'graphql-ws']
  },
  playground: {
    title: 'GraphQL Playground',
    description: 'Built-in GraphQL Playground and GraphiQL integration with @leaven-graphql/playground. Explore and test your API.',
    icon: '🎮',
    keywords: ['GraphQL Playground', 'GraphiQL', 'API testing', 'GraphQL IDE', 'query explorer']
  },
  nestjs: {
    title: 'NestJS Integration',
    description: 'Seamlessly integrate Leaven with NestJS using @leaven-graphql/nestjs. Guards, decorators, interceptors, and more.',
    icon: '🏛️',
    keywords: ['NestJS GraphQL', 'NestJS integration', 'Leaven NestJS', 'GraphQL decorators', 'NestJS guards']
  }
};

/**
 * Genuine "not found" page for the `**` catch-all route.
 *
 * This page makes no claim that the URL is real content: it emits
 * `<meta name="robots" content="noindex">`, emits no structured data, and
 * clears any JSON-LD left in the head by a previously visited page so a stale
 * `TechArticle` graph is not attributed to it.
 *
 * The static host cannot return a real HTTP 404 for an SPA deep link, so
 * `noindex` is what actually keeps these URLs out of search results.
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="px-6 py-12 lg:py-16 max-w-4xl mx-auto">
      <header class="mb-12">
        <p class="text-sm font-mono text-zinc-500 mb-4">404</p>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Page not found</h1>
        <p class="text-xl text-zinc-400">
          We couldn't find <code class="text-zinc-300">{{ requestedPath }}</code>. It may have been
          moved or renamed.
        </p>
      </header>

      <div class="card p-8 text-center">
        <p class="text-zinc-400 mb-6 max-w-md mx-auto">
          Try the quick start guide, or search the repository if you were following a link from an
          older version of the docs.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a routerLink="/quick-start" class="btn-primary inline-flex items-center gap-2">
            Read Quick Start
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </a>
          <a
            href="https://github.com/quinnjr/leaven"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-secondary inline-flex items-center gap-2"
          >
            View on GitHub
          </a>
        </div>
      </div>

      <nav class="mt-12" aria-label="Documentation sections">
        <h2 class="text-2xl font-semibold text-white mb-6">Documentation</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (item of sections; track item.path) {
            <a [routerLink]="item.path" class="card p-6 group">
              <div class="flex items-start gap-4">
                <span class="text-3xl" aria-hidden="true">{{ item.icon }}</span>
                <div>
                  <h3 class="font-semibold text-white group-hover:text-amber-400 transition-colors">{{ item.title }}</h3>
                  <p class="text-sm text-zinc-500 mt-1">{{ item.description }}</p>
                </div>
              </div>
            </a>
          }
        </div>
      </nav>
    </section>
  `,
})
export class NotFoundComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private seoService = inject(SeoService);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  protected requestedPath = '';
  protected sections = Object.entries(PAGE_DATA).map(([key, data]) => ({
    path: `/${key}`,
    title: data.title,
    description: data.description.split('.')[0],
    icon: data.icon
  }));

  ngOnInit(): void {
    this.requestedPath = this.router.url;

    this.seoService.updatePageSEO({
      title: 'Page Not Found',
      description: 'The requested documentation page does not exist.'
    });

    // Keep this URL out of the index. A static host answers SPA deep links with
    // 200, so the robots tag is the only signal available.
    this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });

    // Drop any JSON-LD injected by the page the visitor came from.
    if (isPlatformBrowser(this.platformId)) {
      this.document.querySelector('script[data-seo="dynamic"]')?.remove();
    }
  }

  ngOnDestroy(): void {
    // Navigating on to a real page must not inherit the noindex directive.
    this.meta.removeTag('name="robots"');
  }
}
