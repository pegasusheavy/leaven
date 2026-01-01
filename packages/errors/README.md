# @leaven-graphql/errors

Error handling and formatting utilities for Leaven.

## Installation

```bash
bun add @leaven-graphql/errors
```

## Quick Start

```typescript
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  formatError
} from '@leaven-graphql/errors';

// Throw typed errors in resolvers
const resolvers = {
  Query: {
    me: (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError('Please log in');
      }
      return context.user;
    },
  },
};
```

## Features

### Error Types

Built-in error types for common scenarios:

```typescript
import {
  LeavenError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ComplexityError,
  DepthLimitError,
  InputError,
} from '@leaven-graphql/errors';

// Base error with custom code
throw new LeavenError('Something went wrong', {
  code: 'CUSTOM_ERROR',
  statusCode: 500,
});

// Authentication required
throw new AuthenticationError('Please log in to continue');

// Permission denied
throw new AuthorizationError('You do not have permission');

// Resource not found
throw new NotFoundError('User not found', { resource: 'User', id: '123' });

// Input validation failed
throw new ValidationError('Invalid email format', {
  field: 'email',
  value: 'invalid-email',
});

// Rate limiting
throw new RateLimitError('Too many requests', {
  retryAfter: 60,
});
```

### Error Codes

Standard error codes for client handling:

| Error Type | Code | HTTP Status |
|------------|------|-------------|
| `ValidationError` | `BAD_USER_INPUT` | 400 |
| `AuthenticationError` | `UNAUTHENTICATED` | 401 |
| `AuthorizationError` | `FORBIDDEN` | 403 |
| `NotFoundError` | `NOT_FOUND` | 404 |
| `RateLimitError` | `RATE_LIMITED` | 429 |
| `ComplexityError` | `COMPLEXITY_EXCEEDED` | 400 |
| `DepthLimitError` | `DEPTH_EXCEEDED` | 400 |

### Error Formatting

Format errors for GraphQL responses:

```typescript
import { formatError, formatErrors } from '@leaven-graphql/errors';

// Format a single error
const formatted = formatError(error, {
  includeStackTrace: false,
  includeExtensions: true,
});

// Result:
// {
//   message: "User not found",
//   extensions: {
//     code: "NOT_FOUND",
//     resource: "User",
//     id: "123"
//   }
// }

// Format multiple errors
const formattedErrors = formatErrors(errors, options);
```

### Error Masking

Hide internal error details in production:

```typescript
import { maskError, formatError, isLeavenError } from '@leaven-graphql/errors';

// Mask internal errors
const maskedError = maskError(error, {
  maskMessage: 'An unexpected error occurred',
  maskInternalErrors: true,
  allowedCodes: ['BAD_USER_INPUT', 'UNAUTHENTICATED', 'FORBIDDEN'],
});

// Custom formatting with masking
function formatForProduction(error: GraphQLError) {
  if (isLeavenError(error)) {
    // Leaven errors are safe to expose
    return formatError(error);
  }
  // Mask other errors
  return maskError(error);
}
```

### Usage in Resolvers

```typescript
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from '@leaven-graphql/errors';

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError('Authentication required');
      }
      return context.user;
    },

    user: async (_, { id }, context) => {
      const user = await context.db.users.findById(id);
      if (!user) {
        throw new NotFoundError(`User ${id} not found`);
      }
      return user;
    },
  },

  Mutation: {
    deleteUser: async (_, { id }, context) => {
      if (context.user.role !== 'admin') {
        throw new AuthorizationError('Admin access required');
      }
      return context.db.users.delete(id);
    },

    createUser: async (_, { input }, context) => {
      if (!isValidEmail(input.email)) {
        throw new ValidationError('Invalid email format', {
          field: 'email',
          value: input.email,
        });
      }
      return context.db.users.create(input);
    },
  },
};
```

## API Reference

### Error Classes

```typescript
class LeavenError extends Error {
  constructor(message: string, options?: {
    code?: string;
    statusCode?: number;
    extensions?: Record<string, unknown>;
  });
}

class AuthenticationError extends LeavenError {}
class AuthorizationError extends LeavenError {}
class ValidationError extends LeavenError {}
class NotFoundError extends LeavenError {}
class RateLimitError extends LeavenError {}
class ComplexityError extends LeavenError {}
class DepthLimitError extends LeavenError {}
class InputError extends LeavenError {}
```

### Formatting Functions

```typescript
function formatError(
  error: GraphQLError,
  options?: ErrorFormatterOptions
): FormattedGraphQLError;

function formatErrors(
  errors: readonly GraphQLError[],
  options?: ErrorFormatterOptions
): FormattedGraphQLError[];

function maskError(
  error: GraphQLError,
  options?: ErrorMaskingOptions
): FormattedGraphQLError;

function isLeavenError(error: unknown): error is LeavenError;

function errorToGraphQL(error: LeavenError): GraphQLError;
```

### Error Codes

```typescript
import { ErrorCode, ERROR_CODES, getErrorCode, getErrorMessage } from '@leaven-graphql/errors';

// Get error code from an error
const code = getErrorCode(error); // 'NOT_FOUND'

// Get a standard message for a code
const message = getErrorMessage('UNAUTHENTICATED'); // 'You must be logged in'
```

## License

Apache 2.0 - Pegasus Heavy Industries LLC
