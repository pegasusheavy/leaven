/**
 * @leaven-graphql/http - Request parsing utilities
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { GraphQLRequest } from '@leaven-graphql/core';

/**
 * Parsed request body
 */
export interface ParsedBody {
  /** The GraphQL query */
  query?: string;
  /** Operation name */
  operationName?: string;
  /** Variables */
  variables?: Record<string, unknown>;
  /** Extensions */
  extensions?: Record<string, unknown>;
}

/**
 * Request validation result
 */
export interface RequestValidation {
  /** Whether the request is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Parsed GraphQL request */
  request?: GraphQLRequest;
}

/**
 * Parse a request body into a GraphQL request
 */
export async function parseBody(request: Request): Promise<ParsedBody> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return parseJsonBody(request);
  }

  if (contentType.includes('application/graphql')) {
    const query = await request.text();
    return { query };
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return parseFormBody(request);
  }

  if (contentType.includes('multipart/form-data')) {
    return parseMultipartBody(request);
  }

  // Try JSON as fallback
  try {
    return parseJsonBody(request);
  } catch {
    throw new Error('Unsupported content type');
  }
}

/**
 * Parse JSON body
 */
async function parseJsonBody(request: Request): Promise<ParsedBody> {
  const text = await request.text();

  if (!text) {
    return {};
  }

  try {
    const body = JSON.parse(text);
    return {
      query: body.query,
      operationName: body.operationName,
      variables: parseVariables(body.variables),
      extensions: body.extensions,
    };
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Parse form body
 */
async function parseFormBody(request: Request): Promise<ParsedBody> {
  const formData = await request.formData();

  return {
    query: formData.get('query')?.toString(),
    operationName: formData.get('operationName')?.toString(),
    variables: parseVariables(formData.get('variables')?.toString()),
    extensions: parseVariables(formData.get('extensions')?.toString()),
  };
}

/**
 * Parse multipart body
 */
async function parseMultipartBody(request: Request): Promise<ParsedBody> {
  const formData = await request.formData();
  const operations = formData.get('operations');

  if (!operations) {
    return {
      query: formData.get('query')?.toString(),
      operationName: formData.get('operationName')?.toString(),
      variables: parseVariables(formData.get('variables')?.toString()),
    };
  }

  // Handle graphql-multipart-request-spec
  const opsJson = JSON.parse(operations.toString());
  const map = formData.get('map');

  if (map) {
    const mapJson = JSON.parse(map.toString());

    // Apply file mappings
    for (const [key, paths] of Object.entries(mapJson)) {
      const file = formData.get(key);
      if (file) {
        for (const path of paths as string[]) {
          setPath(opsJson, path, file);
        }
      }
    }
  }

  return {
    query: opsJson.query,
    operationName: opsJson.operationName,
    variables: opsJson.variables,
    extensions: opsJson.extensions,
  };
}

/**
 * Parse query string parameters
 */
export function parseQuery(url: URL): ParsedBody {
  const params = url.searchParams;

  return {
    query: params.get('query') ?? undefined,
    operationName: params.get('operationName') ?? undefined,
    variables: parseVariables(params.get('variables')),
    extensions: parseVariables(params.get('extensions')),
  };
}

/**
 * Parse variables from string or object
 */
function parseVariables(
  variables: string | Record<string, unknown> | null | undefined
): Record<string, unknown> | undefined {
  if (!variables) {
    return undefined;
  }

  if (typeof variables === 'string') {
    try {
      return JSON.parse(variables);
    } catch {
      return undefined;
    }
  }

  return variables;
}

/**
 * Set a value at a path in an object
 */
function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1]!;
  current[lastPart] = value;
}

/**
 * Validate a GraphQL request
 */
export function validateRequest(body: ParsedBody, query: ParsedBody): RequestValidation {
  // Merge body and query params (body takes precedence)
  const merged = {
    query: body.query ?? query.query,
    operationName: body.operationName ?? query.operationName,
    variables: body.variables ?? query.variables,
    extensions: body.extensions ?? query.extensions,
  };

  if (!merged.query) {
    return {
      valid: false,
      error: 'Query is required',
    };
  }

  return {
    valid: true,
    request: {
      query: merged.query,
      operationName: merged.operationName,
      variables: merged.variables,
      extensions: merged.extensions,
    },
  };
}
