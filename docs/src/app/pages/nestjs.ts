import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../components/code-block';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-nestjs',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeBlockComponent],
  template: `
    <article class="px-6 py-12 lg:py-16 max-w-4xl mx-auto" itemscope itemtype="https://schema.org/TechArticle">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-zinc-500 mb-8" aria-label="Breadcrumb">
        <a routerLink="/" class="hover:text-white transition-colors">Home</a>
        <span>/</span>
        <span class="text-zinc-300">NestJS Integration</span>
      </nav>

      <!-- Header -->
      <header class="mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-medium mb-4">
          🏛️ Framework
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4" itemprop="headline">NestJS Integration</h1>
        <p class="text-xl text-zinc-400" itemprop="description">
          Seamlessly integrate Leaven with NestJS using &#64;leaven-graphql/nestjs. Guards, decorators, and interceptors included.
        </p>
      </header>

      <!-- Overview -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Overview</h2>
        <p class="text-zinc-400 mb-4">
          The <code class="text-pink-400">&#64;leaven-graphql/nestjs</code> package provides full NestJS integration
          with all the decorators, guards, and interceptors you need.
        </p>
        <div class="card p-4 mb-4 border-amber-500/20 bg-amber-500/5">
          <p class="text-zinc-300 text-sm">
            <strong class="text-amber-400">⚡ Bun Runtime:</strong> This package requires
            <a href="https://github.com/pegasusheavy/nestjs-platform-bun" target="_blank" rel="noopener" class="text-amber-400 hover:underline">&#64;pegasusheavy/nestjs-platform-bun</a>
            as the NestJS HTTP adapter for Bun support.
          </p>
        </div>
        <div class="card p-6">
          <ul class="space-y-2 text-zinc-300">
            <li><strong class="text-white">LeavenModule</strong> - Easy module registration</li>
            <li><strong class="text-white">Decorators</strong> - &#64;Context, &#64;Args, &#64;Info, and more</li>
            <li><strong class="text-white">Guards</strong> - Authentication, roles, permissions</li>
            <li><strong class="text-white">Interceptors</strong> - Logging, caching, metrics</li>
            <li><strong class="text-white">GqlExecutionContext</strong> - Access GraphQL context</li>
          </ul>
        </div>
      </section>

      <!-- Installation -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Installation</h2>
        <app-code-block [code]="installCode" title="terminal" />
      </section>

      <!-- Bootstrap -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Bootstrap with Bun</h2>
        <p class="text-zinc-400 mb-4">Bootstrap your NestJS app with the Bun HTTP adapter:</p>
        <app-code-block [code]="bootstrapCode" title="main.ts" />
      </section>

      <!-- Module Setup -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Module Setup</h2>
        <p class="text-zinc-400 mb-4">Register the Leaven module in your app:</p>
        <app-code-block [code]="moduleCode" title="app.module.ts" />
      </section>

      <!-- Async Configuration -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Async Configuration</h2>
        <p class="text-zinc-400 mb-4">Configure asynchronously with dependency injection:</p>
        <app-code-block [code]="asyncCode" title="app.module.ts" />
      </section>

      <!-- Decorators -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Decorators</h2>
        <p class="text-zinc-400 mb-4">Use decorators in your resolvers:</p>
        <app-code-block [code]="decoratorsCode" title="user.resolver.ts" />
      </section>

      <!-- Guards -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Authentication & Authorization</h2>
        <p class="text-zinc-400 mb-4">Protect resolvers with guards:</p>
        <app-code-block [code]="guardsCode" title="admin.resolver.ts" />
      </section>

      <!-- Interceptors -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Interceptors</h2>
        <p class="text-zinc-400 mb-4">Add logging, caching, and metrics:</p>
        <app-code-block [code]="interceptorsCode" title="post.resolver.ts" />
      </section>

      <!-- GqlExecutionContext -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">GqlExecutionContext</h2>
        <p class="text-zinc-400 mb-4">Access GraphQL-specific context in guards and interceptors:</p>
        <app-code-block [code]="contextCode" title="custom.guard.ts" />
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
                <td class="py-3 pr-4"><code class="text-pink-400">LeavenModule</code></td>
                <td class="py-3">Main module with forRoot/forRootAsync</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-pink-400">&#64;Context()</code></td>
                <td class="py-3">Inject GraphQL context</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-pink-400">&#64;Args()</code></td>
                <td class="py-3">Inject resolver arguments</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-pink-400">AuthGuard</code></td>
                <td class="py-3">Authentication guard</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-pink-400">RolesGuard</code></td>
                <td class="py-3">Role-based authorization</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-pink-400">LoggingInterceptor</code></td>
                <td class="py-3">Log resolver execution</td>
              </tr>
              <tr>
                <td class="py-3 pr-4"><code class="text-pink-400">GqlExecutionContext</code></td>
                <td class="py-3">Access GraphQL context in guards</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Navigation -->
      <nav class="flex items-center justify-between pt-8 border-t border-zinc-800">
        <a routerLink="/websockets" class="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
          </svg>
          <div class="text-right">
            <span class="text-xs text-zinc-500 block">Previous</span>
            <span class="font-medium">WebSocket Subscriptions</span>
          </div>
        </a>
        <a routerLink="/playground" class="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-right">
          <div>
            <span class="text-xs text-zinc-500 block">Next</span>
            <span class="font-medium">GraphQL Playground</span>
          </div>
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </a>
      </nav>
    </article>
  `,
})
export class NestjsComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updatePageSEO({
      title: 'NestJS Integration',
      description: 'Seamlessly integrate Leaven with NestJS using @leaven-graphql/nestjs. Guards, decorators, interceptors, and more.',
      keywords: ['NestJS GraphQL', 'NestJS integration', 'GraphQL decorators', 'NestJS guards', 'Leaven'],
      canonical: '/nestjs',
      ogType: 'article'
    });
  }

  installCode = `bun add @leaven-graphql/nestjs @leaven-graphql/core @leaven-graphql/context @leaven-graphql/errors @pegasusheavy/nestjs-platform-bun graphql`;

  bootstrapCode = `import { NestFactory } from '@nestjs/core';
import { BunAdapter } from '@pegasusheavy/nestjs-platform-bun';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new BunAdapter());

  await app.listen(3000);
  console.log('🚀 Server running at http://localhost:3000/graphql');
}

bootstrap();`;

  moduleCode = `import { Module } from '@nestjs/common';
import { LeavenModule } from '@leaven-graphql/nestjs';
import { schema } from './schema';

@Module({
  imports: [
    LeavenModule.forRoot({
      schema,
      playground: true,
      introspection: true,
      cache: { maxSize: 1000 },
    }),
  ],
})
export class AppModule {}`;

  asyncCode = `import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LeavenModule } from '@leaven-graphql/nestjs';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LeavenModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        schema,
        playground: config.get('GRAPHQL_PLAYGROUND') === 'true',
        introspection: config.get('GRAPHQL_INTROSPECTION') === 'true',
        maxComplexity: config.get('GRAPHQL_MAX_COMPLEXITY', 1000),
        maxDepth: config.get('GRAPHQL_MAX_DEPTH', 10),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}`;

  decoratorsCode = `import { Resolver, Query, Mutation } from '@nestjs/graphql';
import {
  Context,
  Args,
  Info,
  Root,
  Complexity,
  CacheHint,
  Description,
} from '@leaven-graphql/nestjs';

@Resolver(() => User)
export class UserResolver {
  // Inject GraphQL context
  @Query(() => User)
  async me(@Context() ctx: GqlContext) {
    return ctx.user;
  }

  // Inject specific context property
  @Query(() => User)
  async user(@Context('db') db: Database, @Args('id') id: string) {
    return db.users.findById(id);
  }

  // Add complexity cost
  @Query(() => [User])
  @Complexity(10)
  @Description('Fetch all users with pagination')
  async users(@Args('limit') limit: number) {
    return this.userService.findAll({ limit });
  }

  // Add cache hints
  @Query(() => UserStats)
  @CacheHint({ maxAge: 3600, scope: 'PUBLIC' })
  async userStats() {
    return this.statsService.getUserStats();
  }
}`;

  guardsCode = `import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation } from '@nestjs/graphql';
import {
  AuthGuard,
  RolesGuard,
  PermissionsGuard,
  Public,
  Roles,
  Permissions,
} from '@leaven-graphql/nestjs';

@Resolver()
@UseGuards(AuthGuard, RolesGuard)
export class AdminResolver {
  // Public endpoint (no auth required)
  @Query(() => String)
  @Public()
  health() {
    return 'OK';
  }

  // Requires admin role
  @Query(() => [User])
  @Roles('admin')
  async users() {
    return this.userService.findAll();
  }

  // Requires specific permissions
  @Mutation(() => User)
  @Permissions('users:delete')
  async deleteUser(@Args('id') id: string) {
    return this.userService.delete(id);
  }

  // Multiple roles (any match)
  @Mutation(() => User)
  @Roles('admin', 'moderator')
  async banUser(@Args('id') id: string) {
    return this.userService.ban(id);
  }
}`;

  interceptorsCode = `import { UseInterceptors } from '@nestjs/common';
import { Resolver, Query, Mutation } from '@nestjs/graphql';
import {
  LoggingInterceptor,
  CachingInterceptor,
  MetricsInterceptor,
  ErrorFormattingInterceptor,
} from '@leaven-graphql/nestjs';

// Apply to all resolvers in class
@Resolver(() => Post)
@UseInterceptors(LoggingInterceptor, MetricsInterceptor)
export class PostResolver {
  // Logs: [GraphQL] PostResolver.posts - 15ms
  @Query(() => [Post])
  async posts() {
    return this.postService.findAll();
  }

  // Add caching
  @Query(() => Post)
  @UseInterceptors(CachingInterceptor)
  @CacheHint({ maxAge: 60 })
  async post(@Args('id') id: string) {
    return this.postService.findById(id);
  }

  // Format errors consistently
  @Mutation(() => Post)
  @UseInterceptors(ErrorFormattingInterceptor)
  async createPost(@Args('input') input: CreatePostInput) {
    return this.postService.create(input);
  }
}`;

  contextCode = `import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@leaven-graphql/nestjs';

@Injectable()
export class CustomGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Create GqlExecutionContext from NestJS context
    const gqlContext = GqlExecutionContext.create(context);

    // Access GraphQL-specific data
    const ctx = gqlContext.getContext();      // GraphQL context
    const args = gqlContext.getArgs();        // Resolver arguments
    const info = gqlContext.getInfo();        // GraphQL resolve info
    const root = gqlContext.getRoot();        // Parent value

    // Helper methods
    const fieldName = gqlContext.getFieldName();
    const operationType = gqlContext.getOperationType();
    const selectedFields = gqlContext.getSelectedFields();
    const operationName = gqlContext.getOperationName();

    // Your authorization logic
    return this.checkPermission(ctx.user, fieldName);
  }

  private checkPermission(user: User, field: string): boolean {
    // Custom logic
    return true;
  }
}`;
}
