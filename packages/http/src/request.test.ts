/**
 * @leaven-graphql/http - Request parsing tests
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, afterEach } from 'bun:test';
import { parseBody, parseQuery, validateRequest, type ParsedBody } from './request';

/**
 * Build a graphql-multipart-request-spec POST carrying one file under key `0`
 */
function multipartRequest(
  operations: Record<string, unknown>,
  map: Record<string, string[]>
): Request {
  const formData = new FormData();
  formData.append('operations', JSON.stringify(operations));
  formData.append('map', JSON.stringify(map));
  formData.append('0', new File(['file content'], 'upload.txt', { type: 'text/plain' }));

  return new Request('http://localhost/graphql', {
    method: 'POST',
    body: formData,
  });
}

describe('parseBody', () => {
  test('should parse JSON body', async () => {
    const request = new Request('http://localhost/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ hello }',
        operationName: 'TestQuery',
        variables: { id: '1' },
      }),
    });

    const result = await parseBody(request);

    expect(result.query).toBe('{ hello }');
    expect(result.operationName).toBe('TestQuery');
    expect(result.variables).toEqual({ id: '1' });
  });

  test('should parse application/graphql body', async () => {
    const request = new Request('http://localhost/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/graphql' },
      body: '{ hello }',
    });

    const result = await parseBody(request);

    expect(result.query).toBe('{ hello }');
  });

  test('should parse form body', async () => {
    const formData = new FormData();
    formData.append('query', '{ hello }');
    formData.append('variables', '{"id": "1"}');

    const request = new Request('http://localhost/graphql', {
      method: 'POST',
      body: formData,
    });

    const result = await parseBody(request);

    expect(result.query).toBe('{ hello }');
    expect(result.variables).toEqual({ id: '1' });
  });

  test('should throw for invalid JSON', async () => {
    const request = new Request('http://localhost/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });

    await expect(parseBody(request)).rejects.toThrow(/Invalid JSON/);
  });

  test('should handle empty body', async () => {
    const request = new Request('http://localhost/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '',
    });

    const result = await parseBody(request);

    expect(result).toEqual({});
  });

  test('should parse multipart body with operations', async () => {
    const formData = new FormData();
    formData.append(
      'operations',
      JSON.stringify({
        query: '{ hello }',
        variables: { file: null },
      })
    );
    formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
    formData.append('0', new Blob(['file content'], { type: 'text/plain' }));

    const request = new Request('http://localhost/graphql', {
      method: 'POST',
      body: formData,
    });

    const result = await parseBody(request);

    expect(result.query).toBe('{ hello }');
  });

  test('should map an uploaded file onto the operation variables', async () => {
    const result = await parseBody(
      multipartRequest(
        { query: '{ hello }', variables: { file: null } },
        { '0': ['variables.file'] }
      )
    );

    const file = result.variables?.file;
    expect(file).toBeInstanceOf(Blob);
    expect(await (file as Blob).text()).toBe('file content');
  });

  test('should create missing intermediates along a mapped file path', async () => {
    const result = await parseBody(
      multipartRequest({ query: '{ hello }' }, { '0': ['variables.input.file'] })
    );

    const input = result.variables?.input as Record<string, unknown>;
    expect(await (input.file as Blob).text()).toBe('file content');
  });

  test('should parse application/x-www-form-urlencoded body', async () => {
    const request = new Request('http://localhost/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'query=%7B%20hello%20%7D&operationName=Test&variables=%7B%22id%22%3A%221%22%7D',
    });

    const result = await parseBody(request);

    expect(result.query).toBe('{ hello }');
    expect(result.operationName).toBe('Test');
    expect(result.variables).toEqual({ id: '1' });
  });

  test('should parse multipart body without operations field', async () => {
    const formData = new FormData();
    formData.append('query', '{ users { name } }');
    formData.append('operationName', 'GetUsers');

    const request = new Request('http://localhost/graphql', {
      method: 'POST',
      body: formData,
    });

    const result = await parseBody(request);

    expect(result.query).toBe('{ users { name } }');
    expect(result.operationName).toBe('GetUsers');
  });

  test('should throw for unsupported content type with invalid JSON fallback', async () => {
    const request = new Request('http://localhost/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'not supported',
    });

    // Falls back to JSON parsing, which fails, surfacing the intended message
    await expect(parseBody(request)).rejects.toThrow(/Unsupported content type/);
  });

  test('should fallback to JSON for unknown content type with valid JSON', async () => {
    const request = new Request('http://localhost/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/unknown' },
      body: JSON.stringify({ query: '{ hello }' }),
    });

    const result = await parseBody(request);

    expect(result.query).toBe('{ hello }');
  });
});

