---
'@leaven-graphql/core': minor
---

Add `ExecutorConfig.formatExecutionError`, a hook that serializes execution and
subscription errors while the graphql-js `GraphQLError` is still intact.

The executor otherwise reports these errors as `error.toJSON()`, which drops
`originalError`. A transport built on a framework with its own error currency
therefore had no way to recognise, say, a NestJS `HttpException` thrown by a
guard: it carries no `extensions` for graphql-js to adopt, so the error reached
the client codeless and was treated as an `INTERNAL_ERROR` 500. The hook runs
before `toJSON()`, so `originalError` is available and can be mapped to an
`ErrorCode`.

It is applied to the errors of an execution result and of a subscription (both
the pre-stream error result and each streamed payload), and deliberately not to
parse/validation/complexity rejections or to errors thrown out of the executor,
which Leaven already codes. Behaviour is unchanged when the hook is absent.

This is distinct from the transports' response-level `formatError` option, which
runs last over an already-serialized `GraphQLFormattedError`.
