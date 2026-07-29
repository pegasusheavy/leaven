# @leaven-graphql/playground

## 0.2.0

### Minor Changes

- 2d549b9: Escape every value interpolated into the rendered playground HTML

  `renderPlayground` and `renderGraphiQL` interpolated caller-supplied values —
  `title`, the GraphiQL `version`, the endpoint and the initial query/variables —
  straight into the HTML document they return. A value containing markup could
  therefore close the surrounding tag and inject script into the served page.

  Both renderers now route text through `escapeHtml` and embedded JSON through
  `toScriptJson`, so a hostile `title` or endpoint is rendered as text rather
  than markup.

  This shipped in the API reconciliation but was left off that changeset, so
  `@leaven-graphql/playground` would have stayed at 0.1.0 and the fix would never
  have reached npm.
