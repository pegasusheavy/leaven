import{a as v}from"./chunk-SQ3LWRKC.js";import{a as h}from"./chunk-VABBLMJJ.js";import{C as o,D as n,E as e,F as i,S as t,Z as x,ga as g,j as l,k as d,r,s as p,t as u}from"./chunk-SPTROXX7.js";var S=class c{constructor(m){this.seoService=m}ngOnInit(){this.seoService.updatePageSEO({title:"NestJS Integration",description:"Seamlessly integrate Leaven with NestJS using @leaven-graphql/nestjs. Guards, decorators, interceptors, and more.",keywords:["NestJS GraphQL","NestJS integration","GraphQL decorators","NestJS guards","Leaven"],canonical:"/nestjs",ogType:"article"})}installCode="bun add @leaven-graphql/nestjs @leaven-graphql/core @leaven-graphql/context @leaven-graphql/errors @pegasusheavy/nestjs-platform-bun graphql";bootstrapCode=`import { NestFactory } from '@nestjs/core';
import { BunAdapter } from '@pegasusheavy/nestjs-platform-bun';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new BunAdapter());

  await app.listen(3000);
  console.log('\u{1F680} Server running at http://localhost:3000/graphql');
}

bootstrap();`;moduleCode=`import { Module } from '@nestjs/common';
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
export class AppModule {}`;asyncCode=`import { Module } from '@nestjs/common';
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
export class AppModule {}`;decoratorsCode=`import { Resolver, Query, Mutation } from '@nestjs/graphql';
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
}`;guardsCode=`import { UseGuards } from '@nestjs/common';
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
}`;interceptorsCode=`import { UseInterceptors } from '@nestjs/common';
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
}`;contextCode=`import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
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
}`;static \u0275fac=function(a){return new(a||c)(p(v))};static \u0275cmp=u({type:c,selectors:[["app-nestjs"]],decls:170,vars:8,consts:[["itemscope","","itemtype","https://schema.org/TechArticle",1,"px-6","py-12","lg:py-16","max-w-4xl","mx-auto"],["aria-label","Breadcrumb",1,"flex","items-center","gap-2","text-sm","text-zinc-500","mb-8"],["routerLink","/",1,"hover:text-white","transition-colors"],[1,"text-zinc-300"],[1,"mb-12"],[1,"inline-flex","items-center","gap-2","px-3","py-1","rounded-full","bg-pink-500/10","border","border-pink-500/20","text-pink-400","text-xs","font-medium","mb-4"],["itemprop","headline",1,"text-4xl","md:text-5xl","font-bold","text-white","mb-4"],["itemprop","description",1,"text-xl","text-zinc-400"],[1,"text-2xl","font-semibold","text-white","mb-4"],[1,"text-zinc-400","mb-4"],[1,"text-pink-400"],[1,"card","p-4","mb-4","border-amber-500/20","bg-amber-500/5"],[1,"text-zinc-300","text-sm"],[1,"text-amber-400"],["href","https://github.com/PegasusHeavyIndustries/nestjs-platform-bun","target","_blank","rel","noopener",1,"text-amber-400","hover:underline"],[1,"card","p-6"],[1,"space-y-2","text-zinc-300"],[1,"text-white"],["title","terminal",3,"code"],["title","main.ts",3,"code"],["title","app.module.ts",3,"code"],["title","user.resolver.ts",3,"code"],["title","admin.resolver.ts",3,"code"],["title","post.resolver.ts",3,"code"],["title","custom.guard.ts",3,"code"],[1,"overflow-x-auto"],[1,"w-full","text-left"],[1,"border-b","border-zinc-800"],[1,"py-3","pr-4","text-zinc-300","font-semibold"],[1,"py-3","text-zinc-300","font-semibold"],[1,"text-zinc-400"],[1,"border-b","border-zinc-800/50"],[1,"py-3","pr-4"],[1,"py-3"],[1,"flex","items-center","justify-between","pt-8","border-t","border-zinc-800"],["routerLink","/websockets",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:-translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M11 17l-5-5m0 0l5-5m-5 5h12"],[1,"text-right"],[1,"text-xs","text-zinc-500","block"],[1,"font-medium"],["routerLink","/playground",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors","text-right"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M13 7l5 5m0 0l-5 5m5-5H6"]],template:function(a,s){a&1&&(n(0,"article",0)(1,"nav",1)(2,"a",2),t(3,"Home"),e(),n(4,"span"),t(5,"/"),e(),n(6,"span",3),t(7,"NestJS Integration"),e()(),n(8,"header",4)(9,"div",5),t(10," \u{1F3DB}\uFE0F Framework "),e(),n(11,"h1",6),t(12,"NestJS Integration"),e(),n(13,"p",7),t(14," Seamlessly integrate Leaven with NestJS using @leaven/nestjs. Guards, decorators, and interceptors included. "),e()(),n(15,"section",4)(16,"h2",8),t(17,"Overview"),e(),n(18,"p",9),t(19," The "),n(20,"code",10),t(21,"@leaven/nestjs"),e(),t(22," package provides full NestJS integration with all the decorators, guards, and interceptors you need. "),e(),n(23,"div",11)(24,"p",12)(25,"strong",13),t(26,"\u26A1 Bun Runtime:"),e(),t(27," This package requires "),n(28,"a",14),t(29,"@pegasusheavy/nestjs-platform-bun"),e(),t(30," as the NestJS HTTP adapter for Bun support. "),e()(),n(31,"div",15)(32,"ul",16)(33,"li")(34,"strong",17),t(35,"LeavenModule"),e(),t(36," - Easy module registration"),e(),n(37,"li")(38,"strong",17),t(39,"Decorators"),e(),t(40," - @Context, @Args, @Info, and more"),e(),n(41,"li")(42,"strong",17),t(43,"Guards"),e(),t(44," - Authentication, roles, permissions"),e(),n(45,"li")(46,"strong",17),t(47,"Interceptors"),e(),t(48," - Logging, caching, metrics"),e(),n(49,"li")(50,"strong",17),t(51,"GqlExecutionContext"),e(),t(52," - Access GraphQL context"),e()()()(),n(53,"section",4)(54,"h2",8),t(55,"Installation"),e(),i(56,"app-code-block",18),e(),n(57,"section",4)(58,"h2",8),t(59,"Bootstrap with Bun"),e(),n(60,"p",9),t(61,"Bootstrap your NestJS app with the Bun HTTP adapter:"),e(),i(62,"app-code-block",19),e(),n(63,"section",4)(64,"h2",8),t(65,"Module Setup"),e(),n(66,"p",9),t(67,"Register the Leaven module in your app:"),e(),i(68,"app-code-block",20),e(),n(69,"section",4)(70,"h2",8),t(71,"Async Configuration"),e(),n(72,"p",9),t(73,"Configure asynchronously with dependency injection:"),e(),i(74,"app-code-block",20),e(),n(75,"section",4)(76,"h2",8),t(77,"Decorators"),e(),n(78,"p",9),t(79,"Use decorators in your resolvers:"),e(),i(80,"app-code-block",21),e(),n(81,"section",4)(82,"h2",8),t(83,"Authentication & Authorization"),e(),n(84,"p",9),t(85,"Protect resolvers with guards:"),e(),i(86,"app-code-block",22),e(),n(87,"section",4)(88,"h2",8),t(89,"Interceptors"),e(),n(90,"p",9),t(91,"Add logging, caching, and metrics:"),e(),i(92,"app-code-block",23),e(),n(93,"section",4)(94,"h2",8),t(95,"GqlExecutionContext"),e(),n(96,"p",9),t(97,"Access GraphQL-specific context in guards and interceptors:"),e(),i(98,"app-code-block",24),e(),n(99,"section",4)(100,"h2",8),t(101,"API Reference"),e(),n(102,"div",25)(103,"table",26)(104,"thead")(105,"tr",27)(106,"th",28),t(107,"Export"),e(),n(108,"th",29),t(109,"Description"),e()()(),n(110,"tbody",30)(111,"tr",31)(112,"td",32)(113,"code",10),t(114,"LeavenModule"),e()(),n(115,"td",33),t(116,"Main module with forRoot/forRootAsync"),e()(),n(117,"tr",31)(118,"td",32)(119,"code",10),t(120,"@Context()"),e()(),n(121,"td",33),t(122,"Inject GraphQL context"),e()(),n(123,"tr",31)(124,"td",32)(125,"code",10),t(126,"@Args()"),e()(),n(127,"td",33),t(128,"Inject resolver arguments"),e()(),n(129,"tr",31)(130,"td",32)(131,"code",10),t(132,"AuthGuard"),e()(),n(133,"td",33),t(134,"Authentication guard"),e()(),n(135,"tr",31)(136,"td",32)(137,"code",10),t(138,"RolesGuard"),e()(),n(139,"td",33),t(140,"Role-based authorization"),e()(),n(141,"tr",31)(142,"td",32)(143,"code",10),t(144,"LoggingInterceptor"),e()(),n(145,"td",33),t(146,"Log resolver execution"),e()(),n(147,"tr")(148,"td",32)(149,"code",10),t(150,"GqlExecutionContext"),e()(),n(151,"td",33),t(152,"Access GraphQL context in guards"),e()()()()()(),n(153,"nav",34)(154,"a",35),l(),n(155,"svg",36),i(156,"path",37),e(),d(),n(157,"div",38)(158,"span",39),t(159,"Previous"),e(),n(160,"span",40),t(161,"WebSocket Subscriptions"),e()()(),n(162,"a",41)(163,"div")(164,"span",39),t(165,"Next"),e(),n(166,"span",40),t(167,"GraphQL Playground"),e()(),l(),n(168,"svg",42),i(169,"path",43),e()()()()),a&2&&(r(56),o("code",s.installCode),r(6),o("code",s.bootstrapCode),r(6),o("code",s.moduleCode),r(6),o("code",s.asyncCode),r(6),o("code",s.decoratorsCode),r(6),o("code",s.guardsCode),r(6),o("code",s.interceptorsCode),r(6),o("code",s.contextCode))},dependencies:[x,g,h],encapsulation:2})};export{S as NestjsComponent};
