import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SeoService } from '../services/seo.service';
import { Subscription, filter } from 'rxjs';

interface PageData {
  title: string;
  description: string;
  icon: string;
  keywords?: string[];
}

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

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="px-6 py-12 lg:py-16 max-w-4xl mx-auto" itemscope itemtype="https://schema.org/TechArticle">
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
          <span class="text-zinc-300" itemprop="name">{{ title }}</span>
          <meta itemprop="position" content="2">
        </span>
      </nav>

      <!-- Header -->
      <header class="mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium mb-4">
          <span aria-hidden="true">🚧</span> Coming Soon
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4" itemprop="headline">{{ title }}</h1>
        <p class="text-xl text-zinc-400" itemprop="description">{{ description }}</p>
        <meta itemprop="author" content="Pegasus Heavy Industries LLC">
        <meta itemprop="datePublished" content="2026-01-01">
      </header>

      <!-- Placeholder Content -->
      <div class="card p-8 text-center">
        <div class="text-6xl mb-6" aria-hidden="true">{{ icon }}</div>
        <h2 class="text-2xl font-semibold text-white mb-4">Documentation Coming Soon</h2>
        <p class="text-zinc-400 mb-6 max-w-md mx-auto">
          We're working on comprehensive documentation for this section.
          In the meantime, check out the quick start guide or GitHub repository.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a routerLink="/quick-start" class="btn-primary inline-flex items-center gap-2">
            Read Quick Start
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </a>
          <a
            href="https://github.com/pegasusheavy/leaven-graphql"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-secondary inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>
      </div>

      <!-- Related Topics -->
      <section class="mt-12" aria-labelledby="related-heading">
        <h2 id="related-heading" class="text-2xl font-semibold text-white mb-6">Related Topics</h2>
        <nav class="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Related documentation">
          @for (item of relatedItems; track item.path) {
            <a
              [routerLink]="item.path"
              class="card p-6 group"
              [attr.aria-label]="item.title + ' - ' + item.description"
            >
              <div class="flex items-start gap-4">
                <span class="text-3xl" aria-hidden="true">{{ item.icon }}</span>
                <div>
                  <h3 class="font-semibold text-white group-hover:text-amber-400 transition-colors">{{ item.title }}</h3>
                  <p class="text-sm text-zinc-500 mt-1">{{ item.description }}</p>
                </div>
              </div>
            </a>
          }
        </nav>
      </section>
    </article>
  `,
})
export class PlaceholderComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seoService = inject(SeoService);
  private routerSub?: Subscription;

  protected title = 'Documentation';
  protected description = 'This section is under construction.';
  protected icon = '📚';
  protected relatedItems: Array<{ path: string; title: string; description: string; icon: string }> = [];

  ngOnInit(): void {
    this.updateFromRoute();

    // Update on route changes
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateFromRoute();
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private updateFromRoute(): void {
    const path = this.router.url.replace('/', '');
    const pageData = PAGE_DATA[path];

    if (pageData) {
      this.title = pageData.title;
      this.description = pageData.description;
      this.icon = pageData.icon;

      // Set SEO
      this.seoService.updatePageSEO({
        title: pageData.title,
        description: pageData.description,
        keywords: pageData.keywords,
        canonical: `/${path}`,
        ogType: 'article',
        articlePublishedTime: '2026-01-01'
      });

      // Update structured data
      this.seoService.updateStructuredData(
        this.seoService.generateTechArticleSchema({
          title: pageData.title,
          description: pageData.description,
          url: `/${path}`
        })
      );
    } else {
      // Fallback from route data
      this.route.data.subscribe(data => {
        this.title = data['title'] ?? this.title;
        this.description = data['description'] ?? this.description;
        this.icon = data['icon'] ?? this.icon;
      });
    }

    // Generate related items
    this.relatedItems = Object.entries(PAGE_DATA)
      .filter(([key]) => key !== path)
      .slice(0, 4)
      .map(([key, data]) => ({
        path: `/${key}`,
        title: data.title,
        description: data.description.split('.')[0],
        icon: data.icon
      }));
  }
}
