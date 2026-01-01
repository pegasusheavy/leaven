/**
 * @leaven-graphql/errors - Error classes tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import {
  LeavenError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ComplexityError,
  DepthLimitError,
  PersistedQueryError,
  InputError,
} from './errors';
import { ErrorCode } from './codes';

describe('LeavenError', () => {
  test('should create error with message', () => {
    const error = new LeavenError('Test error');

    expect(error.message).toBe('Test error');
    expect(error.name).toBe('LeavenError');
    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(error.statusCode).toBe(500);
  });

  test('should create error with custom code', () => {
    const error = new LeavenError('Bad request', ErrorCode.BAD_REQUEST);

    expect(error.code).toBe(ErrorCode.BAD_REQUEST);
    expect(error.statusCode).toBe(400);
  });

  test('should create error with custom status code', () => {
    const error = new LeavenError('Custom error', ErrorCode.INTERNAL_ERROR, {
      statusCode: 503,
    });

    expect(error.statusCode).toBe(503);
  });

  test('should include extensions', () => {
    const error = new LeavenError('Error', ErrorCode.BAD_REQUEST, {
      extensions: { field: 'test' },
    });

    expect(error.extensions.field).toBe('test');
    expect(error.extensions.code).toBe(ErrorCode.BAD_REQUEST);
  });

  test('should convert to GraphQL error', () => {
    const error = new LeavenError('Test error', ErrorCode.BAD_REQUEST);
    const graphqlError = error.toGraphQLError();

    expect(graphqlError.message).toBe('Test error');
    expect(graphqlError.extensions?.code).toBe(ErrorCode.BAD_REQUEST);
  });

  test('should convert to JSON', () => {
    const error = new LeavenError('Test error', ErrorCode.BAD_REQUEST);
    const json = error.toJSON();

    expect(json.message).toBe('Test error');
    expect(json.code).toBe(ErrorCode.BAD_REQUEST);
    expect(json.statusCode).toBe(400);
  });

  test('should include original error', () => {
    const original = new Error('Original');
    const error = new LeavenError('Wrapped', ErrorCode.INTERNAL_ERROR, {
      originalError: original,
    });

    expect(error.originalError).toBe(original);
  });
});

describe('ValidationError', () => {
  test('should create validation error', () => {
    const error = new ValidationError('Validation failed');

    expect(error.message).toBe('Validation failed');
    expect(error.name).toBe('ValidationError');
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.statusCode).toBe(400);
  });

  test('should include validation errors', () => {
    const validationErrors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'name', message: 'Required' },
    ];
    const error = new ValidationError('Validation failed', validationErrors);

    expect(error.validationErrors).toEqual(validationErrors);
    expect(error.extensions.validationErrors).toEqual(validationErrors);
  });
});

describe('AuthenticationError', () => {
  test('should create with default message', () => {
    const error = new AuthenticationError();

    expect(error.message).toBe('Authentication required');
    expect(error.name).toBe('AuthenticationError');
    expect(error.code).toBe(ErrorCode.UNAUTHENTICATED);
    expect(error.statusCode).toBe(401);
  });

  test('should create with custom message', () => {
    const error = new AuthenticationError('Token expired');

    expect(error.message).toBe('Token expired');
  });
});

describe('AuthorizationError', () => {
  test('should create with default message', () => {
    const error = new AuthorizationError();

    expect(error.message).toBe('Access denied');
    expect(error.name).toBe('AuthorizationError');
    expect(error.code).toBe(ErrorCode.FORBIDDEN);
    expect(error.statusCode).toBe(403);
  });

  test('should create with custom message', () => {
    const error = new AuthorizationError('Insufficient permissions');

    expect(error.message).toBe('Insufficient permissions');
  });
});

describe('NotFoundError', () => {
  test('should create with default message', () => {
    const error = new NotFoundError();

    expect(error.message).toBe('Resource not found');
    expect(error.name).toBe('NotFoundError');
    expect(error.code).toBe(ErrorCode.NOT_FOUND);
    expect(error.statusCode).toBe(404);
  });

  test('should include resource info', () => {
    const error = new NotFoundError('User not found', {
      resourceType: 'User',
      resourceId: '123',
    });

    expect(error.resourceType).toBe('User');
    expect(error.resourceId).toBe('123');
    expect(error.extensions.resourceType).toBe('User');
  });
});

describe('RateLimitError', () => {
  test('should create with default message', () => {
    const error = new RateLimitError();

    expect(error.message).toBe('Rate limit exceeded');
    expect(error.name).toBe('RateLimitError');
    expect(error.code).toBe(ErrorCode.RATE_LIMITED);
    expect(error.statusCode).toBe(429);
  });

  test('should include retry after', () => {
    const error = new RateLimitError('Too many requests', {
      retryAfter: 60,
    });

    expect(error.retryAfter).toBe(60);
    expect(error.extensions.retryAfter).toBe(60);
  });
});

describe('ComplexityError', () => {
  test('should create with complexity info', () => {
    const error = new ComplexityError(150, 100);

    expect(error.message).toContain('150');
    expect(error.message).toContain('100');
    expect(error.name).toBe('ComplexityError');
    expect(error.code).toBe(ErrorCode.COMPLEXITY_LIMIT);
    expect(error.complexity).toBe(150);
    expect(error.maxComplexity).toBe(100);
  });
});

describe('DepthLimitError', () => {
  test('should create with depth info', () => {
    const error = new DepthLimitError(10, 5);

    expect(error.message).toContain('10');
    expect(error.message).toContain('5');
    expect(error.name).toBe('DepthLimitError');
    expect(error.code).toBe(ErrorCode.DEPTH_LIMIT);
    expect(error.depth).toBe(10);
    expect(error.maxDepth).toBe(5);
  });
});

describe('PersistedQueryError', () => {
  test('should create not found error', () => {
    const error = new PersistedQueryError('Query not found');

    expect(error.message).toBe('Query not found');
    expect(error.name).toBe('PersistedQueryError');
    expect(error.code).toBe(ErrorCode.PERSISTED_QUERY_NOT_FOUND);
  });

  test('should create invalid error', () => {
    const error = new PersistedQueryError(
      'Invalid query',
      ErrorCode.PERSISTED_QUERY_INVALID
    );

    expect(error.code).toBe(ErrorCode.PERSISTED_QUERY_INVALID);
  });
});

describe('InputError', () => {
  test('should create input error', () => {
    const error = new InputError('Invalid value');

    expect(error.message).toBe('Invalid value');
    expect(error.name).toBe('InputError');
    expect(error.code).toBe(ErrorCode.INVALID_INPUT);
  });

  test('should include field info', () => {
    const error = new InputError('Invalid email format', {
      field: 'email',
      value: 'not-an-email',
    });

    expect(error.field).toBe('email');
    expect(error.value).toBe('not-an-email');
    expect(error.extensions.field).toBe('email');
  });
});
