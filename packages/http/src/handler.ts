/**
 * @leaven-graphql/http - HTTP request handler
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { GraphQLSchema } from 'graphql';
import { LeavenExecutor, type ExecutorConfig, type GraphQLRequest } from '@leaven-graphql/core';
import { createRequestContext, type RequestContextConfig } from '@leaven-graphql/context';
import { formatError, type ErrorMaskingOptions } from '@leaven-graphql/errors';

import { parseBody, parseQuery, validateRequest } from './request';
import {
  buildResponse,
  buildErrorResponse,
  preflightResponse,
  methodNotAllowed,
  corsHeaders,
  type CorsConfig,
  type ResponseOptions,
} from './response';

/**
 * GraphQL HTTP handler function
 */
export type GraphQLHandler = (request: Request) => Promise<Response>;

/**
 * Context factory function
 */
export type ContextFactory<TContext> = (
  request: Request,
  graphqlRequest: GraphQLRequest
) => TContext | Promise<TContext>;

/**
 * Handler configuration
 */
export interface HandlerConfig<TContext = unknown> {
  /** GraphQL schema */
  schema: GraphQLSchema;
  /** Context factory */
  context?: ContextFactory<TContext>;
  /** Root value */
  rootValue?: unknown;
  /** Executor configuration */
  executor?: Omit<ExecutorConfig, 'schema' | 'rootValue'>;
  /** CORS configuration */
  cors?: CorsConfig | boolean;
  /** Enable GraphQL playground at GET requests */
  playground?: boolean;
  /** Path for the GraphQL endpoint (for playground redirect) */
  path?: string;
  /** Error formatting options */
  errorFormatting?: ErrorMaskingOptions;
  /** Request context configuration */
  requestContext?: RequestContextConfig;
  /** Response options */
  response?: ResponseOptions;
  /** Allowed methods (default: GET, POST) */
  allowedMethods?: string[];
  /** Enable introspection */
  introspection?: boolean;
  /** Maximum request body size in bytes */
  maxBodySize?: number;
}

/**
 * Create a GraphQL HTTP handler for Bun
 */
export function createHandler<TContext = unknown>(
  config: HandlerConfig<TContext>
): GraphQLHandler {
  const executor = new LeavenExecutor({
    schema: config.schema,
    rootValue: config.rootValue,
    introspection: config.introspection ?? true,
    ...config.executor,
  });

  const allowedMethods = config.allowedMethods ?? ['GET', 'POST', 'OPTIONS'];
  const corsConfig = config.cors === true ? {} : config.cors || undefined;

  return async (request: Request): Promise<Response> => {
    const method = request.method.toUpperCase();

    // Handle CORS preflight
    if (method === 'OPTIONS' && corsConfig !== undefined) {
      return preflightResponse(request, corsConfig);
    }

    // Check allowed methods
    if (!allowedMethods.includes(method)) {
      return methodNotAllowed(allowedMethods);
    }

    // Add CORS headers to response options
    const responseOptions: ResponseOptions = {
      ...config.response,
      headers: {
        ...config.response?.headers,
        ...(corsConfig !== undefined ? corsHeaders(request, corsConfig) : {}),
      },
    };

    try {
      // Parse the request
      const url = new URL(request.url);
      const queryParams = parseQuery(url);

      let body: Awaited<ReturnType<typeof parseBody>> = {};
      if (method === 'POST') {
        // Check body size
        if (config.maxBodySize) {
          const contentLength = request.headers.get('content-length');
          if (contentLength && parseInt(contentLength) > config.maxBodySize) {
            return buildErrorResponse(
              'Request body too large',
              413,
              'PAYLOAD_TOO_LARGE',
              responseOptions
            );
          }
        }

        body = await parseBody(request);
      }

      // Validate the request
      const validation = validateRequest(body, queryParams);
      if (!validation.valid) {
        return buildErrorResponse(
          validation.error ?? 'Invalid request',
          400,
          'BAD_REQUEST',
          responseOptions
        );
      }

      const graphqlRequest = validation.request!;

      // Build context
      let context: TContext | undefined;
      if (config.context) {
        context = await config.context(request, graphqlRequest);
      } else {
        // Use default request context
        context = createRequestContext(request, config.requestContext) as TContext;
      }

      // Execute the query
      const result = await executor.execute(graphqlRequest, context);

      // Format errors if configured
      if (result.response.errors && config.errorFormatting) {
        result.response = {
          ...result.response,
          errors: result.response.errors.map((e) =>
            formatError(e, config.errorFormatting)
          ),
        };
      }

      return buildResponse(result.response, responseOptions);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      return buildErrorResponse(message, 500, 'INTERNAL_ERROR', responseOptions);
    }
  };
}

/**
 * Create a GraphQL handler for Bun.serve
 */
export function createBunHandler<TContext = unknown>(
  config: HandlerConfig<TContext>
): GraphQLHandler {
  return createHandler(config);
}
