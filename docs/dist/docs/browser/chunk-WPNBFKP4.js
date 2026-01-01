import{a as v}from"./chunk-SQ3LWRKC.js";import{a as S}from"./chunk-VABBLMJJ.js";import{C as o,D as r,E as e,F as n,S as t,Z as h,ga as x,j as s,k as c,r as i,s as p,t as u}from"./chunk-SPTROXX7.js";var g=class d{constructor(m){this.seoService=m}ngOnInit(){this.seoService.updatePageSEO({title:"HTTP Server",description:"Set up a high-performance GraphQL HTTP server with @leaven-graphql/http. CORS, authentication, and Bun-native APIs.",keywords:["GraphQL HTTP","GraphQL server","Bun HTTP","GraphQL API","Leaven"],canonical:"/http",ogType:"article"})}installCode="bun add @leaven-graphql/http @leaven-graphql/core graphql";quickStartCode=`import { createServer } from '@leaven-graphql/http';
import { schema } from './schema';

const server = createServer({
  schema,
  port: 4000,
  playground: true,
});

const info = server.start();
console.log(\`\u{1F680} Server ready at \${info.url}\`);
// \u{1F680} Server ready at http://localhost:4000/graphql`;configCode=`import { createServer } from '@leaven-graphql/http';

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
});`;corsCode=`import { createServer } from '@leaven-graphql/http';

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
});`;contextCode=`import { createServer } from '@leaven-graphql/http';
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
};`;handlerCode=`import { createHandler } from '@leaven-graphql/http';
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
});`;routesCode=`import { createServer } from '@leaven-graphql/http';

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
});`;static \u0275fac=function(l){return new(l||d)(p(v))};static \u0275cmp=u({type:d,selectors:[["app-http"]],decls:144,vars:7,consts:[["itemscope","","itemtype","https://schema.org/TechArticle",1,"px-6","py-12","lg:py-16","max-w-4xl","mx-auto"],["aria-label","Breadcrumb",1,"flex","items-center","gap-2","text-sm","text-zinc-500","mb-8"],["routerLink","/",1,"hover:text-white","transition-colors"],[1,"text-zinc-300"],[1,"mb-12"],[1,"inline-flex","items-center","gap-2","px-3","py-1","rounded-full","bg-blue-500/10","border","border-blue-500/20","text-blue-400","text-xs","font-medium","mb-4"],["itemprop","headline",1,"text-4xl","md:text-5xl","font-bold","text-white","mb-4"],["itemprop","description",1,"text-xl","text-zinc-400"],[1,"text-2xl","font-semibold","text-white","mb-4"],[1,"text-zinc-400","mb-4"],[1,"text-blue-400"],[1,"card","p-6"],[1,"space-y-2","text-zinc-300"],[1,"text-white"],["title","terminal",3,"code"],["title","server.ts",3,"code"],["title","config.ts",3,"code"],["title","cors.ts",3,"code"],["title","context.ts",3,"code"],["title","handler.ts",3,"code"],["title","routes.ts",3,"code"],[1,"overflow-x-auto"],[1,"w-full","text-left"],[1,"border-b","border-zinc-800"],[1,"py-3","pr-4","text-zinc-300","font-semibold"],[1,"py-3","text-zinc-300","font-semibold"],[1,"text-zinc-400"],[1,"border-b","border-zinc-800/50"],[1,"py-3","pr-4"],[1,"py-3"],[1,"flex","items-center","justify-between","pt-8","border-t","border-zinc-800"],["routerLink","/errors",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:-translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M11 17l-5-5m0 0l5-5m-5 5h12"],[1,"text-right"],[1,"text-xs","text-zinc-500","block"],[1,"font-medium"],["routerLink","/websockets",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors","text-right"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M13 7l5 5m0 0l-5 5m5-5H6"]],template:function(l,a){l&1&&(r(0,"article",0)(1,"nav",1)(2,"a",2),t(3,"Home"),e(),r(4,"span"),t(5,"/"),e(),r(6,"span",3),t(7,"HTTP Server"),e()(),r(8,"header",4)(9,"div",5),t(10," \u{1F310} Integration "),e(),r(11,"h1",6),t(12,"HTTP Server"),e(),r(13,"p",7),t(14," Set up a high-performance GraphQL HTTP server with @leaven/http using native Bun APIs. "),e()(),r(15,"section",4)(16,"h2",8),t(17,"Overview"),e(),r(18,"p",9),t(19," The "),r(20,"code",10),t(21,"@leaven/http"),e(),t(22," package provides a complete HTTP server built on Bun's native HTTP APIs for maximum performance. "),e(),r(23,"div",11)(24,"ul",12)(25,"li")(26,"strong",13),t(27,"Native Bun APIs"),e(),t(28," - Maximum performance with Bun.serve()"),e(),r(29,"li")(30,"strong",13),t(31,"CORS Support"),e(),t(32," - Configurable CORS handling"),e(),r(33,"li")(34,"strong",13),t(35,"Request Parsing"),e(),t(36," - JSON, GraphQL, multipart support"),e(),r(37,"li")(38,"strong",13),t(39,"Playground"),e(),t(40," - Built-in GraphQL Playground"),e(),r(41,"li")(42,"strong",13),t(43,"Multiple Routes"),e(),t(44," - Custom route handling"),e()()()(),r(45,"section",4)(46,"h2",8),t(47,"Installation"),e(),n(48,"app-code-block",14),e(),r(49,"section",4)(50,"h2",8),t(51,"Quick Start"),e(),r(52,"p",9),t(53,"Create a GraphQL server in seconds:"),e(),n(54,"app-code-block",15),e(),r(55,"section",4)(56,"h2",8),t(57,"Server Configuration"),e(),r(58,"p",9),t(59,"Full configuration options:"),e(),n(60,"app-code-block",16),e(),r(61,"section",4)(62,"h2",8),t(63,"CORS Configuration"),e(),r(64,"p",9),t(65,"Configure Cross-Origin Resource Sharing:"),e(),n(66,"app-code-block",17),e(),r(67,"section",4)(68,"h2",8),t(69,"Custom Context"),e(),r(70,"p",9),t(71,"Add authentication and custom data to the context:"),e(),n(72,"app-code-block",18),e(),r(73,"section",4)(74,"h2",8),t(75,"Handler Only"),e(),r(76,"p",9),t(77,"Use just the handler with your own Bun server:"),e(),n(78,"app-code-block",19),e(),r(79,"section",4)(80,"h2",8),t(81,"Multiple Routes"),e(),r(82,"p",9),t(83,"Add custom routes alongside GraphQL:"),e(),n(84,"app-code-block",20),e(),r(85,"section",4)(86,"h2",8),t(87,"API Reference"),e(),r(88,"div",21)(89,"table",22)(90,"thead")(91,"tr",23)(92,"th",24),t(93,"Export"),e(),r(94,"th",25),t(95,"Description"),e()()(),r(96,"tbody",26)(97,"tr",27)(98,"td",28)(99,"code",10),t(100,"createServer"),e()(),r(101,"td",29),t(102,"Create a LeavenServer instance"),e()(),r(103,"tr",27)(104,"td",28)(105,"code",10),t(106,"createHandler"),e()(),r(107,"td",29),t(108,"Create a standalone request handler"),e()(),r(109,"tr",27)(110,"td",28)(111,"code",10),t(112,"LeavenServer"),e()(),r(113,"td",29),t(114,"Server class with start/stop methods"),e()(),r(115,"tr",27)(116,"td",28)(117,"code",10),t(118,"parseBody"),e()(),r(119,"td",29),t(120,"Parse request body (JSON/GraphQL/multipart)"),e()(),r(121,"tr")(122,"td",28)(123,"code",10),t(124,"buildResponse"),e()(),r(125,"td",29),t(126,"Build a Response with proper headers"),e()()()()()(),r(127,"nav",30)(128,"a",31),s(),r(129,"svg",32),n(130,"path",33),e(),c(),r(131,"div",34)(132,"span",35),t(133,"Previous"),e(),r(134,"span",36),t(135,"Error Handling"),e()()(),r(136,"a",37)(137,"div")(138,"span",35),t(139,"Next"),e(),r(140,"span",36),t(141,"WebSocket Subscriptions"),e()(),s(),r(142,"svg",38),n(143,"path",39),e()()()()),l&2&&(i(48),o("code",a.installCode),i(6),o("code",a.quickStartCode),i(6),o("code",a.configCode),i(6),o("code",a.corsCode),i(6),o("code",a.contextCode),i(6),o("code",a.handlerCode),i(6),o("code",a.routesCode))},dependencies:[h,x,S],encapsulation:2})};export{g as HttpComponent};
