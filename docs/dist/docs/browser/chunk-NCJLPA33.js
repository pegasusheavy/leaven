import{a as E}from"./chunk-SQ3LWRKC.js";import{a as x}from"./chunk-VABBLMJJ.js";import{C as a,D as n,E as e,F as i,S as t,Z as h,ga as g,j as d,k as s,r,s as c,t as u}from"./chunk-SPTROXX7.js";var v=class m{constructor(p){this.seoService=p}ngOnInit(){this.seoService.updatePageSEO({title:"GraphQL Playground",description:"Built-in GraphQL Playground and GraphiQL integration with @leaven-graphql/playground. Explore and test your API.",keywords:["GraphQL Playground","GraphiQL","API testing","GraphQL IDE","Leaven"],canonical:"/playground",ogType:"article"})}installCode="bun add @leaven-graphql/playground";quickStartCode=`import { createServer } from '@leaven-graphql/http';
import { schema } from './schema';

const server = createServer({
  schema,
  port: 4000,
  // Enable GraphQL Playground
  playground: true,
});

server.start();
// Open http://localhost:4000/graphql in your browser`;configCode=`import { createServer } from '@leaven-graphql/http';

const server = createServer({
  schema,
  playground: {
    // Endpoint configuration
    endpoint: '/graphql',
    subscriptionEndpoint: 'ws://localhost:4000/graphql',

    // Default headers
    headers: {
      'X-Custom-Header': 'value',
    },

    // Editor settings
    settings: {
      'editor.theme': 'dark',
      'editor.fontSize': 14,
      'editor.fontFamily': '"Fira Code", monospace',
      'editor.cursorShape': 'line',

      // Request settings
      'request.credentials': 'include',

      // UI settings
      'schema.polling.enable': true,
      'schema.polling.interval': 2000,

      // Tracing
      'tracing.hideTracingResponse': false,
    },

    // Pre-populated tabs
    tabs: [
      {
        name: 'Hello Query',
        query: \`query HelloWorld {
  hello
}\`,
        variables: '{}',
      },
      {
        name: 'User Query',
        query: \`query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}\`,
        variables: '{"id": "1"}',
      },
    ],
  },
});`;standaloneCode=`import { createPlaygroundHandler, renderPlayground } from '@leaven-graphql/playground';

// Create a handler for use with any server
const playgroundHandler = createPlaygroundHandler({
  endpoint: '/graphql',
  settings: { 'editor.theme': 'dark' },
});

// Use with Bun.serve
Bun.serve({
  port: 4000,
  fetch(request) {
    const url = new URL(request.url);

    // Serve playground at root
    if (url.pathname === '/') {
      return playgroundHandler(request);
    }

    // Your GraphQL handler
    if (url.pathname === '/graphql') {
      return graphqlHandler(request);
    }

    return new Response('Not Found', { status: 404 });
  },
});

// Or just get the HTML
const html = renderPlayground({
  endpoint: '/graphql',
  settings: { 'editor.theme': 'dark' },
});`;graphiqlCode=`import { createServer } from '@leaven-graphql/http';
import { createGraphiQLHandler, renderGraphiQL } from '@leaven-graphql/playground';

// Use GraphiQL instead of Playground
const server = createServer({
  schema,
  playground: false, // Disable default playground
  routes: {
    // Serve GraphiQL at /graphiql
    '/graphiql': createGraphiQLHandler({
      endpoint: '/graphql',
      headerEditorEnabled: true,
    }),
  },
});

// Or render HTML directly
const html = renderGraphiQL({
  endpoint: '/graphql',
  defaultQuery: \`{
  hello
}\`,
});`;securityCode=`import { createServer } from '@leaven-graphql/http';

const server = createServer({
  schema,

  // \u2705 Disable in production
  playground: process.env.NODE_ENV !== 'production',

  // Also disable introspection in production
  introspection: process.env.NODE_ENV !== 'production',
});

// Or use environment variable
const server = createServer({
  schema,
  playground: process.env.ENABLE_PLAYGROUND === 'true',
});`;static \u0275fac=function(o){return new(o||m)(c(E))};static \u0275cmp=u({type:m,selectors:[["app-playground"]],decls:187,vars:6,consts:[["itemscope","","itemtype","https://schema.org/TechArticle",1,"px-6","py-12","lg:py-16","max-w-4xl","mx-auto"],["aria-label","Breadcrumb",1,"flex","items-center","gap-2","text-sm","text-zinc-500","mb-8"],["routerLink","/",1,"hover:text-white","transition-colors"],[1,"text-zinc-300"],[1,"mb-12"],[1,"inline-flex","items-center","gap-2","px-3","py-1","rounded-full","bg-indigo-500/10","border","border-indigo-500/20","text-indigo-400","text-xs","font-medium","mb-4"],["itemprop","headline",1,"text-4xl","md:text-5xl","font-bold","text-white","mb-4"],["itemprop","description",1,"text-xl","text-zinc-400"],[1,"text-2xl","font-semibold","text-white","mb-4"],[1,"text-zinc-400","mb-4"],[1,"text-indigo-400"],[1,"card","p-6"],[1,"space-y-2","text-zinc-300"],[1,"text-white"],["title","terminal",3,"code"],["title","server.ts",3,"code"],["title","playground-config.ts",3,"code"],["title","standalone.ts",3,"code"],["title","graphiql.ts",3,"code"],[1,"grid","grid-cols-1","md:grid-cols-2","gap-4"],[1,"text-2xl","mb-2"],[1,"font-semibold","text-white","mb-2"],[1,"text-sm","text-zinc-400"],[1,"card","p-6","border-amber-500/20","bg-amber-500/5"],[1,"text-zinc-300","mb-4"],[1,"text-amber-400"],["title","production.ts",3,"code"],[1,"overflow-x-auto"],[1,"w-full","text-left"],[1,"border-b","border-zinc-800"],[1,"py-3","pr-4","text-zinc-300","font-semibold"],[1,"py-3","text-zinc-300","font-semibold"],[1,"text-zinc-400"],[1,"border-b","border-zinc-800/50"],[1,"py-3","pr-4"],[1,"py-3"],[1,"flex","items-center","justify-between","pt-8","border-t","border-zinc-800"],["routerLink","/nestjs",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:-translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M11 17l-5-5m0 0l5-5m-5 5h12"],[1,"text-right"],[1,"text-xs","text-zinc-500","block"],[1,"font-medium"],["routerLink","/quick-start",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors","text-right"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M13 7l5 5m0 0l-5 5m5-5H6"]],template:function(o,l){o&1&&(n(0,"article",0)(1,"nav",1)(2,"a",2),t(3,"Home"),e(),n(4,"span"),t(5,"/"),e(),n(6,"span",3),t(7,"GraphQL Playground"),e()(),n(8,"header",4)(9,"div",5),t(10," \u{1F3AE} Developer Experience "),e(),n(11,"h1",6),t(12,"GraphQL Playground"),e(),n(13,"p",7),t(14," Built-in GraphQL Playground and GraphiQL integration with @leaven/playground. "),e()(),n(15,"section",4)(16,"h2",8),t(17,"Overview"),e(),n(18,"p",9),t(19," The "),n(20,"code",10),t(21,"@leaven/playground"),e(),t(22," package provides an interactive GraphQL IDE for exploring and testing your API. "),e(),n(23,"div",11)(24,"ul",12)(25,"li")(26,"strong",13),t(27,"GraphQL Playground"),e(),t(28," - Feature-rich GraphQL IDE"),e(),n(29,"li")(30,"strong",13),t(31,"GraphiQL"),e(),t(32," - Official GraphQL IDE"),e(),n(33,"li")(34,"strong",13),t(35,"Schema Explorer"),e(),t(36," - Browse types and fields"),e(),n(37,"li")(38,"strong",13),t(39,"Query History"),e(),t(40," - Track previous queries"),e(),n(41,"li")(42,"strong",13),t(43,"Customizable"),e(),t(44," - Themes, tabs, settings"),e()()()(),n(45,"section",4)(46,"h2",8),t(47,"Installation"),e(),i(48,"app-code-block",14),e(),n(49,"section",4)(50,"h2",8),t(51,"Quick Start"),e(),n(52,"p",9),t(53,"Enable playground with @leaven/http:"),e(),i(54,"app-code-block",15),e(),n(55,"section",4)(56,"h2",8),t(57,"Configuration"),e(),n(58,"p",9),t(59,"Customize the playground appearance and behavior:"),e(),i(60,"app-code-block",16),e(),n(61,"section",4)(62,"h2",8),t(63,"Standalone Usage"),e(),n(64,"p",9),t(65,"Use the playground handler directly:"),e(),i(66,"app-code-block",17),e(),n(67,"section",4)(68,"h2",8),t(69,"GraphiQL Alternative"),e(),n(70,"p",9),t(71,"Use GraphiQL instead of Playground:"),e(),i(72,"app-code-block",18),e(),n(73,"section",4)(74,"h2",8),t(75,"Features"),e(),n(76,"div",19)(77,"div",11)(78,"div",20),t(79,"\u{1F4DD}"),e(),n(80,"h3",21),t(81,"Query Editor"),e(),n(82,"p",22),t(83,"Syntax highlighting, auto-complete, and error detection."),e()(),n(84,"div",11)(85,"div",20),t(86,"\u{1F4CA}"),e(),n(87,"h3",21),t(88,"Schema Explorer"),e(),n(89,"p",22),t(90,"Browse types, fields, and documentation."),e()(),n(91,"div",11)(92,"div",20),t(93,"\u{1F4DC}"),e(),n(94,"h3",21),t(95,"Query History"),e(),n(96,"p",22),t(97,"Access and replay previous queries."),e()(),n(98,"div",11)(99,"div",20),t(100,"\u{1F510}"),e(),n(101,"h3",21),t(102,"Headers Editor"),e(),n(103,"p",22),t(104,"Add authentication and custom headers."),e()(),n(105,"div",11)(106,"div",20),t(107,"\u{1F4D1}"),e(),n(108,"h3",21),t(109,"Multiple Tabs"),e(),n(110,"p",22),t(111,"Work on multiple queries simultaneously."),e()(),n(112,"div",11)(113,"div",20),t(114,"\u{1F3A8}"),e(),n(115,"h3",21),t(116,"Themes"),e(),n(117,"p",22),t(118,"Light and dark themes with customization."),e()()()(),n(119,"section",4)(120,"h2",8),t(121,"Security Considerations"),e(),n(122,"div",23)(123,"p",24)(124,"strong",25),t(125,"\u26A0\uFE0F Important:"),e(),t(126," Disable playground in production! "),e(),i(127,"app-code-block",26),e()(),n(128,"section",4)(129,"h2",8),t(130,"API Reference"),e(),n(131,"div",27)(132,"table",28)(133,"thead")(134,"tr",29)(135,"th",30),t(136,"Export"),e(),n(137,"th",31),t(138,"Description"),e()()(),n(139,"tbody",32)(140,"tr",33)(141,"td",34)(142,"code",10),t(143,"renderPlayground"),e()(),n(144,"td",35),t(145,"Render Playground HTML"),e()(),n(146,"tr",33)(147,"td",34)(148,"code",10),t(149,"renderGraphiQL"),e()(),n(150,"td",35),t(151,"Render GraphiQL HTML"),e()(),n(152,"tr",33)(153,"td",34)(154,"code",10),t(155,"createPlaygroundHandler"),e()(),n(156,"td",35),t(157,"Create HTTP handler for playground"),e()(),n(158,"tr",33)(159,"td",34)(160,"code",10),t(161,"createGraphiQLHandler"),e()(),n(162,"td",35),t(163,"Create HTTP handler for GraphiQL"),e()(),n(164,"tr")(165,"td",34)(166,"code",10),t(167,"PlaygroundConfig"),e()(),n(168,"td",35),t(169,"Configuration type"),e()()()()()(),n(170,"nav",36)(171,"a",37),d(),n(172,"svg",38),i(173,"path",39),e(),s(),n(174,"div",40)(175,"span",41),t(176,"Previous"),e(),n(177,"span",42),t(178,"NestJS Integration"),e()()(),n(179,"a",43)(180,"div")(181,"span",41),t(182,"Back to"),e(),n(183,"span",42),t(184,"Quick Start"),e()(),d(),n(185,"svg",44),i(186,"path",45),e()()()()),o&2&&(r(48),a("code",l.installCode),r(6),a("code",l.quickStartCode),r(6),a("code",l.configCode),r(6),a("code",l.standaloneCode),r(6),a("code",l.graphiqlCode),r(55),a("code",l.securityCode))},dependencies:[h,g,x],encapsulation:2})};export{v as PlaygroundComponent};
