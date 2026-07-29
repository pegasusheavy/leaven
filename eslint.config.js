/**
 * ESLint configuration for Leaven
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 */

import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
      'docs/**',
    ],
  },

  // TypeScript files configuration
  {
    files: ['packages/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Type-aware linting. The root tsconfig.json is solution-style
        // (references only, no `include`), so `project: './tsconfig.json'`
        // cannot resolve any source file. `projectService` (typescript-eslint
        // v8+) asks the TS language service for the owning project instead,
        // which resolves each file through its own packages/*/tsconfig.json.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Require explicit visibility modifiers on class members
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'no-public', // Constructors don't need 'public'
            accessors: 'explicit',
            methods: 'explicit',
            properties: 'explicit',
            parameterProperties: 'explicit',
          },
        },
      ],

      // Additional TypeScript best practices
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // General best practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',

      // Packages ship as ESM and are consumed under Bun, where a CommonJS
      // `require()` call is not statically analysable and defeats bundling.
      // Use a static `import` (or `await import()`) instead.
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='require']",
          message:
            'Use a static import instead of require(); CommonJS require() is not supported in the published ESM builds.',
        },
      ],
    },
  },

  // Test files - relax some rules
  {
    files: ['packages/**/*.test.ts'],
    rules: {
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      // Tests are not published, so a CommonJS require() there does not reach
      // consumers. The rule stays on for every non-test file in packages/.
      'no-restricted-syntax': 'off',
    },
  },
];
