/**
 * @leaven-graphql/http - Request parsing tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import { parseBody, parseQuery, validateRequest } from './request';

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
