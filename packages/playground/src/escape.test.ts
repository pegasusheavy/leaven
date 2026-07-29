/**
 * @leaven-graphql/playground - Escaping helper tests
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import { escapeHtml, toScriptJson } from './escape';

describe('escapeHtml', () => {
  test('should escape ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  test('should escape angle brackets', () => {
    expect(escapeHtml('<b>')).toBe('&lt;b&gt;');
  });

  test('should escape double and single quotes', () => {
    expect(escapeHtml(`"'`)).toBe('&quot;&#039;');
  });

  test('should escape ampersands before the entities it introduces', () => {
    // If `&` were escaped last, `&lt;` would become `&amp;lt;`
    expect(escapeHtml('<')).toBe('&lt;');
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  test('should neutralize a script tag', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  test('should neutralize an attribute break-out', () => {
    const escaped = escapeHtml('x" onerror="alert(1)');

    expect(escaped).not.toContain('"');
    expect(escaped).toBe('x&quot; onerror=&quot;alert(1)');
  });

  test('should leave strings without special characters unchanged', () => {
    expect(escapeHtml('Leaven GraphiQL 3.0.10')).toBe('Leaven GraphiQL 3.0.10');
  });

  test('should return an empty string unchanged', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('toScriptJson', () => {
  test('should escape < and > so a script block cannot be closed', () => {
    const json = toScriptJson('</script><script>alert(1)</script>');

    expect(json).not.toContain('</script>');
    expect(json).not.toContain('<');
    expect(json).not.toContain('>');
    expect(json).toContain('\\u003c/script\\u003e');
  });

  test('should escape < so an HTML comment cannot be opened', () => {
    const json = toScriptJson('<!--');

    expect(json).not.toContain('<!--');
    expect(json).toContain('\\u003c!--');
  });

  test('should escape ampersands', () => {
    const json = toScriptJson('a & b');

    expect(json).not.toContain('&');
    expect(json).toContain('\\u0026');
  });

  test('should escape U+2028 and U+2029 line separators', () => {
    // JSON.stringify leaves these raw, but they terminate a JavaScript line
    const json = toScriptJson('a\u2028b\u2029c');

    expect(json).not.toContain('\u2028');
    expect(json).not.toContain('\u2029');
    expect(json).toContain('\\u2028');
    expect(json).toContain('\\u2029');
  });

  test('should escape every character it claims to escape', () => {
    const json = toScriptJson('<>&\u2028\u2029');

    expect(json).toBe('"\\u003c\\u003e\\u0026\\u2028\\u2029"');
  });

  test('should round-trip strings unchanged', () => {
    // The escapes only ever occur inside JSON string literals, where they
    // decode to the identical characters, so parsing must recover the input
    const value = '</script><!-- & < > \u2028 \u2029 "quoted" \\ backslash';

    expect(JSON.parse(toScriptJson(value))).toBe(value);
  });

  test('should round-trip objects unchanged', () => {
    const value = {
      'X-Custom-Header': '</script>',
      nested: { list: [1, '<a>', true, null], sep: '\u2028' },
      amp: '&&&',
    };

    expect(JSON.parse(toScriptJson(value))).toEqual(value);
  });

  test('should round-trip a key containing escaped characters', () => {
    // Escapes inside JSON *keys* must decode identically too
    const value = { '<&>': 'ok' };

    expect(JSON.parse(toScriptJson(value))).toEqual(value);
  });

  test('should emit parseable JSON for values with no special characters', () => {
    expect(toScriptJson('/graphql')).toBe('"/graphql"');
    expect(toScriptJson(42)).toBe('42');
    expect(toScriptJson(null)).toBe('null');
    expect(toScriptJson({})).toBe('{}');
  });

  test('should serialize undefined to the literal undefined', () => {
    expect(toScriptJson(undefined)).toBe('undefined');
  });

  test('should serialize other unserializable values to the literal undefined', () => {
    expect(toScriptJson(() => undefined)).toBe('undefined');
    expect(toScriptJson(Symbol('s'))).toBe('undefined');
  });

  test('should emit output that evaluates as a JavaScript expression', () => {
    const script = `const value = ${toScriptJson('</script>\u2028&')}; return value;`;

    expect(() => new Function(script)).not.toThrow();
    expect(new Function(script)()).toBe('</script>\u2028&');
  });

  test('should emit output that evaluates when the value is undefined', () => {
    const script = `const value = ${toScriptJson(undefined)}; return value;`;

    expect(() => new Function(script)).not.toThrow();
    expect(new Function(script)()).toBeUndefined();
  });
});
