/**
 * @leaven-graphql/playground - GraphiQL tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import { renderGraphiQL, createGraphiQLHandler } from './graphiql';

describe('renderGraphiQL', () => {
  test('should render HTML with endpoint', () => {
    const html = renderGraphiQL({ endpoint: '/graphql' });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('/graphql');
    expect(html).toContain('GraphiQL');
  });

  test('should include title', () => {
    const html = renderGraphiQL({
      endpoint: '/graphql',
      title: 'My GraphiQL',
    });

    expect(html).toContain('<title>My GraphiQL</title>');
  });

  test('should include subscription endpoint', () => {
    const html = renderGraphiQL({
      endpoint: '/graphql',
      subscriptionEndpoint: 'ws://localhost:4000/graphql',
    });

    expect(html).toContain('subscriptionUrl');
    expect(html).toContain('ws://localhost:4000/graphql');
  });

  test('should include default query', () => {
    const html = renderGraphiQL({
      endpoint: '/graphql',
      defaultQuery: '{ hello }',
    });

    expect(html).toContain('defaultQuery');
  });

  test('should include default variables', () => {
    const html = renderGraphiQL({
      endpoint: '/graphql',
      defaultVariables: '{ "id": "1" }',
    });

    expect(html).toContain('variables');
  });

  test('should include headers', () => {
    const html = renderGraphiQL({
      endpoint: '/graphql',
      headers: { Authorization: 'Bearer token' },
    });

    expect(html).toContain('Authorization');
  });

  test('should include specified version', () => {
    const html = renderGraphiQL({
      endpoint: '/graphql',
      version: '2.0.0',
    });

    expect(html).toContain('graphiql@2.0.0');
  });

  test('should include explorer plugin by default', () => {
    const html = renderGraphiQL({
      endpoint: '/graphql',
    });

    expect(html).toContain('plugin-explorer');
  });

  test('should exclude explorer plugin when disabled', () => {
    const html = renderGraphiQL({
      endpoint: '/graphql',
      explorer: false,
    });

    expect(html).not.toContain('plugin-explorer');
  });

  test('should escape HTML in title', () => {
    const html = renderGraphiQL({
      endpoint: '/graphql',
      title: '<script>alert("xss")</script>',
    });

    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('createGraphiQLHandler', () => {
  test('should create handler function', () => {
    const handler = createGraphiQLHandler({ endpoint: '/graphql' });

    expect(typeof handler).toBe('function');
  });

  test('should return HTML for GET request', () => {
    const handler = createGraphiQLHandler({ endpoint: '/graphql' });
    const request = new Request('http://localhost/graphiql', { method: 'GET' });

    const response = handler(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
  });

  test('should return 405 for non-GET request', () => {
    const handler = createGraphiQLHandler({ endpoint: '/graphql' });
    const request = new Request('http://localhost/graphiql', { method: 'POST' });

    const response = handler(request);

    expect(response.status).toBe(405);
  });

  test('should include no-store cache control', () => {
    const handler = createGraphiQLHandler({ endpoint: '/graphql' });
    const request = new Request('http://localhost/graphiql', { method: 'GET' });

    const response = handler(request);

    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
