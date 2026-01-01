/**
 * @leaven-graphql/schema - Schema file loading utilities
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { buildSchema, type GraphQLSchema } from 'graphql';
import { Glob } from 'bun';
import { join, extname } from 'path';

/**
 * Options for schema loading
 */
export interface LoaderOptions {
  /** File extensions to load (default: ['.graphql', '.gql']) */
  extensions?: string[];
  /** Encoding for reading files (default: 'utf-8') */
  encoding?: BufferEncoding;
  /** Whether to recursively search directories */
  recursive?: boolean;
}

/**
 * Load a GraphQL schema from a file
 */
export async function loadSchemaFromFile(
  filePath: string,
  _options?: LoaderOptions
): Promise<GraphQLSchema> {
  const file = Bun.file(filePath);
  const exists = await file.exists();

  if (!exists) {
    throw new Error(`Schema file not found: ${filePath}`);
  }

  const content = await file.text();
  return buildSchema(content);
}

/**
 * Load GraphQL type definitions from a file
 */
export async function loadTypeDefsFromFile(
  filePath: string
): Promise<string> {
  const file = Bun.file(filePath);
  const exists = await file.exists();

  if (!exists) {
    throw new Error(`Schema file not found: ${filePath}`);
  }

  return file.text();
}

/**
 * Load and merge GraphQL schemas from a directory
 */
export async function loadSchemaFromDirectory(
  directoryPath: string,
  options?: LoaderOptions
): Promise<GraphQLSchema> {
  const typeDefs = await loadTypeDefsFromDirectory(directoryPath, options);
  return buildSchema(typeDefs.join('\n\n'));
}

/**
 * Load type definitions from a directory
 */
export async function loadTypeDefsFromDirectory(
  directoryPath: string,
  options?: LoaderOptions
): Promise<string[]> {
  const extensions = options?.extensions ?? ['.graphql', '.gql'];
  const typeDefs: string[] = [];

  const pattern = options?.recursive ? '**/*' : '*';
  const glob = new Glob(pattern);

  for await (const entry of glob.scan({ cwd: directoryPath })) {
    const ext = extname(entry);

    if (extensions.includes(ext)) {
      const filePath = join(directoryPath, entry);
      const file = Bun.file(filePath);
      const content = await file.text();
      typeDefs.push(content);
    }
  }

  if (typeDefs.length === 0) {
    throw new Error(`No schema files found in directory: ${directoryPath}`);
  }

  return typeDefs;
}

/**
 * Load and merge GraphQL schemas matching a glob pattern
 */
export async function loadSchemaFromGlob(
  pattern: string,
  options?: LoaderOptions & { cwd?: string }
): Promise<GraphQLSchema> {
  const typeDefs = await loadTypeDefsFromGlob(pattern, options);
  return buildSchema(typeDefs.join('\n\n'));
}

/**
 * Load type definitions matching a glob pattern
 */
export async function loadTypeDefsFromGlob(
  pattern: string,
  options?: LoaderOptions & { cwd?: string }
): Promise<string[]> {
  const typeDefs: string[] = [];
  const glob = new Glob(pattern);
  const cwd = options?.cwd ?? process.cwd();

  for await (const entry of glob.scan({ cwd })) {
    const filePath = join(cwd, entry);
    const file = Bun.file(filePath);
    const content = await file.text();
    typeDefs.push(content);
  }

  if (typeDefs.length === 0) {
    throw new Error(`No files found matching pattern: ${pattern}`);
  }

  return typeDefs;
}
