/**
 * @leaven-graphql/errors - Error codes
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Standard error codes for Leaven errors
 */
export enum ErrorCode {
  // General errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',

  // Authentication/Authorization
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Rate limiting
  RATE_LIMITED = 'RATE_LIMITED',

  // Query limits
  COMPLEXITY_LIMIT = 'COMPLEXITY_LIMIT',
  DEPTH_LIMIT = 'DEPTH_LIMIT',

  // Persisted queries
  PERSISTED_QUERY_NOT_FOUND = 'PERSISTED_QUERY_NOT_FOUND',
  PERSISTED_QUERY_INVALID = 'PERSISTED_QUERY_INVALID',

  // Input errors
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
}

/**
 * Error code metadata
 */
export const ERROR_CODES: Record<ErrorCode, { status: number; message: string }> = {
  [ErrorCode.INTERNAL_ERROR]: {
    status: 500,
    message: 'An internal error occurred',
  },
  [ErrorCode.BAD_REQUEST]: {
    status: 400,
    message: 'Bad request',
  },
  [ErrorCode.VALIDATION_ERROR]: {
    status: 400,
    message: 'Validation failed',
  },
  [ErrorCode.PARSE_ERROR]: {
    status: 400,
    message: 'Failed to parse GraphQL query',
  },
  [ErrorCode.UNAUTHENTICATED]: {
    status: 401,
    message: 'Authentication required',
  },
  [ErrorCode.FORBIDDEN]: {
    status: 403,
    message: 'Access denied',
  },
  [ErrorCode.NOT_FOUND]: {
    status: 404,
    message: 'Resource not found',
  },
  [ErrorCode.ALREADY_EXISTS]: {
    status: 409,
    message: 'Resource already exists',
  },
  [ErrorCode.RATE_LIMITED]: {
    status: 429,
    message: 'Rate limit exceeded',
  },
  [ErrorCode.COMPLEXITY_LIMIT]: {
    status: 400,
    message: 'Query complexity limit exceeded',
  },
  [ErrorCode.DEPTH_LIMIT]: {
    status: 400,
    message: 'Query depth limit exceeded',
  },
  [ErrorCode.PERSISTED_QUERY_NOT_FOUND]: {
    status: 400,
    message: 'Persisted query not found',
  },
  [ErrorCode.PERSISTED_QUERY_INVALID]: {
    status: 400,
    message: 'Invalid persisted query',
  },
  [ErrorCode.INVALID_INPUT]: {
    status: 400,
    message: 'Invalid input provided',
  },
  [ErrorCode.MISSING_REQUIRED_FIELD]: {
    status: 400,
    message: 'Required field is missing',
  },
};

/**
 * Get error code from a code string
 */
export function getErrorCode(code: string): ErrorCode | null {
  if (Object.values(ErrorCode).includes(code as ErrorCode)) {
    return code as ErrorCode;
  }
  return null;
}

/**
 * Get default message for an error code
 */
export function getErrorMessage(code: ErrorCode): string {
  return ERROR_CODES[code]?.message ?? 'An error occurred';
}
