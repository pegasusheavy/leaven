/**
 * @leaven-graphql/errors - Error classes
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 */

import { GraphQLError } from 'graphql';
import { ErrorCode, ERROR_CODES } from './codes';

/**
 * Base error class for Leaven errors
 */
export class LeavenError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly extensions: Record<string, unknown>;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    options?: {
      statusCode?: number;
      extensions?: Record<string, unknown>;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'LeavenError';
    this.code = code;
    this.statusCode = options?.statusCode ?? ERROR_CODES[code]?.status ?? 500;
    // `code` is spread last on purpose: the enum is the single source of truth.
    // A caller-supplied `extensions.code` must not be able to disagree with
    // `this.code`, which would leave `toJSON()` reporting two different codes
    // and defeat the known-code check in `shouldMaskError`.
    this.extensions = {
      ...options?.extensions,
      code,
    };
    this.originalError = options?.originalError;

    // Maintain proper stack trace
    Error.captureStackTrace?.(this, this.constructor);
  }

  /**
   * Convert to a GraphQL error.
   *
   * IMPORTANT — `originalError` is this LeavenError, not the wrapped cause.
   * The returned `GraphQLError` sets `originalError` to `this` so downstream
   * consumers (error masking, `formatError` hooks, loggers) can recognise the
   * error as intentional and leave it unmasked. The cause passed to the
   * constructor is therefore one level deeper:
   *
   * ```typescript
   * const gqlError = new LeavenError('Query failed', ErrorCode.INTERNAL_ERROR, {
   *   originalError: dbError,
   * }).toGraphQLError();
   *
   * gqlError.originalError;                  // the LeavenError
   * gqlError.originalError.originalError;     // dbError
   * ```
   *
   * Code that matches on the underlying cause (`if (gqlError.originalError
   * instanceof MyDbError)` in a `formatError` hook, logger or Sentry
   * integration) must unwrap one extra level, otherwise it silently stops
   * matching.
   *
   * `extensions` are copied verbatim, so subclass detail such as
   * `RateLimitError.retryAfter` or `ValidationError.validationErrors` survives
   * the conversion and reaches the formatted response.
   */
  public toGraphQLError(): GraphQLError {
    return new GraphQLError(this.message, {
      extensions: this.extensions,
      originalError: this,
    });
  }

  /**
   * Convert to a JSON-serializable object
   */
  public toJSON(): {
    message: string;
    code: ErrorCode;
    statusCode: number;
    extensions: Record<string, unknown>;
  } {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      extensions: this.extensions,
    };
  }
}

/**
 * Validation error
 */
export class ValidationError extends LeavenError {
  public readonly validationErrors: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    validationErrors: Array<{ field?: string; message: string }> = [],
    options?: { extensions?: Record<string, unknown> }
  ) {
    super(message, ErrorCode.VALIDATION_ERROR, {
      statusCode: 400,
      extensions: {
        ...options?.extensions,
        validationErrors,
      },
    });
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends LeavenError {
  constructor(
    message: string = 'Authentication required',
    options?: { extensions?: Record<string, unknown> }
  ) {
    super(message, ErrorCode.UNAUTHENTICATED, {
      statusCode: 401,
      extensions: options?.extensions,
    });
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends LeavenError {
  constructor(
    message: string = 'Access denied',
    options?: { extensions?: Record<string, unknown> }
  ) {
    super(message, ErrorCode.FORBIDDEN, {
      statusCode: 403,
      extensions: options?.extensions,
    });
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends LeavenError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(
    message: string = 'Resource not found',
    options?: {
      resourceType?: string;
      resourceId?: string;
      extensions?: Record<string, unknown>;
    }
  ) {
    super(message, ErrorCode.NOT_FOUND, {
      statusCode: 404,
      extensions: {
        ...options?.extensions,
        ...(options?.resourceType !== undefined && {
          resourceType: options.resourceType,
        }),
        ...(options?.resourceId !== undefined && {
          resourceId: options.resourceId,
        }),
      },
    });
    this.name = 'NotFoundError';
    this.resourceType = options?.resourceType;
    this.resourceId = options?.resourceId;
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends LeavenError {
  public readonly retryAfter?: number;

  constructor(
    message: string = 'Rate limit exceeded',
    options?: {
      retryAfter?: number;
      extensions?: Record<string, unknown>;
    }
  ) {
    super(message, ErrorCode.RATE_LIMITED, {
      statusCode: 429,
      extensions: {
        ...options?.extensions,
        ...(options?.retryAfter !== undefined && {
          retryAfter: options.retryAfter,
        }),
      },
    });
    this.name = 'RateLimitError';
    this.retryAfter = options?.retryAfter;
  }
}

/**
 * Query complexity error
 */
export class ComplexityError extends LeavenError {
  public readonly complexity: number;
  public readonly maxComplexity: number;

  constructor(
    complexity: number,
    maxComplexity: number,
    options?: { extensions?: Record<string, unknown> }
  ) {
    super(
      `Query complexity of ${complexity} exceeds maximum allowed complexity of ${maxComplexity}`,
      ErrorCode.COMPLEXITY_LIMIT,
      {
        statusCode: 400,
        extensions: {
          ...options?.extensions,
          complexity,
          maxComplexity,
        },
      }
    );
    this.name = 'ComplexityError';
    this.complexity = complexity;
    this.maxComplexity = maxComplexity;
  }
}

/**
 * Query depth limit error
 */
export class DepthLimitError extends LeavenError {
  public readonly depth: number;
  public readonly maxDepth: number;

  constructor(
    depth: number,
    maxDepth: number,
    options?: { extensions?: Record<string, unknown> }
  ) {
    super(
      `Query depth of ${depth} exceeds maximum allowed depth of ${maxDepth}`,
      ErrorCode.DEPTH_LIMIT,
      {
        statusCode: 400,
        extensions: {
          ...options?.extensions,
          depth,
          maxDepth,
        },
      }
    );
    this.name = 'DepthLimitError';
    this.depth = depth;
    this.maxDepth = maxDepth;
  }
}

/**
 * Persisted query error
 */
export class PersistedQueryError extends LeavenError {
  constructor(
    message: string,
    code: ErrorCode.PERSISTED_QUERY_NOT_FOUND | ErrorCode.PERSISTED_QUERY_INVALID = ErrorCode.PERSISTED_QUERY_NOT_FOUND,
    options?: { extensions?: Record<string, unknown> }
  ) {
    super(message, code, {
      statusCode: 400,
      extensions: options?.extensions,
    });
    this.name = 'PersistedQueryError';
  }
}

/**
 * Input validation error
 */
export class InputError extends LeavenError {
  public readonly field?: string;
  /**
   * The offending input value, retained for local inspection (logging,
   * debugging, tests). Deliberately **not** copied into `extensions`, so the
   * value never reaches the client in a formatted GraphQL response — user
   * input may contain credentials or other sensitive data. Only `field` is
   * exposed.
   */
  public readonly value?: unknown;

  constructor(
    message: string,
    options?: {
      field?: string;
      value?: unknown;
      extensions?: Record<string, unknown>;
    }
  ) {
    super(message, ErrorCode.INVALID_INPUT, {
      statusCode: 400,
      extensions: {
        ...options?.extensions,
        ...(options?.field !== undefined && { field: options.field }),
      },
    });
    this.name = 'InputError';
    this.field = options?.field;
    this.value = options?.value;
  }
}
