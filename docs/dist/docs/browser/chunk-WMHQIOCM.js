import{a as f}from"./chunk-SQ3LWRKC.js";import{a as h}from"./chunk-VABBLMJJ.js";import{C as i,D as r,E as e,F as n,S as t,Z as u,ga as x,j as d,k as c,r as o,s as p,t as E}from"./chunk-SPTROXX7.js";var v=class m{constructor(s){this.seoService=s}ngOnInit(){this.seoService.updatePageSEO({title:"Error Handling",description:"Handle and format GraphQL errors with @leaven-graphql/errors. Custom error types, error masking, and production-safe responses.",keywords:["GraphQL errors","error handling","error formatting","error masking","Leaven"],canonical:"/errors",ogType:"article"})}installCode="bun add @leaven-graphql/errors";typesCode=`import {
  LeavenError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ComplexityError,
  DepthLimitError,
  InputError,
} from '@leaven-graphql/errors';

// Base error with custom code
throw new LeavenError('Something went wrong', {
  code: 'CUSTOM_ERROR',
  statusCode: 500,
});

// Authentication required
throw new AuthenticationError('Please log in to continue');

// Permission denied
throw new AuthorizationError('You do not have permission');

// Resource not found
throw new NotFoundError('User not found', { resource: 'User', id: '123' });

// Input validation failed
throw new ValidationError('Invalid email format', {
  field: 'email',
  value: 'invalid-email',
});`;resolverCode=`import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from '@leaven-graphql/errors';

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError('Authentication required');
      }
      return context.user;
    },

    user: async (_, { id }, context) => {
      const user = await context.db.users.findById(id);
      if (!user) {
        throw new NotFoundError(\`User \${id} not found\`);
      }
      return user;
    },
  },

  Mutation: {
    deleteUser: async (_, { id }, context) => {
      if (context.user.role !== 'admin') {
        throw new AuthorizationError('Admin access required');
      }
      return context.db.users.delete(id);
    },

    createUser: async (_, { input }, context) => {
      if (!isValidEmail(input.email)) {
        throw new ValidationError('Invalid email format', {
          field: 'email',
          value: input.email,
        });
      }
      return context.db.users.create(input);
    },
  },
};`;formatCode=`import { formatError, formatErrors, errorToGraphQL } from '@leaven-graphql/errors';

// Format a single error
const formatted = formatError(error, {
  includeStackTrace: false,
  includeExtensions: true,
});

// Result:
// {
//   message: "User not found",
//   extensions: {
//     code: "NOT_FOUND",
//     resource: "User",
//     id: "123"
//   }
// }

// Format multiple errors
const formattedErrors = formatErrors(errors, options);

// Convert to GraphQL error format
const graphqlError = errorToGraphQL(error);`;maskCode=`import { maskError, formatError } from '@leaven-graphql/errors';

// Mask internal errors in production
const maskedError = maskError(error, {
  maskMessage: 'An unexpected error occurred',
  maskInternalErrors: true,
  allowedCodes: ['BAD_USER_INPUT', 'UNAUTHENTICATED', 'FORBIDDEN'],
});

// Configure with HTTP server
const server = createServer({
  schema,
  errorFormatting: {
    maskErrors: process.env.NODE_ENV === 'production',
    includeStackTrace: process.env.NODE_ENV !== 'production',
    formatError: (error) => {
      // Custom formatting logic
      return formatError(error, {
        includeStackTrace: false,
        includeExtensions: true,
      });
    },
  },
});`;integrationCode=`import { createServer } from '@leaven-graphql/http';
import { formatError, maskError, isLeavenError } from '@leaven-graphql/errors';

const server = createServer({
  schema,

  // Error formatting configuration
  errorFormatting: {
    maskErrors: process.env.NODE_ENV === 'production',

    // Custom error formatter
    formatError: (error) => {
      // Log all errors
      console.error('GraphQL Error:', error);

      // Mask in production
      if (process.env.NODE_ENV === 'production') {
        // Keep Leaven errors visible (they're safe)
        if (isLeavenError(error)) {
          return formatError(error);
        }
        // Mask other errors
        return maskError(error);
      }

      // Include stack trace in development
      return formatError(error, {
        includeStackTrace: true,
      });
    },
  },
});

server.start();`;static \u0275fac=function(l){return new(l||m)(p(f))};static \u0275cmp=E({type:m,selectors:[["app-errors"]],decls:169,vars:6,consts:[["itemscope","","itemtype","https://schema.org/TechArticle",1,"px-6","py-12","lg:py-16","max-w-4xl","mx-auto"],["aria-label","Breadcrumb",1,"flex","items-center","gap-2","text-sm","text-zinc-500","mb-8"],["routerLink","/",1,"hover:text-white","transition-colors"],[1,"text-zinc-300"],[1,"mb-12"],[1,"inline-flex","items-center","gap-2","px-3","py-1","rounded-full","bg-red-500/10","border","border-red-500/20","text-red-400","text-xs","font-medium","mb-4"],["itemprop","headline",1,"text-4xl","md:text-5xl","font-bold","text-white","mb-4"],["itemprop","description",1,"text-xl","text-zinc-400"],[1,"text-2xl","font-semibold","text-white","mb-4"],[1,"text-zinc-400","mb-4"],[1,"text-red-400"],[1,"card","p-6"],[1,"space-y-2","text-zinc-300"],[1,"text-white"],["title","terminal",3,"code"],["title","error-types.ts",3,"code"],["title","resolvers.ts",3,"code"],["title","format.ts",3,"code"],["title","masking.ts",3,"code"],[1,"overflow-x-auto"],[1,"w-full","text-left"],[1,"border-b","border-zinc-800"],[1,"py-3","pr-4","text-zinc-300","font-semibold"],[1,"py-3","text-zinc-300","font-semibold"],[1,"text-zinc-400"],[1,"border-b","border-zinc-800/50"],[1,"py-3","pr-4"],[1,"py-3"],["title","server.ts",3,"code"],[1,"flex","items-center","justify-between","pt-8","border-t","border-zinc-800"],["routerLink","/plugins",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:-translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M11 17l-5-5m0 0l5-5m-5 5h12"],[1,"text-right"],[1,"text-xs","text-zinc-500","block"],[1,"font-medium"],["routerLink","/http",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors","text-right"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M13 7l5 5m0 0l-5 5m5-5H6"]],template:function(l,a){l&1&&(r(0,"article",0)(1,"nav",1)(2,"a",2),t(3,"Home"),e(),r(4,"span"),t(5,"/"),e(),r(6,"span",3),t(7,"Error Handling"),e()(),r(8,"header",4)(9,"div",5),t(10," \u{1F6A8} Core Package "),e(),r(11,"h1",6),t(12,"Error Handling"),e(),r(13,"p",7),t(14," Handle and format GraphQL errors with @leaven/errors. Custom error types, masking, and production-safe responses. "),e()(),r(15,"section",4)(16,"h2",8),t(17,"Overview"),e(),r(18,"p",9),t(19," The "),r(20,"code",10),t(21,"@leaven/errors"),e(),t(22," package provides a comprehensive error handling system with custom error types, formatting, and masking for production safety. "),e(),r(23,"div",11)(24,"ul",12)(25,"li")(26,"strong",13),t(27,"Custom Error Types"),e(),t(28," - Authentication, authorization, validation, etc."),e(),r(29,"li")(30,"strong",13),t(31,"Error Codes"),e(),t(32," - Standardized error codes for client handling"),e(),r(33,"li")(34,"strong",13),t(35,"Error Masking"),e(),t(36," - Hide internal details in production"),e(),r(37,"li")(38,"strong",13),t(39,"Error Formatting"),e(),t(40," - Consistent error response format"),e()()()(),r(41,"section",4)(42,"h2",8),t(43,"Installation"),e(),n(44,"app-code-block",14),e(),r(45,"section",4)(46,"h2",8),t(47,"Error Types"),e(),r(48,"p",9),t(49,"Leaven provides several built-in error types:"),e(),n(50,"app-code-block",15),e(),r(51,"section",4)(52,"h2",8),t(53,"Using Errors in Resolvers"),e(),r(54,"p",9),t(55,"Throw custom errors in your resolvers:"),e(),n(56,"app-code-block",16),e(),r(57,"section",4)(58,"h2",8),t(59,"Error Formatting"),e(),r(60,"p",9),t(61,"Format errors for GraphQL responses:"),e(),n(62,"app-code-block",17),e(),r(63,"section",4)(64,"h2",8),t(65,"Error Masking"),e(),r(66,"p",9),t(67,"Mask internal error details in production:"),e(),n(68,"app-code-block",18),e(),r(69,"section",4)(70,"h2",8),t(71,"Error Codes"),e(),r(72,"div",19)(73,"table",20)(74,"thead")(75,"tr",21)(76,"th",22),t(77,"Error Type"),e(),r(78,"th",22),t(79,"Code"),e(),r(80,"th",23),t(81,"HTTP Status"),e()()(),r(82,"tbody",24)(83,"tr",25)(84,"td",26)(85,"code",10),t(86,"ValidationError"),e()(),r(87,"td",26)(88,"code"),t(89,"BAD_USER_INPUT"),e()(),r(90,"td",27),t(91,"400"),e()(),r(92,"tr",25)(93,"td",26)(94,"code",10),t(95,"AuthenticationError"),e()(),r(96,"td",26)(97,"code"),t(98,"UNAUTHENTICATED"),e()(),r(99,"td",27),t(100,"401"),e()(),r(101,"tr",25)(102,"td",26)(103,"code",10),t(104,"AuthorizationError"),e()(),r(105,"td",26)(106,"code"),t(107,"FORBIDDEN"),e()(),r(108,"td",27),t(109,"403"),e()(),r(110,"tr",25)(111,"td",26)(112,"code",10),t(113,"NotFoundError"),e()(),r(114,"td",26)(115,"code"),t(116,"NOT_FOUND"),e()(),r(117,"td",27),t(118,"404"),e()(),r(119,"tr",25)(120,"td",26)(121,"code",10),t(122,"RateLimitError"),e()(),r(123,"td",26)(124,"code"),t(125,"RATE_LIMITED"),e()(),r(126,"td",27),t(127,"429"),e()(),r(128,"tr",25)(129,"td",26)(130,"code",10),t(131,"ComplexityError"),e()(),r(132,"td",26)(133,"code"),t(134,"COMPLEXITY_EXCEEDED"),e()(),r(135,"td",27),t(136,"400"),e()(),r(137,"tr")(138,"td",26)(139,"code",10),t(140,"DepthLimitError"),e()(),r(141,"td",26)(142,"code"),t(143,"DEPTH_EXCEEDED"),e()(),r(144,"td",27),t(145,"400"),e()()()()()(),r(146,"section",4)(147,"h2",8),t(148,"Integration with HTTP"),e(),r(149,"p",9),t(150,"Configure error handling with @leaven/http:"),e(),n(151,"app-code-block",28),e(),r(152,"nav",29)(153,"a",30),d(),r(154,"svg",31),n(155,"path",32),e(),c(),r(156,"div",33)(157,"span",34),t(158,"Previous"),e(),r(159,"span",35),t(160,"Plugin System"),e()()(),r(161,"a",36)(162,"div")(163,"span",34),t(164,"Next"),e(),r(165,"span",35),t(166,"HTTP Server"),e()(),d(),r(167,"svg",37),n(168,"path",38),e()()()()),l&2&&(o(44),i("code",a.installCode),o(6),i("code",a.typesCode),o(6),i("code",a.resolverCode),o(6),i("code",a.formatCode),o(6),i("code",a.maskCode),o(83),i("code",a.integrationCode))},dependencies:[u,x,h],encapsulation:2})};export{v as ErrorsComponent};
