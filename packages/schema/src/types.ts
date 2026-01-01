/**
 * @leaven-graphql/schema - Type definitions
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

// GraphQL types are used via the builder, not directly in this file

/**
 * Custom scalar configuration
 */
export interface ScalarConfig {
  /** Scalar name */
  name: string;
  /** Description */
  description?: string;
  /** Serialize a value for the client */
  serialize: (value: unknown) => unknown;
  /** Parse a value from the client */
  parseValue: (value: unknown) => unknown;
  /** Parse a literal value from the query */
  parseLiteral?: (ast: unknown) => unknown;
}

/**
 * Enum configuration
 */
export interface EnumConfig {
  /** Enum name */
  name: string;
  /** Description */
  description?: string;
  /** Enum values */
  values: Record<string, { value?: unknown; description?: string; deprecationReason?: string }>;
}

/**
 * Interface configuration
 */
export interface InterfaceConfig {
  /** Interface name */
  name: string;
  /** Description */
  description?: string;
  /** Fields */
  fields: Record<string, { type: string; description?: string; args?: Record<string, { type: string; description?: string; defaultValue?: unknown }> }>;
  /** Resolve type function */
  resolveType?: (value: unknown, context: unknown, info: unknown) => string | null;
}

/**
 * Union configuration
 */
export interface UnionConfig {
  /** Union name */
  name: string;
  /** Description */
  description?: string;
  /** Types in the union */
  types: string[];
  /** Resolve type function */
  resolveType?: (value: unknown, context: unknown, info: unknown) => string | null;
}
