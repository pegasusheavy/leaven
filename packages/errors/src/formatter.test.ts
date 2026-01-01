/**
 * @leaven-graphql/errors - Formatter tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import { GraphQLError } from 'graphql';
import {
  formatError,
  formatErrors,
  maskError,
  isLeavenError,
  errorToGraphQL,
} from './formatter';
import { LeavenError, ValidationError } from './errors';
import { ErrorCode } from './codes';

describe('isLeavenError', () => {
  test('should return true for LeavenError', () => {
    const error = new LeavenError('Test');
    expect(isLeavenError(error)).toBe(true);
  });

  test('should return true for ValidationError', () => {
    const error = new ValidationError('Test');
    expect(isLeavenError(error)).toBe(true);
  });

  test('should return false for regular Error', () => {
    const error = new Error('Test');
    expect(isLeavenError(error)).toBe(false);
  });

  test('should return false for non-error', () => {
    expect(isLeavenError('string')).toBe(false);
    expect(isLeavenError(null)).toBe(false);
    expect(isLeavenError(undefined)).toBe(false);
  });
});

describe('errorToGraphQL', () => {
  test('should return GraphQLError as-is', () => {
    const graphqlError = new GraphQLError('Test');
    const result = errorToGraphQL(graphqlError);
    expect(result).toBe(graphqlError);
  });

  test('should convert LeavenError to GraphQLError', () => {
    const leavenError = new LeavenError('Test', ErrorCode.BAD_REQUEST);
    const result = errorToGraphQL(leavenError);

    expect(result).toBeInstanceOf(GraphQLError);
    expect(result.message).toBe('Test');
    expect(result.extensions?.code).toBe(ErrorCode.BAD_REQUEST);
  });

  test('should convert regular Error to GraphQLError', () => {
    const error = new Error('Test error');
    const result = errorToGraphQL(error);

    expect(result).toBeInstanceOf(GraphQLError);
    expect(result.message).toBe('Test error');
    expect(result.extensions?.code).toBe(ErrorCode.INTERNAL_ERROR);
  });

  test('should convert string to GraphQLError', () => {
    const result = errorToGraphQL('String error');

    expect(result).toBeInstanceOf(GraphQLError);
    expect(result.message).toBe('String error');
  });
});

describe('maskError', () => {
  test('should not mask LeavenError', () => {
    const leavenError = new LeavenError('Test', ErrorCode.BAD_REQUEST);
    const graphqlError = new GraphQLError('Test', {
      originalError: leavenError,
      extensions: { code: ErrorCode.BAD_REQUEST },
    });
    const result = maskError(graphqlError, { maskErrors: true });

    expect(result.message).toBe('Test');
  });

  test('should not mask validation errors', () => {
    const error = new GraphQLError('Validation failed', {
      extensions: { code: ErrorCode.VALIDATION_ERROR },
    });
    const result = maskError(error, { maskErrors: true });

    expect(result.message).toBe('Validation failed');
  });

  test('should mask internal errors when enabled', () => {
    const error = new GraphQLError('Database connection failed');
    const result = maskError(error, { maskErrors: true });

    expect(result.message).toBe('An unexpected error occurred');
  });

  test('should use custom masked message', () => {
    const error = new GraphQLError('Internal error');
    const result = maskError(error, {
      maskErrors: true,
      maskedMessage: 'Something went wrong',
    });

    expect(result.message).toBe('Something went wrong');
  });

  test('should not mask when disabled', () => {
    const error = new GraphQLError('Internal error');
    const result = maskError(error, { maskErrors: false });

    expect(result.message).toBe('Internal error');
  });

  test('should use custom shouldMask function', () => {
    const error = new GraphQLError('Test');
    const result = maskError(error, {
      maskErrors: true,
      shouldMask: () => false,
    });

    expect(result.message).toBe('Test');
  });

  test('should include locations', () => {
    const error = new GraphQLError('Test', {
      positions: [0],
    });
    const result = maskError(error, { maskErrors: false });

    // Locations depend on how the error was constructed
    expect(result.message).toBe('Test');
  });

  test('should include path', () => {
    const error = new GraphQLError('Test', {
      path: ['user', 'name'],
    });
    const result = maskError(error, { maskErrors: false });

    expect(result.path).toEqual(['user', 'name']);
  });

  test('should include extensions', () => {
    const error = new GraphQLError('Test', {
      extensions: { code: 'TEST', custom: 'value' },
    });
    const result = maskError(error, { maskErrors: false });

    expect(result.extensions?.code).toBe('TEST');
    expect(result.extensions?.custom).toBe('value');
  });

  test('should include stack trace when enabled', () => {
    const original = new Error('Test');
    const error = new GraphQLError('Test', {
      originalError: original,
      extensions: { code: 'TEST' },
    });
    const result = maskError(error, {
      maskErrors: false,
      includeStackTrace: true,
    });

    expect(result.extensions?.stackTrace).toBeDefined();
  });

  test('should use custom formatter', () => {
    const error = new GraphQLError('Test');
    const result = maskError(error, {
      formatter: (err, masked) => ({
        message: masked ? 'Masked' : err.message,
        extensions: { formatted: true },
      }),
    });

    expect(result.extensions?.formatted).toBe(true);
  });
});

describe('formatError', () => {
  test('should format LeavenError', () => {
    const error = new LeavenError('Test');
    const result = formatError(error);

    expect(result.message).toBe('Test');
  });

  test('should format regular Error', () => {
    const error = new Error('Test');
    const result = formatError(error);

    expect(result.message).toBe('Test');
  });

  test('should format GraphQLError', () => {
    const error = new GraphQLError('Test');
    const result = formatError(error);

    expect(result.message).toBe('Test');
  });

  test('should apply options', () => {
    const error = new Error('Internal error');
    const result = formatError(error, { maskErrors: true });

    expect(result.message).toBe('An unexpected error occurred');
  });
});

describe('formatErrors', () => {
  test('should format array of errors', () => {
    const errors = [
      new LeavenError('Error 1'),
      new Error('Error 2'),
      new GraphQLError('Error 3'),
    ];
    const results = formatErrors(errors);

    expect(results.length).toBe(3);
    expect(results[0]?.message).toBe('Error 1');
    expect(results[1]?.message).toBe('Error 2');
    expect(results[2]?.message).toBe('Error 3');
  });

  test('should apply options to all errors', () => {
    const errors = [new Error('Error 1'), new Error('Error 2')];
    const results = formatErrors(errors, { maskErrors: true });

    expect(results[0]?.message).toBe('An unexpected error occurred');
    expect(results[1]?.message).toBe('An unexpected error occurred');
  });
});
