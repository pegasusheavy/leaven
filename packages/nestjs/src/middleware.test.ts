/**
 * @leaven-graphql/nestjs - Middleware tests
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
import { AuthenticationError } from '@leaven-graphql/errors';
import { GraphQLMiddleware, createGraphQLMiddleware } from './middleware';
import { LeavenDriver } from './driver';
import type { LeavenModuleOptions } from './types';
// Express types for testing
interface Request {
  method: string;
  path: string;
  originalUrl?: string;
  url?: string;
  secure?: boolean;
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

    test('should delegate OPTIONS to next() when CORS is disabled', async () => {
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

      expect(next).toHaveBeenCalled();
      expect(res._headers['Access-Control-Allow-Origin']).toBeUndefined();
    });

    test('should not set CORS headers on POST responses when CORS is disabled', async () => {
      const noCorsOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        cors: false,
      };
      const noCorsDriver = new LeavenDriver(noCorsOptions);
      await noCorsDriver.onModuleInit();
      const noCorsMiddleware = new GraphQLMiddleware(noCorsDriver, noCorsOptions);

      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: { query: '{ hello }' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await noCorsMiddleware.use(req, res, next);

      expect(res._status).toBe(200);
      expect(res._headers['Access-Control-Allow-Origin']).toBeUndefined();
    });

    test('should emit no CORS headers on POST when cors is left unset', async () => {
      // CORS is opt-in. A stock module must not answer every GraphQL POST
      // with a wildcard origin.
      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: { query: '{ hello }' },
        headers: {
          'content-type': 'application/json',
          origin: 'https://evil.test',
        },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await middleware.use(req, res, next);

      expect(res._status).toBe(200);
      expect(res._body).toEqual({ data: { hello: 'world' } });
      expect(res._headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(res._headers['Access-Control-Allow-Methods']).toBeUndefined();
      expect(res._headers['Access-Control-Allow-Headers']).toBeUndefined();
    });

    test('should delegate OPTIONS to next() when cors is left unset', async () => {
      const req = createMockRequest({
        method: 'OPTIONS',
        path: '/graphql',
        headers: { origin: 'https://evil.test' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await middleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res._headers['Access-Control-Allow-Origin']).toBeUndefined();
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

    test('should include CORS headers on POST responses', async () => {
      const corsOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        cors: {
          origin: 'https://example.com',
          credentials: true,
          exposedHeaders: ['X-Request-Id', 'X-Trace-Id'],
        },
      };
      const corsDriver = new LeavenDriver(corsOptions);
      await corsDriver.onModuleInit();
      const corsMiddleware = new GraphQLMiddleware(corsDriver, corsOptions);

      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: { query: '{ hello }' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await corsMiddleware.use(req, res, next);

      expect(res._status).toBe(200);
      expect(res._body).toEqual({ data: { hello: 'world' } });
      expect(res._headers['Access-Control-Allow-Origin']).toBe('https://example.com');
      expect(res._headers['Access-Control-Allow-Credentials']).toBe('true');
      expect(res._headers['Access-Control-Expose-Headers']).toBe('X-Request-Id, X-Trace-Id');
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

    test('should pass a Fetch API Request to the context factory', async () => {
      let authHeader: string | null = null;
      let requestUrl = '';
      let requestMethod = '';
      let parsedBody: unknown = null;

      const contextOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        context: async (request) => {
          authHeader = request.headers.get('authorization');
          requestUrl = request.url;
          requestMethod = request.method;
          parsedBody = await request.json();
          return { auth: authHeader };
        },
      };
      const contextDriver = new LeavenDriver(contextOptions);
      await contextDriver.onModuleInit();
      const contextMiddleware = new GraphQLMiddleware(contextDriver, contextOptions);

      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: { query: '{ hello }' },
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer test-token',
          host: 'api.example.com',
        },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await contextMiddleware.use(req, res, next);

      expect(res._status).toBe(200);
      expect(res._body).toEqual({ data: { hello: 'world' } });
      expect(authHeader).toBe('Bearer test-token');
      expect(requestUrl).toBe('http://api.example.com/graphql');
      expect(requestMethod).toBe('POST');
      expect(parsedBody).toEqual({ query: '{ hello }' });
    });

    /**
     * Build a middleware whose context factory records the synthesized
     * `Request.url`, run one POST through it, and return that URL.
     */
    async function captureContextRequestUrl(
      req: Request,
      extraOptions: Partial<LeavenModuleOptions> = {}
    ): Promise<string> {
      let requestUrl = '';
      const captureOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        ...extraOptions,
        context: async (request) => {
          requestUrl = request.url;
          return {};
        },
      };
      const captureDriver = new LeavenDriver(captureOptions);
      await captureDriver.onModuleInit();
      const captureMiddleware = new GraphQLMiddleware(captureDriver, captureOptions);

      await captureMiddleware.use(req, createMockResponse(), mock(() => {}));
      await captureDriver.onModuleDestroy();

      return requestUrl;
    }

    test('should preserve the query string in the synthesized request URL', async () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        originalUrl: '/graphql?trace=abc123',
        body: { query: '{ hello }' },
      });

      const requestUrl = await captureContextRequestUrl(req);

      expect(requestUrl).toBe('http://localhost/graphql?trace=abc123');
    });

    test('should ignore a malformed Host header instead of trusting it', async () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: { query: '{ hello }' },
        headers: {
          'content-type': 'application/json',
          host: 'attacker.test/evil?x=1',
        },
      });

      const requestUrl = await captureContextRequestUrl(req);

      expect(requestUrl).toBe('http://localhost/graphql');
    });

    test('should not 500 on a Host header that cannot form a URL', async () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: { query: '{ hello }' },
        headers: {
          'content-type': 'application/json',
          host: 'user@[not-an-authority]:99999',
        },
      });
      const res = createMockResponse();

      const contextOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        context: async () => ({}),
      };
      const contextDriver = new LeavenDriver(contextOptions);
      await contextDriver.onModuleInit();
      const contextMiddleware = new GraphQLMiddleware(contextDriver, contextOptions);

      await contextMiddleware.use(req, res, mock(() => {}));

      expect(res._status).toBe(200);
      await contextDriver.onModuleDestroy();
    });

    test('should prefer the configured publicUrl over the Host header', async () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: { query: '{ hello }' },
        headers: {
          'content-type': 'application/json',
          host: 'attacker.test',
        },
      });

      const requestUrl = await captureContextRequestUrl(req, {
        publicUrl: 'https://api.example.com',
      });

      expect(requestUrl).toBe('https://api.example.com/graphql');
    });

    test('should reflect an allowlisted origin and vary on Origin', async () => {
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
        headers: { origin: 'https://b.com' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await arrayOriginMiddleware.use(req, res, next);

      // Never the invalid `a, b` join, and never the wildcard
      expect(res._headers['Access-Control-Allow-Origin']).toBe('https://b.com');
      expect(res._headers['Vary']).toBe('Origin');
    });

    test('should emit no origin header for an origin outside the allowlist', async () => {
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
        headers: { origin: 'https://evil.test' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await arrayOriginMiddleware.use(req, res, next);

      expect(res._headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(res._headers['Vary']).toBe('Origin');
    });

    test('should emit no origin header when origin is false', async () => {
      const denyOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        cors: { origin: false },
      };
      const denyDriver = new LeavenDriver(denyOptions);
      await denyDriver.onModuleInit();
      const denyMiddleware = new GraphQLMiddleware(denyDriver, denyOptions);

      const req = createMockRequest({
        method: 'OPTIONS',
        path: '/graphql',
        headers: { origin: 'https://evil.test' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await denyMiddleware.use(req, res, next);

      expect(res._headers['Access-Control-Allow-Origin']).toBeUndefined();
    });

    test('should echo the request origin when origin is true', async () => {
      const trueOriginOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        cors: { origin: true },
      };
      const trueOriginDriver = new LeavenDriver(trueOriginOptions);
      await trueOriginDriver.onModuleInit();
      const trueOriginMiddleware = new GraphQLMiddleware(trueOriginDriver, trueOriginOptions);

      const req = createMockRequest({
        method: 'OPTIONS',
        path: '/graphql',
        headers: { origin: 'https://app.example.com' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await trueOriginMiddleware.use(req, res, next);

      expect(res._headers['Access-Control-Allow-Origin']).toBe('https://app.example.com');
      expect(res._headers['Vary']).toBe('Origin');
    });

    test('should never pair the wildcard with credentials', async () => {
      const credentialOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        cors: { credentials: true },
      };
      const credentialDriver = new LeavenDriver(credentialOptions);
      await credentialDriver.onModuleInit();
      const credentialMiddleware = new GraphQLMiddleware(credentialDriver, credentialOptions);

      const req = createMockRequest({
        method: 'OPTIONS',
        path: '/graphql',
        headers: { origin: 'https://app.example.com' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await credentialMiddleware.use(req, res, next);

      expect(res._headers['Access-Control-Allow-Origin']).toBe('https://app.example.com');
      expect(res._headers['Access-Control-Allow-Credentials']).toBe('true');
      expect(res._headers['Vary']).toBe('Origin');
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
      const errors = (res._body as { errors: Array<{ message: string }> }).errors;
      expect(errors).toHaveLength(1);
      expect(errors[0]?.message).toBe('Executor not initialized. Set schema first.');
    });

    test('should preserve the status and code of a Leaven error from the context factory', async () => {
      const authOptions: LeavenModuleOptions = {
        schema,
        path: '/graphql',
        context: async () => {
          throw new AuthenticationError('Token expired');
        },
      };
      const authDriver = new LeavenDriver(authOptions);
      await authDriver.onModuleInit();
      const authMiddleware = new GraphQLMiddleware(authDriver, authOptions);

      const req = createMockRequest({
        method: 'POST',
        path: '/graphql',
        body: { query: '{ hello }' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      await authMiddleware.use(req, res, next);

      expect(res._status).toBe(401);
      const errors = (res._body as {
        errors: Array<{ message: string; extensions?: Record<string, unknown> }>;
      }).errors;
      expect(errors[0]?.message).toBe('Token expired');
      expect(errors[0]?.extensions?.code).toBe('UNAUTHENTICATED');

      await authDriver.onModuleDestroy();
    });

    test('should mask an unexpected context-factory error in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const leakyOptions: LeavenModuleOptions = {
          schema,
          path: '/graphql',
          context: async () => {
            throw new Error('postgres://user:password@db.internal');
          },
        };
        const leakyDriver = new LeavenDriver(leakyOptions);
        await leakyDriver.onModuleInit();
        const leakyMiddleware = new GraphQLMiddleware(leakyDriver, leakyOptions);

        const req = createMockRequest({
          method: 'POST',
          path: '/graphql',
          body: { query: '{ hello }' },
        });
        const res = createMockResponse();
        const next = mock(() => {});

        await leakyMiddleware.use(req, res, next);

        expect(res._status).toBe(500);
        const errors = (res._body as { errors: Array<{ message: string }> }).errors;
        expect(errors[0]?.message).toBe('An unexpected error occurred');
        expect(errors[0]?.message).not.toContain('password');

        await leakyDriver.onModuleDestroy();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
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
