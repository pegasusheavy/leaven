import{a as C}from"./chunk-SQ3LWRKC.js";import{a as g}from"./chunk-VABBLMJJ.js";import{C as r,D as n,E as e,F as o,S as t,Z as u,ga as h,j as s,k as m,r as i,s as x,t as p}from"./chunk-SPTROXX7.js";var S=class c{constructor(d){this.seoService=d}ngOnInit(){this.seoService.updatePageSEO({title:"Request Context",description:"Manage request-scoped data with AsyncLocalStorage using @leaven-graphql/context. Access request info anywhere in your resolvers.",keywords:["request context","AsyncLocalStorage","GraphQL context","Bun context","Leaven"],canonical:"/context",ogType:"article"})}installCode="bun add @leaven-graphql/context";basicCode=`import { createRequestContext } from '@leaven-graphql/context';

// Create context from a Request
const context = createRequestContext(request, {
  includeHeaders: true,
  includeIp: true,
});

// Access context properties
console.log(context.requestId);   // Unique request ID
console.log(context.url);         // Request URL
console.log(context.method);      // HTTP method
console.log(context.headers);     // Request headers
console.log(context.ip);          // Client IP
console.log(context.userAgent);   // User agent string
console.log(context.startTime);   // Request start time`;storeCode=`import { ContextStore, createContextStore } from '@leaven-graphql/context';

// Create a global context store
const store = createContextStore();

// Run code with context
store.run({ userId: '123', role: 'admin' }, async () => {
  // Access context anywhere
  const context = store.getContext();
  console.log(context.userId); // '123'

  // Context is available in nested functions
  await someNestedFunction();
});

// In a nested function
async function someNestedFunction() {
  const context = store.getContext();
  console.log(context.role); // 'admin'
}`;builderCode=`import { ContextBuilder, createContextBuilder } from '@leaven-graphql/context';

const builder = createContextBuilder()
  .withRequest(request)
  .withUser(authenticatedUser)
  .withDatabase(dbConnection)
  .withLogger(logger)
  .withTracing(traceId);

// Build the context
const context = builder.build();

// Use in resolvers
const resolvers = {
  Query: {
    me: (_, __, context) => {
      return context.user;
    },
    posts: async (_, __, context) => {
      context.logger.info('Fetching posts');
      return context.db.posts.findAll();
    },
  },
};`;customCode=`import type { BaseContext, ContextExtension } from '@leaven-graphql/context';

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
);`;integrationCode=`import { createServer } from '@leaven-graphql/http';
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
console.log('Server ready with context support');`;static \u0275fac=function(l){return new(l||c)(x(C))};static \u0275cmp=p({type:c,selectors:[["app-context"]],decls:134,vars:6,consts:[["itemscope","","itemtype","https://schema.org/TechArticle",1,"px-6","py-12","lg:py-16","max-w-4xl","mx-auto"],["aria-label","Breadcrumb",1,"flex","items-center","gap-2","text-sm","text-zinc-500","mb-8"],["routerLink","/",1,"hover:text-white","transition-colors"],[1,"text-zinc-300"],[1,"mb-12"],[1,"inline-flex","items-center","gap-2","px-3","py-1","rounded-full","bg-teal-500/10","border","border-teal-500/20","text-teal-400","text-xs","font-medium","mb-4"],["itemprop","headline",1,"text-4xl","md:text-5xl","font-bold","text-white","mb-4"],["itemprop","description",1,"text-xl","text-zinc-400"],[1,"text-2xl","font-semibold","text-white","mb-4"],[1,"text-zinc-400","mb-4"],[1,"text-teal-400"],[1,"card","p-6"],[1,"space-y-2","text-zinc-300"],[1,"text-white"],["title","terminal",3,"code"],["title","context.ts",3,"code"],["title","store.ts",3,"code"],["title","builder.ts",3,"code"],["title","custom-context.ts",3,"code"],["title","server.ts",3,"code"],[1,"overflow-x-auto"],[1,"w-full","text-left"],[1,"border-b","border-zinc-800"],[1,"py-3","pr-4","text-zinc-300","font-semibold"],[1,"py-3","text-zinc-300","font-semibold"],[1,"text-zinc-400"],[1,"border-b","border-zinc-800/50"],[1,"py-3","pr-4"],[1,"py-3"],[1,"flex","items-center","justify-between","pt-8","border-t","border-zinc-800"],["routerLink","/schema",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:-translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M11 17l-5-5m0 0l5-5m-5 5h12"],[1,"text-right"],[1,"text-xs","text-zinc-500","block"],[1,"font-medium"],["routerLink","/plugins",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors","text-right"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M13 7l5 5m0 0l-5 5m5-5H6"]],template:function(l,a){l&1&&(n(0,"article",0)(1,"nav",1)(2,"a",2),t(3,"Home"),e(),n(4,"span"),t(5,"/"),e(),n(6,"span",3),t(7,"Request Context"),e()(),n(8,"header",4)(9,"div",5),t(10," \u{1F517} Core Package "),e(),n(11,"h1",6),t(12,"Request Context"),e(),n(13,"p",7),t(14," Manage request-scoped data with AsyncLocalStorage using @leaven/context. "),e()(),n(15,"section",4)(16,"h2",8),t(17,"Overview"),e(),n(18,"p",9),t(19," The "),n(20,"code",10),t(21,"@leaven/context"),e(),t(22," package provides request-scoped context management using Node.js AsyncLocalStorage. Access request data anywhere without prop drilling. "),e(),n(23,"div",11)(24,"ul",12)(25,"li")(26,"strong",13),t(27,"RequestContext"),e(),t(28," - Per-request context with metadata"),e(),n(29,"li")(30,"strong",13),t(31,"ContextStore"),e(),t(32," - AsyncLocalStorage-based storage"),e(),n(33,"li")(34,"strong",13),t(35,"ContextBuilder"),e(),t(36," - Fluent API for context creation"),e(),n(37,"li")(38,"strong",13),t(39,"Type Safety"),e(),t(40," - Full TypeScript support"),e()()()(),n(41,"section",4)(42,"h2",8),t(43,"Installation"),e(),o(44,"app-code-block",14),e(),n(45,"section",4)(46,"h2",8),t(47,"Basic Usage"),e(),n(48,"p",9),t(49,"Create request context from an HTTP request:"),e(),o(50,"app-code-block",15),e(),n(51,"section",4)(52,"h2",8),t(53,"Context Store"),e(),n(54,"p",9),t(55,"Use the context store to access context anywhere in your application:"),e(),o(56,"app-code-block",16),e(),n(57,"section",4)(58,"h2",8),t(59,"Context Builder"),e(),n(60,"p",9),t(61,"Build complex contexts with the fluent API:"),e(),o(62,"app-code-block",17),e(),n(63,"section",4)(64,"h2",8),t(65,"Custom Context Types"),e(),n(66,"p",9),t(67,"Extend the base context with your own types:"),e(),o(68,"app-code-block",18),e(),n(69,"section",4)(70,"h2",8),t(71,"Integration with HTTP"),e(),n(72,"p",9),t(73,"Integrate with @leaven/http for automatic context handling:"),e(),o(74,"app-code-block",19),e(),n(75,"section",4)(76,"h2",8),t(77,"API Reference"),e(),n(78,"div",20)(79,"table",21)(80,"thead")(81,"tr",22)(82,"th",23),t(83,"Export"),e(),n(84,"th",24),t(85,"Description"),e()()(),n(86,"tbody",25)(87,"tr",26)(88,"td",27)(89,"code",10),t(90,"RequestContext"),e()(),n(91,"td",28),t(92,"Per-request context class"),e()(),n(93,"tr",26)(94,"td",27)(95,"code",10),t(96,"createRequestContext"),e()(),n(97,"td",28),t(98,"Create context from a Request"),e()(),n(99,"tr",26)(100,"td",27)(101,"code",10),t(102,"ContextStore"),e()(),n(103,"td",28),t(104,"AsyncLocalStorage-based store"),e()(),n(105,"tr",26)(106,"td",27)(107,"code",10),t(108,"ContextBuilder"),e()(),n(109,"td",28),t(110,"Fluent API for building contexts"),e()(),n(111,"tr")(112,"td",27)(113,"code",10),t(114,"BaseContext"),e()(),n(115,"td",28),t(116,"Type interface for custom contexts"),e()()()()()(),n(117,"nav",29)(118,"a",30),s(),n(119,"svg",31),o(120,"path",32),e(),m(),n(121,"div",33)(122,"span",34),t(123,"Previous"),e(),n(124,"span",35),t(125,"Schema Building"),e()()(),n(126,"a",36)(127,"div")(128,"span",34),t(129,"Next"),e(),n(130,"span",35),t(131,"Plugin System"),e()(),s(),n(132,"svg",37),o(133,"path",38),e()()()()),l&2&&(i(44),r("code",a.installCode),i(6),r("code",a.basicCode),i(6),r("code",a.storeCode),i(6),r("code",a.builderCode),i(6),r("code",a.customCode),i(6),r("code",a.integrationCode))},dependencies:[u,h,g],encapsulation:2})};export{S as ContextComponent};
