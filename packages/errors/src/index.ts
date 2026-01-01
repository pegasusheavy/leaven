/**
 * @leaven-graphql/errors - Error handling utilities for Leaven
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

export {
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

export {
  formatError,
  formatErrors,
  maskError,
  isLeavenError,
  errorToGraphQL,
  type ErrorFormatter,
  type ErrorMaskingOptions,
} from './formatter';

export {
  ErrorCode,
  ERROR_CODES,
  getErrorCode,
  getErrorMessage,
} from './codes';