describe('multipart file path safety', () => {
  afterEach(() => {
    // A failing guard would poison every object in the process, so make sure
    // one broken assertion cannot cascade into unrelated tests.
    delete (Object.prototype as Record<string, unknown>).polluted;
  });

  /** Read the key an attack would have planted on the shared prototype */
  function prototypeLeak(): unknown {
    return ({} as Record<string, unknown>).polluted;
  }

  test('should not reach Object.prototype through a __proto__ root', async () => {
    await parseBody(
      multipartRequest({ query: '{ hello }' }, { '0': ['__proto__.polluted'] })
    );

    expect(prototypeLeak()).toBeUndefined();
    expect(
      Object.prototype.hasOwnProperty.call(Object.prototype, 'polluted')
    ).toBe(false);
  });

  test('should not reach Object.prototype through a nested __proto__ segment', async () => {
    const result = await parseBody(
      multipartRequest(
        { query: '{ hello }', variables: {} },
        { '0': ['variables.__proto__.polluted'] }
      )
    );

    expect(prototypeLeak()).toBeUndefined();
    expect(result.variables).toEqual({});
  });

  test('should not reach Object.prototype through constructor.prototype', async () => {
    await parseBody(
      multipartRequest(
        { query: '{ hello }', variables: {} },
        { '0': ['variables.constructor.prototype.polluted'] }
      )
    );

    expect(prototypeLeak()).toBeUndefined();
  });

  test('should ignore a path whose root is not a spec-legal target', async () => {
    const result = await parseBody(
      multipartRequest({ query: '{ hello }' }, { '0': ['query'] })
    );

    // The query must survive: a rogue path is dropped, not applied.
    expect(result.query).toBe('{ hello }');
  });
});

describe('parseQuery', () => {
  test('should parse query parameters', () => {
    const url = new URL(
      'http://localhost/graphql?query={ hello }&operationName=Test&variables={"id":"1"}'
    );

    const result = parseQuery(url);

    expect(result.query).toBe('{ hello }');
    expect(result.operationName).toBe('Test');
    expect(result.variables).toEqual({ id: '1' });
  });

  test('should handle missing parameters', () => {
    const url = new URL('http://localhost/graphql');

    const result = parseQuery(url);

    expect(result.query).toBeUndefined();
    expect(result.operationName).toBeUndefined();
    expect(result.variables).toBeUndefined();
  });

  test('should handle invalid JSON in variables', () => {
    const url = new URL('http://localhost/graphql?query={ hello }&variables=notjson');

    const result = parseQuery(url);

    expect(result.query).toBe('{ hello }');
    expect(result.variables).toBeUndefined();
  });
});

describe('validateRequest', () => {
  test('should validate valid request', () => {
    const result = validateRequest(
      { query: '{ hello }' },
      {}
    );

    expect(result.valid).toBe(true);
    expect(result.request?.query).toBe('{ hello }');
  });

  test('should accept a body on its own', () => {
    const body: ParsedBody = { query: '{ hello }', operationName: 'Test' };

    const result = validateRequest(body);

    expect(result.valid).toBe(true);
    expect(result.request?.query).toBe('{ hello }');
    expect(result.request?.operationName).toBe('Test');
  });

  test('should merge body and query params', () => {
    const result = validateRequest(
      { query: '{ hello }', operationName: 'FromBody' },
      { operationName: 'FromQuery', variables: { id: '1' } }
    );

    expect(result.valid).toBe(true);
    expect(result.request?.operationName).toBe('FromBody'); // Body takes precedence
    expect(result.request?.variables).toEqual({ id: '1' });
  });

  test('should use query params when body is empty', () => {
    const result = validateRequest(
      {},
      { query: '{ hello }' }
    );

    expect(result.valid).toBe(true);
    expect(result.request?.query).toBe('{ hello }');
  });

  test('should invalidate when query is missing', () => {
    const result = validateRequest({}, {});

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Query is required');
  });
});
