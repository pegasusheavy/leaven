/**
 * @leaven-graphql/playground - Shared escaping helpers
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Escape HTML special characters for interpolation into markup contexts
 * (element text content and attribute values).
 *
 * @param str - Raw string to escape
 * @returns The string with `&`, `<`, `>`, `"`, and `'` replaced by HTML entities
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Serialize a value as JSON that is safe to interpolate into an inline
 * `<script>` block.
 *
 * `JSON.stringify` alone is not script-context safe: it does not escape
 * `</script>`, `<!--`, or the U+2028/U+2029 line separators, so a value
 * containing `</script><script>...` would close the script block and inject
 * arbitrary markup. This helper post-processes the JSON output, replacing
 * `<`, `>`, `&`, U+2028, and U+2029 with `\uXXXX` escape sequences. These
 * characters can only occur inside JSON string literals, where the escapes
 * decode to the identical characters, so the parsed value is unchanged.
 *
 * Values `JSON.stringify` declines to serialize — `undefined`, functions, and
 * symbols — have no JSON representation. Rather than throwing, they serialize
 * to the literal `undefined`, which is a valid JavaScript expression in the
 * script context this output is interpolated into.
 *
 * @param value - Value to serialize (anything accepted by `JSON.stringify`)
 * @returns Script-context-safe JSON text, or `'undefined'` for values with no
 *   JSON representation
 */
export function toScriptJson(value: unknown): string {
  const json = JSON.stringify(value);

  if (json === undefined) {
    return 'undefined';
  }

  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
