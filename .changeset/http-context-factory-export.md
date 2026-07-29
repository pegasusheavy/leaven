---
'@leaven-graphql/http': minor
'@leaven-graphql/leaven': minor
---

Export `ContextFactory` from `@leaven-graphql/http`

`HandlerConfig.context` is typed as `ContextFactory<TContext>`, but the type
itself was never exported, so callers could not name it to write a typed
context factory against the public config.

Because `@leaven-graphql/context` already exports a different type under the
same name (`ContextFactory<TInput, TContext>`, which builds a context from an
arbitrary input rather than from a request), the umbrella `leaven` package
resolves the collision explicitly: `ContextFactory` there continues to mean the
context package's type, and the HTTP one is re-exported as
`HttpContextFactory`.
