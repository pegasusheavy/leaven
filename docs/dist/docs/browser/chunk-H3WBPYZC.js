import{a as p}from"./chunk-VABBLMJJ.js";import{C as r,D as n,E as e,F as i,S as t,Z as x,ga as u,j as c,k as m,r as o,t as d}from"./chunk-SPTROXX7.js";var h=class s{basicUsage=`import { LeavenExecutor } from '@leaven-graphql/core';
import { schema } from './schema';

const executor = new LeavenExecutor({
  schema,
  cache: true,
});

// Execute a query
const result = await executor.execute({
  query: '{ hello }',
});

console.log(result.response.data);
// { hello: "Hello, world!" }`;configCode=`interface ExecutorConfig {
  schema: GraphQLSchema;      // Your GraphQL schema
  rootValue?: unknown;        // Root resolver value
  cache?: DocumentCacheConfig | boolean;
  compilerOptions?: CompilerOptions;
  maxComplexity?: number;     // Query complexity limit
  hooks?: ExecutionHooks;     // Lifecycle hooks
  metrics?: boolean;          // Enable execution metrics
}`;cachingCode=`const executor = new LeavenExecutor({
  schema,
  cache: {
    maxSize: 1000,      // Max cached documents
    ttl: 3600000,       // 1 hour TTL
  },
});

// Check cache stats
const stats = executor.getCacheStats();
console.log(stats);
// { document: { size: 42, hits: 156, ... }, compiled: { size: 12 } }`;hooksCode=`const executor = new LeavenExecutor({
  schema,
  hooks: {
    onParse(query) {
      console.log('Parsing:', query);
    },
    onValidated(result) {
      if (!result.valid) {
        console.error('Validation errors:', result.errors);
      }
    },
    async onExecute(context, document) {
      // Pre-execution logic
    },
    async onExecuted(result) {
      console.log('Completed with data:', result.data);
    },
    onError(error) {
      console.error('Execution error:', error);
    },
  },
});`;metricsCode=`const executor = new LeavenExecutor({
  schema,
  metrics: true,
});

const result = await executor.execute({ query: '{ users { name } }' });

console.log(result.metrics);
// {
//   timing: { parseTime: 0.5, validationTime: 1.2, executionTime: 3.8, totalTime: 5.5 },
//   documentCached: true,
//   queryCached: false,
//   resolverCount: 5
// }`;static \u0275fac=function(l){return new(l||s)};static \u0275cmp=d({type:s,selectors:[["app-executor"]],decls:96,vars:5,consts:[[1,"px-6","py-12","lg:py-16","max-w-4xl","mx-auto"],[1,"flex","items-center","gap-2","text-sm","text-zinc-500","mb-8"],["routerLink","/",1,"hover:text-white","transition-colors"],["routerLink","/docs/quick-start",1,"hover:text-white","transition-colors"],[1,"text-zinc-300"],[1,"mb-12"],[1,"inline-flex","items-center","gap-2","px-3","py-1","rounded-full","bg-amber-500/10","border","border-amber-500/20","text-amber-400","text-xs","font-medium","mb-4"],[1,"text-4xl","md:text-5xl","font-bold","text-white","mb-4"],[1,"text-xl","text-zinc-400"],[1,"text-2xl","font-semibold","text-white","mb-4"],[1,"text-zinc-400","mb-4"],[1,"text-amber-400"],[1,"card","p-6"],[1,"space-y-2","text-zinc-300"],[1,"text-white"],["title","executor-example.ts",3,"code"],["title","types.ts",3,"code"],["title","caching.ts",3,"code"],["title","hooks.ts",3,"code"],["title","metrics.ts",3,"code"],[1,"flex","items-center","justify-between","pt-8","border-t","border-zinc-800"],["routerLink","/docs/installation",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:-translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M11 17l-5-5m0 0l5-5m-5 5h12"],[1,"text-right"],[1,"text-xs","text-zinc-500","block"],[1,"font-medium"],["routerLink","/docs/schema",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors","text-right"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M13 7l5 5m0 0l-5 5m5-5H6"]],template:function(l,a){l&1&&(n(0,"article",0)(1,"nav",1)(2,"a",2),t(3,"Home"),e(),n(4,"span"),t(5,"/"),e(),n(6,"a",3),t(7,"Docs"),e(),n(8,"span"),t(9,"/"),e(),n(10,"span",4),t(11,"Executor"),e()(),n(12,"header",5)(13,"div",6),t(14," \u{1F48E} Core "),e(),n(15,"h1",7),t(16,"Executor"),e(),n(17,"p",8),t(18,"The LeavenExecutor is the heart of the execution engine."),e()(),n(19,"section",5)(20,"h2",9),t(21,"Overview"),e(),n(22,"p",10),t(23,"The "),n(24,"code",11),t(25,"LeavenExecutor"),e(),t(26," handles the complete GraphQL request lifecycle:"),e(),n(27,"div",12)(28,"ul",13)(29,"li")(30,"strong",14),t(31,"Parsing"),e(),t(32," - Parse GraphQL query strings into document ASTs"),e(),n(33,"li")(34,"strong",14),t(35,"Validation"),e(),t(36," - Validate documents against your schema"),e(),n(37,"li")(38,"strong",14),t(39,"Compilation"),e(),t(40," - Compile queries for efficient execution"),e(),n(41,"li")(42,"strong",14),t(43,"Execution"),e(),t(44," - Execute queries and resolve fields"),e(),n(45,"li")(46,"strong",14),t(47,"Caching"),e(),t(48," - Cache parsed documents and compiled queries"),e()()()(),n(49,"section",5)(50,"h2",9),t(51,"Basic Usage"),e(),n(52,"p",10),t(53,"Create an executor with your schema:"),e(),i(54,"app-code-block",15),e(),n(55,"section",5)(56,"h2",9),t(57,"Configuration Options"),e(),n(58,"p",10),t(59,"The executor accepts several configuration options:"),e(),i(60,"app-code-block",16),e(),n(61,"section",5)(62,"h2",9),t(63,"Document Caching"),e(),n(64,"p",10),t(65,"Enable caching to reuse parsed documents and compiled queries:"),e(),i(66,"app-code-block",17),e(),n(67,"section",5)(68,"h2",9),t(69,"Lifecycle Hooks"),e(),n(70,"p",10),t(71,"Add hooks to intercept execution at various stages:"),e(),i(72,"app-code-block",18),e(),n(73,"section",5)(74,"h2",9),t(75,"Execution Metrics"),e(),n(76,"p",10),t(77,"Enable metrics to track performance:"),e(),i(78,"app-code-block",19),e(),n(79,"nav",20)(80,"a",21),c(),n(81,"svg",22),i(82,"path",23),e(),m(),n(83,"div",24)(84,"span",25),t(85,"Previous"),e(),n(86,"span",26),t(87,"Installation"),e()()(),n(88,"a",27)(89,"div")(90,"span",25),t(91,"Next"),e(),n(92,"span",26),t(93,"Schema Building"),e()(),c(),n(94,"svg",28),i(95,"path",29),e()()()()),l&2&&(o(54),r("code",a.basicUsage),o(6),r("code",a.configCode),o(6),r("code",a.cachingCode),o(6),r("code",a.hooksCode),o(6),r("code",a.metricsCode))},dependencies:[x,u,p],encapsulation:2})};export{h as ExecutorComponent};
