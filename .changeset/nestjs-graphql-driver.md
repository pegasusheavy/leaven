---
'@leaven-graphql/nestjs': minor
---

Add `LeavenGraphQLDriver`, a real `@nestjs/graphql` driver backed by Leaven.

`GraphQLModule.forRoot({ driver: LeavenGraphQLDriver })` is now a supported
path, and it is the one on which the NestJS execution pipeline actually runs.
`@nestjs/graphql` builds the schema from your `@Resolver()` classes with
`ExternalContextCreator` wrapped around every field resolver, so `@UseGuards`
(`AuthGuard`, `RolesGuard`, `PermissionsGuard`, `ComplexityGuard`,
`DepthGuard`), `@UseInterceptors` (`LoggingInterceptor`, `MetricsInterceptor`,
…), pipes, filters and parameter decorators (`@Args()`, `@Context()`,
`@Info()`, `@Root()`) all execute; the driver constructs a `LeavenExecutor`
over the finished schema and serves it.

The new `LeavenDriverConfig` extends `GqlModuleOptions` with Leaven's executor
options — `cache`, `metrics`, `maxComplexity`, `maxDepth` — plus `playground`,
`subscriptionEndpoint`, `formatError` and
`includeStacktraceInErrorResponses`. The driver registers a `POST` handler at
the module's normalized path and, when `playground` is enabled, a `GET`
handler rendering GraphiQL.

Errors follow the documented conventions: every error carries an `ErrorCode`
and a total failure derives its HTTP status from it, while a response carrying
`data` alongside `errors` stays `200`. NestJS `HttpException`s raised by guards
and pipes are translated into the equivalent Leaven error, so an
`UnauthorizedException` surfaces as `401 UNAUTHENTICATED` instead of a masked
`500`.

`LeavenModule.forRoot({ typeDefs, resolvers })` is unchanged and still bypasses
the NestJS pipeline; the README now states precisely which path is which, and
documents the `experimentalDecorators` / `emitDecoratorMetadata` tsconfig
requirement that Bun otherwise reports as an opaque
`TypeError: undefined is not an object (evaluating 'descriptor.value')`.
