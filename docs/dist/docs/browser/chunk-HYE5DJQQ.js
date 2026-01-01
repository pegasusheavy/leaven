import{a as S}from"./chunk-SQ3LWRKC.js";import{a as g}from"./chunk-VABBLMJJ.js";import{C as a,D as i,E as e,F as r,S as t,Z as u,ga as x,j as s,k as c,r as n,s as p,t as h}from"./chunk-SPTROXX7.js";var v=class m{constructor(d){this.seoService=d}ngOnInit(){this.seoService.updatePageSEO({title:"Schema Building",description:"Build, merge, and manage GraphQL schemas with @leaven-graphql/schema. Fluent API, file loading, and custom directives.",keywords:["GraphQL schema","schema building","type definitions","schema merging","Leaven"],canonical:"/schema",ogType:"article"})}installCode="bun add @leaven-graphql/schema graphql";builderCode=`import { SchemaBuilder } from '@leaven-graphql/schema';

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
const schema = builder.build();`;mergeCode=`import { mergeSchemas, mergeSchemasFromStrings } from '@leaven-graphql/schema';

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
]);`;resolversCode=`import { createResolvers, mergeResolvers } from '@leaven-graphql/schema';

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
const resolvers = mergeResolvers([userResolvers, postResolvers]);`;loaderCode=`import {
  loadSchemaFromFile,
  loadSchemaFromDirectory,
  loadSchemaFromGlob
} from '@leaven-graphql/schema';

// Load a single file
const schema1 = await loadSchemaFromFile('./schema.graphql');

// Load all files in a directory
const schema2 = await loadSchemaFromDirectory('./schemas');

// Load files matching a glob pattern
const schema3 = await loadSchemaFromGlob('./modules/**/*.graphql');`;directivesCode=`import { createDirective, applyDirectives } from '@leaven-graphql/schema';

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
]);`;static \u0275fac=function(l){return new(l||m)(p(S))};static \u0275cmp=h({type:m,selectors:[["app-schema"]],decls:144,vars:6,consts:[["itemscope","","itemtype","https://schema.org/TechArticle",1,"px-6","py-12","lg:py-16","max-w-4xl","mx-auto"],["aria-label","Breadcrumb",1,"flex","items-center","gap-2","text-sm","text-zinc-500","mb-8"],["routerLink","/",1,"hover:text-white","transition-colors"],[1,"text-zinc-300"],[1,"mb-12"],[1,"inline-flex","items-center","gap-2","px-3","py-1","rounded-full","bg-amber-500/10","border","border-amber-500/20","text-amber-400","text-xs","font-medium","mb-4"],["itemprop","headline",1,"text-4xl","md:text-5xl","font-bold","text-white","mb-4"],["itemprop","description",1,"text-xl","text-zinc-400"],[1,"text-2xl","font-semibold","text-white","mb-4"],[1,"text-zinc-400","mb-4"],[1,"text-amber-400"],[1,"card","p-6"],[1,"space-y-2","text-zinc-300"],[1,"text-white"],["title","terminal",3,"code"],["title","schema.ts",3,"code"],["title","merge.ts",3,"code"],["title","resolvers.ts",3,"code"],["title","loader.ts",3,"code"],["title","directives.ts",3,"code"],[1,"overflow-x-auto"],[1,"w-full","text-left"],[1,"border-b","border-zinc-800"],[1,"py-3","pr-4","text-zinc-300","font-semibold"],[1,"py-3","text-zinc-300","font-semibold"],[1,"text-zinc-400"],[1,"border-b","border-zinc-800/50"],[1,"py-3","pr-4"],[1,"py-3"],[1,"flex","items-center","justify-between","pt-8","border-t","border-zinc-800"],["routerLink","/executor",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:-translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M11 17l-5-5m0 0l5-5m-5 5h12"],[1,"text-right"],[1,"text-xs","text-zinc-500","block"],[1,"font-medium"],["routerLink","/context",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors","text-right"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M13 7l5 5m0 0l-5 5m5-5H6"]],template:function(l,o){l&1&&(i(0,"article",0)(1,"nav",1)(2,"a",2),t(3,"Home"),e(),i(4,"span"),t(5,"/"),e(),i(6,"span",3),t(7,"Schema Building"),e()(),i(8,"header",4)(9,"div",5),t(10," \u{1F3D7}\uFE0F Core Package "),e(),i(11,"h1",6),t(12,"Schema Building"),e(),i(13,"p",7),t(14," Build, merge, and manage GraphQL schemas with @leaven/schema. "),e()(),i(15,"section",4)(16,"h2",8),t(17,"Overview"),e(),i(18,"p",9),t(19," The "),i(20,"code",10),t(21,"@leaven/schema"),e(),t(22," package provides utilities for building GraphQL schemas programmatically. It supports both code-first and SDL-first approaches. "),e(),i(23,"div",11)(24,"ul",12)(25,"li")(26,"strong",13),t(27,"SchemaBuilder"),e(),t(28," - Fluent API for building schemas"),e(),i(29,"li")(30,"strong",13),t(31,"Schema Merging"),e(),t(32," - Combine multiple schemas seamlessly"),e(),i(33,"li")(34,"strong",13),t(35,"Resolvers"),e(),t(36," - Type-safe resolver creation"),e(),i(37,"li")(38,"strong",13),t(39,"Directives"),e(),t(40," - Custom directive support"),e(),i(41,"li")(42,"strong",13),t(43,"File Loaders"),e(),t(44," - Load schemas from .graphql files"),e()()()(),i(45,"section",4)(46,"h2",8),t(47,"Installation"),e(),r(48,"app-code-block",14),e(),i(49,"section",4)(50,"h2",8),t(51,"Schema Builder"),e(),i(52,"p",9),t(53,"Use the fluent API to build schemas programmatically:"),e(),r(54,"app-code-block",15),e(),i(55,"section",4)(56,"h2",8),t(57,"Merging Schemas"),e(),i(58,"p",9),t(59,"Combine multiple schemas with automatic type merging:"),e(),r(60,"app-code-block",16),e(),i(61,"section",4)(62,"h2",8),t(63,"Creating Resolvers"),e(),i(64,"p",9),t(65,"Create type-safe resolvers with helper functions:"),e(),r(66,"app-code-block",17),e(),i(67,"section",4)(68,"h2",8),t(69,"Loading from Files"),e(),i(70,"p",9),t(71,"Load schemas from .graphql files:"),e(),r(72,"app-code-block",18),e(),i(73,"section",4)(74,"h2",8),t(75,"Custom Directives"),e(),i(76,"p",9),t(77,"Add custom directives to your schema:"),e(),r(78,"app-code-block",19),e(),i(79,"section",4)(80,"h2",8),t(81,"API Reference"),e(),i(82,"div",20)(83,"table",21)(84,"thead")(85,"tr",22)(86,"th",23),t(87,"Export"),e(),i(88,"th",24),t(89,"Description"),e()()(),i(90,"tbody",25)(91,"tr",26)(92,"td",27)(93,"code",10),t(94,"SchemaBuilder"),e()(),i(95,"td",28),t(96,"Fluent API for building schemas"),e()(),i(97,"tr",26)(98,"td",27)(99,"code",10),t(100,"mergeSchemas"),e()(),i(101,"td",28),t(102,"Merge multiple GraphQL schemas"),e()(),i(103,"tr",26)(104,"td",27)(105,"code",10),t(106,"createResolvers"),e()(),i(107,"td",28),t(108,"Create type-safe resolver objects"),e()(),i(109,"tr",26)(110,"td",27)(111,"code",10),t(112,"loadSchemaFromFile"),e()(),i(113,"td",28),t(114,"Load schema from a single file"),e()(),i(115,"tr",26)(116,"td",27)(117,"code",10),t(118,"loadSchemaFromGlob"),e()(),i(119,"td",28),t(120,"Load schemas matching a glob pattern"),e()(),i(121,"tr")(122,"td",27)(123,"code",10),t(124,"createDirective"),e()(),i(125,"td",28),t(126,"Create a custom schema directive"),e()()()()()(),i(127,"nav",29)(128,"a",30),s(),i(129,"svg",31),r(130,"path",32),e(),c(),i(131,"div",33)(132,"span",34),t(133,"Previous"),e(),i(134,"span",35),t(135,"Executor"),e()()(),i(136,"a",36)(137,"div")(138,"span",34),t(139,"Next"),e(),i(140,"span",35),t(141,"Request Context"),e()(),s(),i(142,"svg",37),r(143,"path",38),e()()()()),l&2&&(n(48),a("code",o.installCode),n(6),a("code",o.builderCode),n(6),a("code",o.mergeCode),n(6),a("code",o.resolversCode),n(6),a("code",o.loaderCode),n(6),a("code",o.directivesCode))},dependencies:[u,x,g],encapsulation:2})};export{v as SchemaComponent};
