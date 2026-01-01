/**
 * @leaven-graphql/http - Response utilities tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import {
  buildResponse,
  sendResponse,
  corsHeaders,
  buildErrorResponse,
  methodNotAllowed,
  preflightResponse,
} from './response';

describe('corsHeaders', () => {
  test('should return default CORS headers', () => {
    const request = new Request('http://localhost/graphql', {
      headers: { Origin: 'http://example.com' },
    });

    const headers = corsHeaders(request);

    expect(headers['Access-Control-Allow-Origin']).toBe('*');
    expect(headers['Access-Control-Allow-Methods']).toBe('GET, POST, OPTIONS');
    expect(headers['Access-Control-Allow-Headers']).toBe(
      'Content-Type, Authorization'
    );
  });

  test('should use specific origin when configured', () => {
    const request = new Request('http://localhost/graphql', {
      headers: { Origin: 'http://example.com' },
    });

    const headers = corsHeaders(request, {
      origin: 'http://allowed.com',
    });

    expect(headers['Access-Control-Allow-Origin']).toBe('http://allowed.com');
  });

  test('should match origin from array', () => {
    const request = new Request('http://localhost/graphql', {
      headers: { Origin: 'http://example.com' },
    });

    const headers = corsHeaders(request, {
      origin: ['http://example.com', 'http://other.com'],
    });

    expect(headers['Access-Control-Allow-Origin']).toBe('http://example.com');
  });

  test('should use origin function', () => {
    const request = new Request('http://localhost/graphql', {
      headers: { Origin: 'http://example.com' },
    });

    const headers = corsHeaders(request, {
      origin: (origin) => origin.endsWith('.com'),
    });

    expect(headers['Access-Control-Allow-Origin']).toBe('http://example.com');
  });

  test('should include credentials header', () => {
    const request = new Request('http://localhost/graphql');

    const headers = corsHeaders(request, { credentials: true });

    expect(headers['Access-Control-Allow-Credentials']).toBe('true');
  });

  test('should include max age', () => {
    const request = new Request('http://localhost/graphql');

    const headers = corsHeaders(request, { maxAge: 3600 });

    expect(headers['Access-Control-Max-Age']).toBe('3600');
  });

  test('should include exposed headers', () => {
    const request = new Request('http://localhost/graphql');

    const headers = corsHeaders(request, {
      exposedHeaders: ['X-Custom-Header'],
    });

    expect(headers['Access-Control-Expose-Headers']).toBe('X-Custom-Header');
  });
});

describe('buildResponse', () => {
  test('should build response with data', async () => {
    const response = buildResponse({
      data: { hello: 'world' },
    });

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toEqual({ hello: 'world' });
  });

  test('should include errors', async () => {
    const response = buildResponse({
      data: null,
      errors: [{ message: 'Error occurred' }],
    });

    const body = await response.json();
    expect(body.errors[0].message).toBe('Error occurred');
  });

  test('should set status based on error code', async () => {
    const response = buildResponse({
      errors: [{ message: 'Unauthorized', extensions: { code: 'UNAUTHENTICATED' } }],
    });

    expect(response.status).toBe(401);
  });

  test('should use custom status', async () => {
    const response = buildResponse(
      { data: { hello: 'world' } },
      { status: 201 }
    );

    expect(response.status).toBe(201);
  });

  test('should include custom headers', () => {
    const response = buildResponse(
      { data: {} },
      { headers: { 'X-Custom': 'value' } }
    );

    expect(response.headers.get('X-Custom')).toBe('value');
  });

  test('should pretty print when enabled', async () => {
    const response = buildResponse(
      { data: { hello: 'world' } },
      { pretty: true }
    );

    const text = await response.text();
    expect(text).toContain('\n');
  });

  test('should set correct status for various error codes', () => {
    const testCases: Array<{ code: string; status: number }> = [
      { code: 'UNAUTHENTICATED', status: 401 },
      { code: 'FORBIDDEN', status: 403 },
      { code: 'NOT_FOUND', status: 404 },
      { code: 'BAD_REQUEST', status: 400 },
      { code: 'VALIDATION_ERROR', status: 400 },
      { code: 'RATE_LIMITED', status: 429 },
      { code: 'INTERNAL_ERROR', status: 500 },
    ];

    for (const { code, status } of testCases) {
      const response = buildResponse({
        errors: [{ message: 'Error', extensions: { code } }],
      });
      expect(response.status).toBe(status);
    }
  });
});

describe('sendResponse', () => {
  test('should be alias for buildResponse', async () => {
    const response = sendResponse({ data: { test: true } });

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data.test).toBe(true);
  });
});

describe('buildErrorResponse', () => {
  test('should build error response', async () => {
    const response = buildErrorResponse('Something went wrong', 500);

    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.errors[0].message).toBe('Something went wrong');
  });

  test('should include error code', async () => {
    const response = buildErrorResponse('Bad request', 400, 'BAD_REQUEST');

    const body = await response.json();
    expect(body.errors[0].extensions?.code).toBe('BAD_REQUEST');
  });
});

describe('methodNotAllowed', () => {
  test('should return 405 response', () => {
    const response = methodNotAllowed();

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET, POST, OPTIONS');
  });

  test('should include custom allowed methods', () => {
    const response = methodNotAllowed(['POST']);

    expect(response.headers.get('Allow')).toBe('POST');
  });
});

describe('preflightResponse', () => {
  test('should return 204 response', () => {
    const request = new Request('http://localhost/graphql');
    const response = preflightResponse(request);

    expect(response.status).toBe(204);
  });

  test('should include CORS headers', () => {
    const request = new Request('http://localhost/graphql');
    const response = preflightResponse(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
    expect(response.headers.get('Access-Control-Allow-Methods')).toBeDefined();
  });
});
