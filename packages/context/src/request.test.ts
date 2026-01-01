/**
 * @leaven-graphql/context - Request context tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import { RequestContext, createRequestContext } from './request';

describe('RequestContext', () => {
  describe('constructor', () => {
    test('should create context with request info', () => {
      const context = new RequestContext({
        method: 'POST',
        url: 'http://localhost/graphql',
        headers: { 'content-type': 'application/json' },
      });

      expect(context.requestId).toBeDefined();
      expect(context.startTime).toBeLessThanOrEqual(Date.now());
      expect(context.request.method).toBe('POST');
      expect(context.request.url).toBe('http://localhost/graphql');
    });

    test('should use custom request ID generator', () => {
      const context = new RequestContext(
        {
          method: 'GET',
          url: 'http://localhost/graphql',
          headers: {},
        },
        {
          generateRequestId: () => 'custom-id',
        }
      );

      expect(context.requestId).toBe('custom-id');
    });
  });

  describe('getHeader', () => {
    test('should get header value case-insensitively', () => {
      const context = new RequestContext({
        method: 'POST',
        url: 'http://localhost/graphql',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
      });

      expect(context.getHeader('content-type')).toBe('application/json');
      expect(context.getHeader('CONTENT-TYPE')).toBe('application/json');
      expect(context.getHeader('authorization')).toBe('Bearer token');
    });

    test('should return undefined for missing header', () => {
      const context = new RequestContext({
        method: 'GET',
        url: 'http://localhost/graphql',
        headers: {},
      });

      expect(context.getHeader('x-custom')).toBeUndefined();
    });
  });

  describe('getClientIp', () => {
    test('should return IP from request', () => {
      const context = new RequestContext({
        method: 'GET',
        url: 'http://localhost/graphql',
        headers: {},
        ip: '192.168.1.1',
      });

      expect(context.getClientIp()).toBe('192.168.1.1');
    });

    test('should get IP from proxy headers when trusted', () => {
      const context = new RequestContext({
        method: 'GET',
        url: 'http://localhost/graphql',
        headers: {
          'x-forwarded-for': '10.0.0.1, 10.0.0.2',
        },
        ip: '127.0.0.1',
      });

      const ip = context.getClientIp({ trustProxy: true });
      expect(ip).toBe('10.0.0.1');
    });

    test('should use custom proxy headers', () => {
      const context = new RequestContext({
        method: 'GET',
        url: 'http://localhost/graphql',
        headers: {
          'cf-connecting-ip': '203.0.113.1',
        },
        ip: '127.0.0.1',
      });

      const ip = context.getClientIp({
        trustProxy: true,
        proxyHeaders: ['cf-connecting-ip'],
      });
      expect(ip).toBe('203.0.113.1');
    });

    test('should not use proxy headers when not trusted', () => {
      const context = new RequestContext({
        method: 'GET',
        url: 'http://localhost/graphql',
        headers: {
          'x-forwarded-for': '10.0.0.1',
        },
        ip: '127.0.0.1',
      });

      const ip = context.getClientIp({ trustProxy: false });
      expect(ip).toBe('127.0.0.1');
    });
  });

  describe('getElapsedTime', () => {
    test('should return elapsed time since creation', async () => {
      const context = new RequestContext({
        method: 'GET',
        url: 'http://localhost/graphql',
        headers: {},
      });

      await new Promise((r) => setTimeout(r, 50));

      const elapsed = context.getElapsedTime();
      expect(elapsed).toBeGreaterThanOrEqual(40);
    });
  });

  describe('extend', () => {
    test('should create extended context with properties', () => {
      const context = new RequestContext({
        method: 'GET',
        url: 'http://localhost/graphql',
        headers: {},
      });

      const extended = context.extend({ userId: 'user-123' });

      expect(extended.requestId).toBe(context.requestId);
      expect(extended.userId).toBe('user-123');
    });
  });

  describe('toJSON', () => {
    test('should return JSON-serializable object', () => {
      const context = new RequestContext({
        method: 'POST',
        url: 'http://localhost/graphql',
        headers: {},
      });

      const json = context.toJSON();

      expect(json.requestId).toBe(context.requestId);
      expect(json.startTime).toBe(context.startTime);
      expect(json.method).toBe('POST');
      expect(json.url).toBe('http://localhost/graphql');
    });
  });
});

describe('createRequestContext', () => {
  test('should create context from Bun Request', () => {
    const request = new Request('http://localhost/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test/1.0',
      },
    });

    const context = createRequestContext(request);

    expect(context.request.method).toBe('POST');
    expect(context.request.url).toBe('http://localhost/graphql');
    expect(context.request.headers['content-type']).toBe('application/json');
    expect(context.request.userAgent).toBe('Test/1.0');
  });

  test('should accept custom config', () => {
    const request = new Request('http://localhost/graphql');

    const context = createRequestContext(request, {
      generateRequestId: () => 'custom-id',
    });

    expect(context.requestId).toBe('custom-id');
  });
});
