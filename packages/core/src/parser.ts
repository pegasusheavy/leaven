/**
 * @leaven-graphql/core - GraphQL parsing and validation
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import {
  parse,
  validate,
  type DocumentNode,
  type GraphQLSchema,
  type GraphQLError,
  type ParseOptions as GraphQLParseOptions,
  getOperationAST,
  Kind,
} from 'graphql';

import type { OperationType, ParsedRequest, GraphQLRequest } from './types';

/**
 * Options for parsing GraphQL documents
 */
export interface ParseOptions {
  /** Enable caching of parsed documents */
  cache?: boolean;
  /** GraphQL parse options */
  graphqlOptions?: GraphQLParseOptions;
  /** Maximum query depth allowed */
  maxDepth?: number;
  /** Maximum number of tokens allowed */
  maxTokens?: number;
}

/**
 * Result of document validation
 */
export interface ValidationResult {
  /** Whether the document is valid */
  valid: boolean;
  /** Validation errors if invalid */
  errors: readonly GraphQLError[];
  /** Warnings that don't prevent execution */
  warnings?: readonly GraphQLError[];
}

/**
 * Parse a GraphQL query string into a document node
 */
export function parseDocument(query: string, options?: ParseOptions): DocumentNode {
  const parseOptions: GraphQLParseOptions = {
    noLocation: false,
    ...options?.graphqlOptions,
  };

  try {
    const document = parse(query, parseOptions);

    // Validate query depth if specified
    if (options?.maxDepth !== undefined) {
      const depth = calculateQueryDepth(document);
      if (depth > options.maxDepth) {
        throw new Error(`Query depth of ${depth} exceeds maximum allowed depth of ${options.maxDepth}`);
      }
    }

    return document;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse GraphQL query');
  }
}

/**
 * Validate a GraphQL document against a schema
 */
export function validateDocument(
  schema: GraphQLSchema,
  document: DocumentNode,
  options?: { rules?: readonly unknown[] }
): ValidationResult {
  const errors = validate(schema, document, options?.rules as undefined);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate the depth of a GraphQL query
 */
export function calculateQueryDepth(document: DocumentNode): number {
  let maxDepth = 0;

  function traverse(node: unknown, currentDepth: number): void {
    if (!node || typeof node !== 'object') return;

    const typedNode = node as { kind?: string; selectionSet?: { selections: unknown[] } };

    if (typedNode.kind === Kind.FIELD) {
      maxDepth = Math.max(maxDepth, currentDepth);
    }

    if (typedNode.selectionSet) {
      for (const selection of typedNode.selectionSet.selections) {
        traverse(selection, currentDepth + 1);
      }
    }
  }

  for (const definition of document.definitions) {
    if ((definition as { kind: string }).kind === Kind.OPERATION_DEFINITION) {
      const opDef = definition as { selectionSet?: { selections: unknown[] } };
      if (opDef.selectionSet) {
        for (const selection of opDef.selectionSet.selections) {
          traverse(selection, 1);
        }
      }
    }
  }

  return maxDepth;
}

/**
 * Extract operation type from a document
 */
export function getOperationType(
  document: DocumentNode,
  operationName?: string
): OperationType | null {
  const operation = getOperationAST(document, operationName);
  if (!operation) return null;

  return operation.operation as OperationType;
}

/**
 * Parse and extract full request information
 */
export function parseRequest(
  request: GraphQLRequest,
  options?: ParseOptions
): ParsedRequest {
  const document = parseDocument(request.query, options);
  const operation = getOperationAST(document, request.operationName);

  if (!operation) {
    throw new Error(
      request.operationName
        ? `Operation "${request.operationName}" not found in document`
        : 'No operation found in document'
    );
  }

  return {
    ...request,
    document,
    operation,
    operationType: operation.operation as OperationType,
  };
}

/**
 * Count the number of fields in a document
 */
export function countFields(document: DocumentNode): number {
  let count = 0;

  function traverse(node: unknown): void {
    if (!node || typeof node !== 'object') return;

    const typedNode = node as { kind?: string; selectionSet?: { selections: unknown[] } };

    if (typedNode.kind === Kind.FIELD) {
      count++;
    }

    if (typedNode.selectionSet) {
      for (const selection of typedNode.selectionSet.selections) {
        traverse(selection);
      }
    }
  }

  for (const definition of document.definitions) {
    traverse(definition);
  }

  return count;
}

/**
 * Get all operation names from a document
 */
export function getOperationNames(document: DocumentNode): string[] {
  const names: string[] = [];

  for (const definition of document.definitions) {
    if ((definition as { kind: string }).kind === Kind.OPERATION_DEFINITION) {
      const opDef = definition as { name?: { value: string } };
      if (opDef.name) {
        names.push(opDef.name.value);
      }
    }
  }

  return names;
}
