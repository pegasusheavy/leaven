/**
 * @leaven-graphql/errors - Error formatting utilities
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { GraphQLError, type GraphQLFormattedError } from 'graphql';
import { LeavenError } from './errors';
import { ErrorCode } from './codes';

/**
 * Custom error formatter function
 */
export type ErrorFormatter = (
  error: GraphQLError,
  masked: boolean
) => GraphQLFormattedError;

/**
 * Options for error masking
 */
export interface ErrorMaskingOptions {
  /** Enable error masking in production */
  maskErrors?: boolean;
  /** Message to show for masked errors */
  maskedMessage?: string;
  /** Predicate to determine if an error should be masked */
  shouldMask?: (error: GraphQLError) => boolean;
  /** Include stack traces in development */
  includeStackTrace?: boolean;
  /** Custom error formatter */
  formatter?: ErrorFormatter;
}

/**
 * Check if an error is a Leaven error
 */
export function isLeavenError(error: unknown): error is LeavenError {
  return error instanceof LeavenError;
}

/**
 * Convert any error to a GraphQL error
 */
export function errorToGraphQL(error: unknown): GraphQLError {
  if (error instanceof GraphQLError) {
    return error;
  }

  if (isLeavenError(error)) {
    return error.toGraphQLError();
  }

  if (error instanceof Error) {
    return new GraphQLError(error.message, {
      originalError: error,
      extensions: {
        code: ErrorCode.INTERNAL_ERROR,
      },
    });
  }

  return new GraphQLError(String(error), {
    extensions: {
      code: ErrorCode.INTERNAL_ERROR,
    },
  });
}

/**
 * Check if an error should be masked
 */
function shouldMaskError(
  error: GraphQLError,
  options: ErrorMaskingOptions
): boolean {
  // Use custom predicate if provided
  if (options.shouldMask) {
    return options.shouldMask(error);
  }

  // Don't mask Leaven errors (they're intentional)
  const originalError = error.originalError;
  if (isLeavenError(originalError)) {
    return false;
  }

  // Don't mask validation errors
  const code = error.extensions?.code as string | undefined;
  if (code === ErrorCode.VALIDATION_ERROR || code === ErrorCode.PARSE_ERROR) {
    return false;
  }

  // Mask all other errors in production
  return options.maskErrors ?? false;
}

/**
 * Mask sensitive error information
 */
export function maskError(
  error: GraphQLError,
  options: ErrorMaskingOptions = {}
): GraphQLFormattedError {
  const shouldMask = shouldMaskError(error, options);

  // Use custom formatter if provided
  if (options.formatter) {
    return options.formatter(error, shouldMask);
  }

  if (shouldMask) {
    return {
      message: options.maskedMessage ?? 'An unexpected error occurred',
      extensions: {
        code: ErrorCode.INTERNAL_ERROR,
      },
    };
  }

  // Build the formatted error using a mutable intermediate object
  const formatted: {
    message: string;
    locations?: typeof error.locations;
    path?: typeof error.path;
    extensions?: Record<string, unknown>;
  } = {
    message: error.message,
  };

  // Include locations if available
  if (error.locations && error.locations.length > 0) {
    formatted.locations = error.locations;
  }

  // Include path if available
  if (error.path && error.path.length > 0) {
    formatted.path = error.path;
  }

  // Include extensions
  if (error.extensions && Object.keys(error.extensions).length > 0) {
    formatted.extensions = { ...error.extensions };

    // Add stack trace in development if enabled
    if (options.includeStackTrace && error.originalError?.stack) {
      formatted.extensions.stackTrace = error.originalError.stack
        .split('\n')
        .map((line) => line.trim());
    }
  }

  return formatted as GraphQLFormattedError;
}

/**
 * Format a single error
 */
export function formatError(
  error: unknown,
  options: ErrorMaskingOptions = {}
): GraphQLFormattedError {
  const graphqlError = errorToGraphQL(error);
  return maskError(graphqlError, options);
}

/**
 * Format an array of errors
 */
export function formatErrors(
  errors: readonly unknown[],
  options: ErrorMaskingOptions = {}
): GraphQLFormattedError[] {
  return errors.map((error) => formatError(error, options));
}
