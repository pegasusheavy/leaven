import{a as f}from"./chunk-SQ3LWRKC.js";import{a as h}from"./chunk-VABBLMJJ.js";import{C as o,D as i,E as e,F as n,S as t,Z as u,ga as x,j as m,k as d,r,s as g,t as p}from"./chunk-SPTROXX7.js";var E=class s{constructor(c){this.seoService=c}ngOnInit(){this.seoService.updatePageSEO({title:"Plugin System",description:"Extend Leaven with plugins for caching, logging, tracing, depth limiting, and complexity analysis.",keywords:["GraphQL plugins","middleware","caching","logging","tracing","Leaven"],canonical:"/plugins",ogType:"article"})}installCode="bun add @leaven-graphql/plugins";loggingCode=`import { createLoggingPlugin } from '@leaven-graphql/plugins';

const loggingPlugin = createLoggingPlugin({
  logger: console,
  logLevel: 'info',
  includeVariables: false, // Don't log sensitive data
  includeResult: false,
});

// Output:
// [GraphQL] Query getUser started
// [GraphQL] Query getUser completed in 15ms`;tracingCode=`import { createTracingPlugin } from '@leaven-graphql/plugins';

const tracingPlugin = createTracingPlugin({
  includeResolvers: true,
  includeValidation: true,
});

// Adds tracing info to response extensions:
// {
//   data: { ... },
//   extensions: {
//     tracing: {
//       version: 1,
//       startTime: "2026-01-01T12:00:00.000Z",
//       duration: 15000000,
//       execution: { ... }
//     }
//   }
// }`;depthCode=`import { createDepthLimitPlugin } from '@leaven-graphql/plugins';

const depthLimitPlugin = createDepthLimitPlugin({
  maxDepth: 10,
  ignoreIntrospection: true,
});

// Rejects queries that are too deeply nested:
// query {
//   user {
//     posts {
//       comments {
//         author {
//           posts { ... } // Too deep!
//         }
//       }
//     }
//   }
// }`;complexityCode=`import { createComplexityPlugin } from '@leaven-graphql/plugins';

const complexityPlugin = createComplexityPlugin({
  maxComplexity: 1000,
  defaultFieldComplexity: 1,
  scalarCost: 0,
  objectCost: 1,
  listFactor: 10,
});

// Calculates and enforces query complexity
// Prevents expensive queries from overwhelming your server`;managerCode=`import { PluginManager, createPluginManager } from '@leaven-graphql/plugins';
import { createLoggingPlugin, createTracingPlugin } from '@leaven-graphql/plugins';

// Create plugin manager with schema
const manager = createPluginManager({
  schema,
  plugins: [
    createLoggingPlugin({ logger: console }),
    createTracingPlugin(),
    createDepthLimitPlugin({ maxDepth: 10 }),
  ],
});

// Register additional plugins
manager.register(myCustomPlugin);

// Unregister plugins
manager.unregister('logging');

// Get registered plugin names
const plugins = manager.getPluginNames();
// ['logging', 'tracing', 'depthLimit']`;customCode=`import { createPlugin } from '@leaven-graphql/plugins';

const metricsPlugin = createPlugin({
  name: 'metrics',
  version: '1.0.0',

  beforeParse: (query, context) => {
    context.startTime = performance.now();
    return query; // Can transform the query
  },

  afterExecute: (result, context) => {
    const duration = performance.now() - context.startTime;

    // Record metrics
    metrics.record({
      operation: context.operationName,
      duration,
      errors: result.errors?.length ?? 0,
    });

    return result;
  },

  onError: (error, context) => {
    metrics.recordError({
      operation: context.operationName,
      error: error.message,
    });
  },
});`;composeCode=`import { composePlugins } from '@leaven-graphql/plugins';

// Combine multiple plugins into one
const combinedPlugin = composePlugins([
  createLoggingPlugin({ logger: console }),
  createTracingPlugin(),
  createDepthLimitPlugin({ maxDepth: 10 }),
  createComplexityPlugin({ maxComplexity: 500 }),
]);

// Use with executor
const executor = new LeavenExecutor({
  schema,
  plugins: [combinedPlugin],
});`;static \u0275fac=function(a){return new(a||s)(g(f))};static \u0275cmp=p({type:s,selectors:[["app-plugins"]],decls:148,vars:8,consts:[["itemscope","","itemtype","https://schema.org/TechArticle",1,"px-6","py-12","lg:py-16","max-w-4xl","mx-auto"],["aria-label","Breadcrumb",1,"flex","items-center","gap-2","text-sm","text-zinc-500","mb-8"],["routerLink","/",1,"hover:text-white","transition-colors"],[1,"text-zinc-300"],[1,"mb-12"],[1,"inline-flex","items-center","gap-2","px-3","py-1","rounded-full","bg-purple-500/10","border","border-purple-500/20","text-purple-400","text-xs","font-medium","mb-4"],["itemprop","headline",1,"text-4xl","md:text-5xl","font-bold","text-white","mb-4"],["itemprop","description",1,"text-xl","text-zinc-400"],[1,"text-2xl","font-semibold","text-white","mb-4"],[1,"text-zinc-400","mb-4"],[1,"card","p-6"],[1,"space-y-2","text-zinc-300"],[1,"text-white"],["title","terminal",3,"code"],[1,"text-lg","font-semibold","text-white","mt-6","mb-3"],["title","logging.ts",3,"code"],["title","tracing.ts",3,"code"],["title","depth-limit.ts",3,"code"],["title","complexity.ts",3,"code"],["title","manager.ts",3,"code"],["title","custom-plugin.ts",3,"code"],[1,"overflow-x-auto"],[1,"w-full","text-left"],[1,"border-b","border-zinc-800"],[1,"py-3","pr-4","text-zinc-300","font-semibold"],[1,"py-3","text-zinc-300","font-semibold"],[1,"text-zinc-400"],[1,"border-b","border-zinc-800/50"],[1,"py-3","pr-4"],[1,"text-purple-400"],[1,"py-3"],["title","compose.ts",3,"code"],[1,"flex","items-center","justify-between","pt-8","border-t","border-zinc-800"],["routerLink","/context",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:-translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M11 17l-5-5m0 0l5-5m-5 5h12"],[1,"text-right"],[1,"text-xs","text-zinc-500","block"],[1,"font-medium"],["routerLink","/errors",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors","text-right"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M13 7l5 5m0 0l-5 5m5-5H6"]],template:function(a,l){a&1&&(i(0,"article",0)(1,"nav",1)(2,"a",2),t(3,"Home"),e(),i(4,"span"),t(5,"/"),e(),i(6,"span",3),t(7,"Plugin System"),e()(),i(8,"header",4)(9,"div",5),t(10," \u{1F9E9} Extensibility "),e(),i(11,"h1",6),t(12,"Plugin System"),e(),i(13,"p",7),t(14," Extend Leaven with plugins for caching, logging, tracing, and more using @leaven/plugins. "),e()(),i(15,"section",4)(16,"h2",8),t(17,"Overview"),e(),i(18,"p",9),t(19," The plugin system allows you to hook into the GraphQL execution lifecycle. Plugins can transform queries, add caching, logging, tracing, and enforce limits. "),e(),i(20,"div",10)(21,"ul",11)(22,"li")(23,"strong",12),t(24,"Lifecycle Hooks"),e(),t(25," - beforeParse, afterParse, beforeExecute, afterExecute"),e(),i(26,"li")(27,"strong",12),t(28,"Built-in Plugins"),e(),t(29," - Caching, logging, tracing, depth/complexity limits"),e(),i(30,"li")(31,"strong",12),t(32,"Plugin Composition"),e(),t(33," - Combine multiple plugins easily"),e(),i(34,"li")(35,"strong",12),t(36,"Type Safety"),e(),t(37," - Fully typed plugin interface"),e()()()(),i(38,"section",4)(39,"h2",8),t(40,"Installation"),e(),n(41,"app-code-block",13),e(),i(42,"section",4)(43,"h2",8),t(44,"Built-in Plugins"),e(),i(45,"p",9),t(46,"Leaven provides several ready-to-use plugins:"),e(),i(47,"h3",14),t(48,"Logging Plugin"),e(),n(49,"app-code-block",15),i(50,"h3",14),t(51,"Tracing Plugin"),e(),n(52,"app-code-block",16),i(53,"h3",14),t(54,"Depth Limit Plugin"),e(),n(55,"app-code-block",17),i(56,"h3",14),t(57,"Complexity Plugin"),e(),n(58,"app-code-block",18),e(),i(59,"section",4)(60,"h2",8),t(61,"Plugin Manager"),e(),i(62,"p",9),t(63,"Manage and orchestrate multiple plugins:"),e(),n(64,"app-code-block",19),e(),i(65,"section",4)(66,"h2",8),t(67,"Creating Custom Plugins"),e(),i(68,"p",9),t(69,"Create your own plugins with the createPlugin helper:"),e(),n(70,"app-code-block",20),e(),i(71,"section",4)(72,"h2",8),t(73,"Plugin Hooks"),e(),i(74,"div",21)(75,"table",22)(76,"thead")(77,"tr",23)(78,"th",24),t(79,"Hook"),e(),i(80,"th",25),t(81,"Description"),e()()(),i(82,"tbody",26)(83,"tr",27)(84,"td",28)(85,"code",29),t(86,"beforeParse"),e()(),i(87,"td",30),t(88,"Called before parsing the query string"),e()(),i(89,"tr",27)(90,"td",28)(91,"code",29),t(92,"afterParse"),e()(),i(93,"td",30),t(94,"Called after parsing, receives DocumentNode"),e()(),i(95,"tr",27)(96,"td",28)(97,"code",29),t(98,"beforeValidate"),e()(),i(99,"td",30),t(100,"Called before schema validation"),e()(),i(101,"tr",27)(102,"td",28)(103,"code",29),t(104,"afterValidate"),e()(),i(105,"td",30),t(106,"Called after validation with results"),e()(),i(107,"tr",27)(108,"td",28)(109,"code",29),t(110,"beforeExecute"),e()(),i(111,"td",30),t(112,"Called before resolver execution"),e()(),i(113,"tr",27)(114,"td",28)(115,"code",29),t(116,"afterExecute"),e()(),i(117,"td",30),t(118,"Called after execution with results"),e()(),i(119,"tr")(120,"td",28)(121,"code",29),t(122,"onError"),e()(),i(123,"td",30),t(124,"Called when an error occurs"),e()()()()()(),i(125,"section",4)(126,"h2",8),t(127,"Composing Plugins"),e(),i(128,"p",9),t(129,"Combine multiple plugins into one:"),e(),n(130,"app-code-block",31),e(),i(131,"nav",32)(132,"a",33),m(),i(133,"svg",34),n(134,"path",35),e(),d(),i(135,"div",36)(136,"span",37),t(137,"Previous"),e(),i(138,"span",38),t(139,"Request Context"),e()()(),i(140,"a",39)(141,"div")(142,"span",37),t(143,"Next"),e(),i(144,"span",38),t(145,"Error Handling"),e()(),m(),i(146,"svg",40),n(147,"path",41),e()()()()),a&2&&(r(41),o("code",l.installCode),r(8),o("code",l.loggingCode),r(3),o("code",l.tracingCode),r(3),o("code",l.depthCode),r(3),o("code",l.complexityCode),r(6),o("code",l.managerCode),r(6),o("code",l.customCode),r(60),o("code",l.composeCode))},dependencies:[u,x,h],encapsulation:2})};export{E as PluginsComponent};
