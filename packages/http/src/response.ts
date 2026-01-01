/**
 * @leaven-graphql/http - Response utilities
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { GraphQLResponse } from '@leaven-graphql/core';

/**
 * CORS configuration
 */
export interface CorsConfig {
  /** Allowed origins (default: '*') */
  origin?: string | string[] | ((origin: string) => boolean);
  /** Allowed methods */
  methods?: string[];
  /** Allowed headers */
  allowedHeaders?: string[];
  /** Exposed headers */
  exposedHeaders?: string[];
  /** Allow credentials */
  credentials?: boolean;
  /** Max age for preflight cache */
  maxAge?: number;
}

/**
 * Response options
 */
export interface ResponseOptions {
  /** HTTP status code */
  status?: number;
  /** Additional headers */
  headers?: Record<string, string>;
  /** CORS configuration */
  cors?: CorsConfig;
  /** Pretty print JSON */
  pretty?: boolean;
}

/**
 * Build CORS headers
 */
export function corsHeaders(
  request: Request,
  config: CorsConfig = {}
): Record<string, string> {
  const headers: Record<string, string> = {};
  const origin = request.headers.get('origin') ?? '*';

  // Access-Control-Allow-Origin
  if (config.origin === undefined || config.origin === '*') {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (typeof config.origin === 'string') {
    headers['Access-Control-Allow-Origin'] = config.origin;
  } else if (Array.isArray(config.origin)) {
    if (config.origin.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  } else if (typeof config.origin === 'function') {
    if (config.origin(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  }

  // Access-Control-Allow-Methods
  if (config.methods) {
    headers['Access-Control-Allow-Methods'] = config.methods.join(', ');
  } else {
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
  }

  // Access-Control-Allow-Headers
  if (config.allowedHeaders) {
    headers['Access-Control-Allow-Headers'] = config.allowedHeaders.join(', ');
  } else {
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }

  // Access-Control-Expose-Headers
  if (config.exposedHeaders) {
    headers['Access-Control-Expose-Headers'] = config.exposedHeaders.join(', ');
  }

  // Access-Control-Allow-Credentials
  if (config.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  // Access-Control-Max-Age
  if (config.maxAge !== undefined) {
    headers['Access-Control-Max-Age'] = config.maxAge.toString();
  }

  return headers;
}

/**
 * Build a Response from a GraphQL response
 */
export function buildResponse(
  response: GraphQLResponse,
  options: ResponseOptions = {}
): Response {
  const hasErrors = response.errors && response.errors.length > 0;

  // Determine status code
  let status = options.status ?? 200;

  if (hasErrors && status === 200) {
    // Check for specific error types
    const firstError = response.errors![0];
    const code = firstError?.extensions?.code as string | undefined;

    switch (code) {
      case 'UNAUTHENTICATED':
        status = 401;
        break;
      case 'FORBIDDEN':
        status = 403;
        break;
      case 'BAD_REQUEST':
      case 'VALIDATION_ERROR':
      case 'PARSE_ERROR':
        status = 400;
        break;
      case 'NOT_FOUND':
        status = 404;
        break;
      case 'RATE_LIMITED':
        status = 429;
        break;
      case 'INTERNAL_ERROR':
        status = 500;
        break;
    }
  }

  // Build response body
  const body = options.pretty
    ? JSON.stringify(response, null, 2)
    : JSON.stringify(response);

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...options.headers,
  };

  return new Response(body, { status, headers });
}

/**
 * Send a GraphQL response (alias for buildResponse)
 */
export function sendResponse(
  response: GraphQLResponse,
  options?: ResponseOptions
): Response {
  return buildResponse(response, options);
}

/**
 * Build an error response
 */
export function buildErrorResponse(
  message: string,
  status: number = 400,
  code?: string,
  options?: ResponseOptions
): Response {
  const response: GraphQLResponse = {
    errors: [
      {
        message,
        extensions: code ? { code } : undefined,
      },
    ],
  };

  return buildResponse(response, { ...options, status });
}

/**
 * Build a method not allowed response
 */
export function methodNotAllowed(
  allowedMethods: string[] = ['GET', 'POST', 'OPTIONS']
): Response {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: {
      Allow: allowedMethods.join(', '),
    },
  });
}

/**
 * Build a preflight response for CORS
 */
export function preflightResponse(
  request: Request,
  config?: CorsConfig
): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, config),
  });
}
