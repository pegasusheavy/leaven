# Contributing to Leaven

Thank you for your interest in contributing to Leaven! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- [pnpm](https://pnpm.io/) (v9+)
- [Git](https://git-scm.com/)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/leaven.git
   cd leaven
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Run tests to verify setup:
   ```bash
   pnpm test
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names:
- `feat/add-caching-plugin` - New features
- `fix/validation-error-message` - Bug fixes
- `docs/update-readme` - Documentation
- `refactor/executor-cleanup` - Refactoring
- `test/add-cache-tests` - Test additions

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```

2. Make your changes following our [code style guidelines](#code-style)

3. Write or update tests as needed

4. Run the test suite:
   ```bash
   pnpm test
   ```

5. Run the linter:
   ```bash
   pnpm lint
   ```

6. Run the type checker:
   ```bash
   pnpm typecheck
   ```

7. Add a changeset (for user-facing changes):
   ```bash
   pnpm changeset
   ```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Adding or updating tests
- `build` - Build system or dependencies
- `ci` - CI/CD configuration
- `chore` - Other changes

**Examples:**
```
feat(core): add validation caching to executor
fix(http): handle empty request body
docs(readme): update installation instructions
```

## Code Style

### TypeScript Guidelines

1. **Explicit visibility modifiers** on all class members:
   ```typescript
   // ✅ Good
   public readonly name: string;
   private cache: Map<string, unknown>;

   // ❌ Bad
   readonly name: string;
   ```

2. **Explicit return types** on public methods:
   ```typescript
   // ✅ Good
   public execute(): ExecutionResult { }

   // ❌ Bad
   public execute() { }
   ```

3. **Use `type` imports** for type-only imports:
   ```typescript
   import type { GraphQLSchema } from 'graphql';
   ```

4. **Prefix unused variables** with underscore:
   ```typescript
   function handler(_event: Event, data: Data) { }
   ```

### File Headers

All source files should include the standard header:
```typescript
/**
 * @leaven-graphql/package-name - Brief description
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */
```

### Testing

- Tests go alongside source files with `.test.ts` suffix
- Use Bun's built-in test runner
- Aim for 90%+ code coverage
- Write descriptive test names

```typescript
import { describe, test, expect } from 'bun:test';

describe('ClassName', () => {
  describe('methodName', () => {
    test('should do expected behavior', () => {
      // ...
    });
  });
});
```

## Pull Request Process

1. **Before submitting:**
   - Ensure all tests pass
   - Ensure linter passes
   - Ensure type checker passes
   - Add changeset for user-facing changes
   - Update documentation if needed

2. **PR Title:** Follow conventional commit format

3. **PR Description:** Use the PR template and fill out all sections

4. **Review Process:**
   - PRs require at least one approval
   - Address all review comments
   - Keep PR scope focused

5. **After Merge:**
   - Delete your branch
   - The changeset will be included in the next release

## Package Development

When creating or modifying packages:

1. Follow the existing package structure
2. Export types and functions from `index.ts`
3. Include a comprehensive `README.md`
4. Add package to the main `package.json` workspace
5. Update documentation site if applicable

## Questions?

- Open a [Discussion](https://github.com/pegasusheavy/leaven/discussions)
- Check existing [Issues](https://github.com/pegasusheavy/leaven/issues)

Thank you for contributing! 🎉
