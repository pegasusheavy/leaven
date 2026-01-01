/**
 * @leaven-graphql/schema - Schema merging utilities
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import {
  GraphQLSchema,
  buildSchema,
  printSchema,
  parse,
  buildASTSchema,
  type DocumentNode,
} from 'graphql';

import type { Resolvers } from './resolvers';

/**
 * Options for schema merging
 */
export interface MergeOptions {
  /** How to handle type conflicts */
  onTypeConflict?: 'error' | 'first' | 'last';
  /** Whether to include built-in directives */
  includeBuiltInDirectives?: boolean;
  /** Custom type merger */
  typeMerger?: (
    typeName: string,
    types: Array<{ schema: GraphQLSchema; type: unknown }>
  ) => unknown;
}

/**
 * Merge multiple GraphQL schemas into one
 */
export function mergeSchemas(
  schemas: GraphQLSchema[],
  resolvers?: Resolvers,
  options?: MergeOptions
): GraphQLSchema {
  if (schemas.length === 0) {
    throw new Error('At least one schema is required');
  }

  if (schemas.length === 1 && !resolvers) {
    return schemas[0]!;
  }

  // Collect all type definitions
  const typeDefs: string[] = [];

  for (const schema of schemas) {
    const printed = printSchema(schema);
    typeDefs.push(printed);
  }

  // Merge type definitions
  const mergedTypeDef = mergeTypeDefinitions(typeDefs, options);

  // Build the merged schema
  const mergedSchema = buildSchema(mergedTypeDef);

  // Apply resolvers if provided
  if (resolvers) {
    return addResolversToSchema(mergedSchema, resolvers);
  }

  return mergedSchema;
}

/**
 * Merge GraphQL schemas from SDL strings
 */
export function mergeSchemasFromStrings(
  typeDefs: string[],
  resolvers?: Resolvers,
  options?: MergeOptions
): GraphQLSchema {
  const mergedTypeDef = mergeTypeDefinitions(typeDefs, options);
  const schema = buildSchema(mergedTypeDef);

  if (resolvers) {
    return addResolversToSchema(schema, resolvers);
  }

  return schema;
}

/**
 * Merge type definition strings
 */
function mergeTypeDefinitions(
  typeDefs: string[],
  options?: MergeOptions
): string {
  const documents: DocumentNode[] = typeDefs.map((td) => parse(td));

  const typeMap = new Map<string, { kind: string; definitions: unknown[] }>();

  for (const document of documents) {
    for (const definition of document.definitions) {
      const def = definition as { kind: string; name?: { value: string } };

      if (!def.name) continue;

      const name = def.name.value;
      const existing = typeMap.get(name);

      if (existing) {
        if (options?.onTypeConflict === 'error') {
          throw new Error(`Type conflict: ${name} is defined multiple times`);
        }

        // For extend types, merge the definitions
        if (
          def.kind.startsWith('TypeExtension') ||
          existing.kind.startsWith('TypeExtension')
        ) {
          existing.definitions.push(definition);
        } else if (options?.onTypeConflict === 'last') {
          typeMap.set(name, { kind: def.kind, definitions: [definition] });
        }
        // 'first' is the default - keep existing
      } else {
        typeMap.set(name, { kind: def.kind, definitions: [definition] });
      }
    }
  }

  // Rebuild the merged SDL
  const mergedDefinitions: unknown[] = [];
  for (const { definitions } of typeMap.values()) {
    mergedDefinitions.push(...definitions);
  }

  // Create a merged document
  const mergedDocument: DocumentNode = {
    kind: 'Document' as const,
    definitions: mergedDefinitions as DocumentNode['definitions'],
  };

  try {
    const schema = buildASTSchema(mergedDocument);
    return printSchema(schema);
  } catch {
    // If merging fails, try a simpler approach
    return typeDefs.join('\n\n');
  }
}

/**
 * Add resolvers to an existing schema
 */
function addResolversToSchema(
  schema: GraphQLSchema,
  resolvers: Resolvers
): GraphQLSchema {
  const typeMap = schema.getTypeMap();

  for (const [typeName, typeResolvers] of Object.entries(resolvers)) {
    const type = typeMap[typeName];

    if (!type) continue;

    if ('getFields' in type) {
      const fields = (type as { getFields: () => Record<string, { resolve?: unknown; subscribe?: unknown }> }).getFields();

      for (const [fieldName, resolver] of Object.entries(typeResolvers)) {
        const field = fields[fieldName];

        if (!field) continue;

        if (typeof resolver === 'function') {
          field.resolve = resolver;
        } else if (typeof resolver === 'object') {
          if ('resolve' in resolver) {
            field.resolve = resolver.resolve;
          }
          if ('subscribe' in resolver) {
            field.subscribe = resolver.subscribe;
          }
        }
      }
    }
  }

  return schema;
}
