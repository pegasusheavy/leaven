/**
 * @leaven-graphql/nestjs - Middleware tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
import { GraphQLMiddleware, createGraphQLMiddleware } from './middleware';
import { LeavenDriver } from './driver';
import type { LeavenModuleOptions } from './types';
// Express types for testing
interface Request {
  method: string;
  path: string;
  body?: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
}

interface Response {
  status(code: number): Response;
  json(body: unknown): Response;
  send(body: unknown): Response;
  setHeader(name: string, value: string): Response;
  end(): Response;
}

describe('GraphQLMiddleware', () => {
  let middleware: GraphQLMiddleware;
  let driver: LeavenDriver;
  let schema: GraphQLSchema;
  let options: LeavenModuleOptions;

  beforeEach(async () => {
    schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          hello: {
            type: GraphQLString,
            resolve: () => 'world',
          },
        },
      }),
    });

    options = {
      schema,
      path: '/graphql',
      playground: true,
    };

    driver = new LeavenDriver(options);
    await driver.onModuleInit();

    middleware = new GraphQLMiddleware(driver, options);
  });

  function createMockRequest(overrides: Partial<Request> = {}): Request {
    return {
      method: 'POST',
      path: '/graphql',
      body: { query: '{ hello }' },
      headers: {
        'content-type': 'application/json',
      },
      ...overrides,
    } as unknown as Request;
  }

  function createMockResponse(): Response & {
    _status: number;
    _body: unknown;
    _headers: Record<string, string>
  } {
    const res = {
      _status: 200,
      _body: null as unknown,
      _headers: {} as Record<string, string>,
      status: function(code: number) {
        this._status = code;
        return this;
      },
      json: function(body: unknown) {
        this._body = body;
        return this;
      },
      send: function(body: unknown) {
        this._body = body;
        return this;
      },
      setHeader: function(name: string, value: string) {
        this._headers[name] = value;
        return this;
      },
      end: function() {
        return this;
      },
    };
    return res as Response & { _status: number; _body: unknown; _headers: Record<string, string> };
  }

  describe('use', () => {
    test('should pass through non-GraphQL requests', async () => {
      const req = createMockRequest({ path: '/api/health' });
      const res = createMockResponse();
      const next = mock(() => {});

      await middleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should handle GraphQL POST requests', async () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: { query: '{ hello }' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await middleware.use(req, res, next);

      expect(res._status).toBe(200);
      expect(res._body).toEqual({ data: { hello: 'world' } });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle GET requests for playground', async () => {
      const req = createMockRequest({
        method: 'GET',
        path: '/graphql',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await middleware.use(req, res, next);

      expect(res._headers['Content-Type']).toBe('text/html');
      expect(res._body).toContain('<!DOCTYPE html>');
      expect(res._body).toContain('GraphiQL');
      expect(next).not.toHaveBeenCalled();
    });

    test('should skip playground when disabled', async () => {
      const noPlaygroundOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        playground: false,
      };
      const noPlaygroundDriver = new LeavenDriver(noPlaygroundOptions);
      await noPlaygroundDriver.onModuleInit();
      const noPlaygroundMiddleware = new GraphQLMiddleware(noPlaygroundDriver, noPlaygroundOptions);

      const req = createMockRequest({
        method: 'GET',
        path: '/graphql',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await noPlaygroundMiddleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should handle OPTIONS for CORS preflight', async () => {
      const corsOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        cors: {
          origin: 'https://example.com',
          methods: ['GET', 'POST'],
          allowedHeaders: ['Content-Type', 'Authorization'],
          credentials: true,
          maxAge: 86400,
        },
      };
      const corsDriver = new LeavenDriver(corsOptions);
      await corsDriver.onModuleInit();
      const corsMiddleware = new GraphQLMiddleware(corsDriver, corsOptions);

      const req = createMockRequest({
        method: 'OPTIONS',
        path: '/graphql',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await corsMiddleware.use(req, res, next);

      expect(res._status).toBe(204);
      expect(res._headers['Access-Control-Allow-Origin']).toBe('https://example.com');
      expect(res._headers['Access-Control-Allow-Methods']).toBe('GET, POST');
      expect(res._headers['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization');
      expect(res._headers['Access-Control-Allow-Credentials']).toBe('true');
      expect(res._headers['Access-Control-Max-Age']).toBe('86400');
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle OPTIONS with CORS disabled', async () => {
      const noCorsOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        cors: false,
      };
      const noCorsDriver = new LeavenDriver(noCorsOptions);
      await noCorsDriver.onModuleInit();
      const noCorsMiddleware = new GraphQLMiddleware(noCorsDriver, noCorsOptions);

      const req = createMockRequest({
        method: 'OPTIONS',
        path: '/graphql',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await noCorsMiddleware.use(req, res, next);

      expect(res._status).toBe(204);
    });

    test('should handle OPTIONS with default CORS (true)', async () => {
      const defaultCorsOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        cors: true,
      };
      const defaultCorsDriver = new LeavenDriver(defaultCorsOptions);
      await defaultCorsDriver.onModuleInit();
      const defaultCorsMiddleware = new GraphQLMiddleware(defaultCorsDriver, defaultCorsOptions);

      const req = createMockRequest({
        method: 'OPTIONS',
        path: '/graphql',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await defaultCorsMiddleware.use(req, res, next);

      expect(res._status).toBe(204);
      expect(res._headers['Access-Control-Allow-Origin']).toBe('*');
    });

    test('should return 400 for missing query', async () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: {},
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await middleware.use(req, res, next);

      expect(res._status).toBe(400);
      expect(res._body).toEqual({
        errors: [{ message: 'Query is required' }],
      });
    });

    test('should handle execution errors', async () => {
      const errorSchema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: {
            error: {
              type: GraphQLString,
              resolve: () => {
                throw new Error('Test error');
              },
            },
          },
        }),
      });

      const errorDriver = new LeavenDriver({ schema: errorSchema });
      await errorDriver.onModuleInit();
      const errorMiddleware = new GraphQLMiddleware(errorDriver, { schema: errorSchema });

      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: { query: '{ error }' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await errorMiddleware.use(req, res, next);

      expect(res._status).toBe(200); // GraphQL errors return 200
      expect(res._body).toBeDefined();
      expect((res._body as { errors?: unknown[] }).errors).toBeDefined();
    });

    test('should include variables and operationName', async () => {
      const variableSchema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: {
            echo: {
              type: GraphQLString,
              args: {
                message: { type: GraphQLString },
              },
              resolve: (_, args) => args.message,
            },
          },
        }),
      });

      const variableDriver = new LeavenDriver({ schema: variableSchema });
      await variableDriver.onModuleInit();
      const variableMiddleware = new GraphQLMiddleware(variableDriver, { schema: variableSchema });

      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: {
          query: 'query Echo($msg: String) { echo(message: $msg) }',
          variables: { msg: 'Hello!' },
          operationName: 'Echo',
        },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await variableMiddleware.use(req, res, next);

      expect(res._status).toBe(200);
      expect(res._body).toEqual({ data: { echo: 'Hello!' } });
    });

    test('should use custom context factory', async () => {
      const contextOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        context: async (_req, _res) => ({
          customValue: 'test',
        }),
      };
      const contextDriver = new LeavenDriver(contextOptions);
      await contextDriver.onModuleInit();
      const contextMiddleware = new GraphQLMiddleware(contextDriver, contextOptions);

      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: { query: '{ hello }' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await contextMiddleware.use(req, res, next);

      expect(res._status).toBe(200);
    });

    test('should handle CORS with array origin', async () => {
      const arrayOriginOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        cors: {
          origin: ['https://a.com', 'https://b.com'],
        },
      };
      const arrayOriginDriver = new LeavenDriver(arrayOriginOptions);
      await arrayOriginDriver.onModuleInit();
      const arrayOriginMiddleware = new GraphQLMiddleware(arrayOriginDriver, arrayOriginOptions);

      const req = createMockRequest({
        method: 'OPTIONS',
        path: '/graphql',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await arrayOriginMiddleware.use(req, res, next);

      expect(res._headers['Access-Control-Allow-Origin']).toBe('https://a.com, https://b.com');
    });

    test('should handle CORS with array methods', async () => {
      const arrayMethodsOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        cors: {
          methods: ['GET', 'POST', 'PUT'],
        },
      };
      const arrayMethodsDriver = new LeavenDriver(arrayMethodsOptions);
      await arrayMethodsDriver.onModuleInit();
      const arrayMethodsMiddleware = new GraphQLMiddleware(arrayMethodsDriver, arrayMethodsOptions);

      const req = createMockRequest({
        method: 'OPTIONS',
        path: '/graphql',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await arrayMethodsMiddleware.use(req, res, next);

      expect(res._headers['Access-Control-Allow-Methods']).toBe('GET, POST, PUT');
    });

    test('should handle CORS with array allowed headers', async () => {
      const arrayHeadersOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        cors: {
          allowedHeaders: ['X-Custom-Header', 'Authorization'],
        },
      };
      const arrayHeadersDriver = new LeavenDriver(arrayHeadersOptions);
      await arrayHeadersDriver.onModuleInit();
      const arrayHeadersMiddleware = new GraphQLMiddleware(arrayHeadersDriver, arrayHeadersOptions);

      const req = createMockRequest({
        method: 'OPTIONS',
        path: '/graphql',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await arrayHeadersMiddleware.use(req, res, next);

      expect(res._headers['Access-Control-Allow-Headers']).toBe('X-Custom-Header, Authorization');
    });

    test('should call next for non-POST/GET/OPTIONS methods', async () => {
      const req = createMockRequest({
        method: 'PUT',
        path: '/graphql',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await middleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should handle internal server error', async () => {
      // Create a driver that throws on execute
      const brokenDriver = new LeavenDriver({ schema });
      await brokenDriver.onModuleInit();

      // Forcefully break the driver
      (brokenDriver as unknown as { executor: null }).executor = null;

      const brokenMiddleware = new GraphQLMiddleware(brokenDriver, { schema });

      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: { query: '{ hello }' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await brokenMiddleware.use(req, res, next);

      expect(res._status).toBe(500);
      expect(res._body).toEqual({
        errors: [{ message: 'Executor not initialized. Set schema first.' }],
      });
    });
  });

  describe('playground HTML', () => {
    test('should include the GraphQL endpoint in playground', async () => {
      const req = createMockRequest({
        method: 'GET',
        path: '/graphql',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await middleware.use(req, res, next);

      expect(res._body).toContain('/graphql');
    });

    test('should include React and GraphiQL scripts', async () => {
      const req = createMockRequest({
        method: 'GET',
        path: '/graphql',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await middleware.use(req, res, next);

      expect(res._body).toContain('react');
      expect(res._body).toContain('graphiql');
    });
  });
});

describe('createGraphQLMiddleware', () => {
  test('should return GraphQLMiddleware class', () => {
    const MiddlewareClass = createGraphQLMiddleware();
    expect(MiddlewareClass).toBe(GraphQLMiddleware);
  });
});
