/**
 * @leaven-graphql/nestjs - Schema Builder Integration
 *
 * Provides integration with NestJS's code-first schema building approach.
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { Injectable, type OnModuleInit, Inject, type Type } from '@nestjs/common';
import type { GraphQLSchema } from 'graphql';
import { LEAVEN_MODULE_OPTIONS, LEAVEN_DRIVER } from './module';
import { LeavenDriver } from './driver';
import type { LeavenModuleOptions, BuildSchemaOptions } from './types';

/**
 * Schema source type - determines how to build the schema
 */
export type SchemaSource =
  | { type: 'provided'; schema: GraphQLSchema }
  | { type: 'typeDefs'; typeDefs: string; resolvers: Record<string, unknown> }
  | { type: 'autoSchema'; options: BuildSchemaOptions };

/**
 * Schema builder service
 *
 * Handles building the GraphQL schema from various sources and
 * integrating it with the Leaven driver.
 */
@Injectable()
export class SchemaBuilderService implements OnModuleInit {
  private builtSchema: GraphQLSchema | null = null;

  constructor(
    @Inject(LEAVEN_MODULE_OPTIONS) private readonly options: LeavenModuleOptions,
    @Inject(LEAVEN_DRIVER) private readonly driver: LeavenDriver
  ) {}

  /**
   * Initialize the schema on module init
   */
  public async onModuleInit(): Promise<void> {
    const schema = await this.buildSchema();
    if (schema) {
      this.builtSchema = schema;
      this.driver.setSchema(schema);
    }
  }

  /**
   * Build the schema from configured sources
   */
  public async buildSchema(): Promise<GraphQLSchema | null> {
    // If a pre-built schema is provided, use it directly
    if (this.options.schema) {
      return this.options.schema;
    }

    // If typeDefs are provided, build from SDL
    if (this.options.typeDefs) {
      return this.buildFromTypeDefs();
    }

    // If autoSchemaFile is set, we need NestJS's schema builder
    // This would typically be handled by @nestjs/graphql
    if (this.options.autoSchemaFile) {
      // Auto schema is handled by external integration
      return null;
    }

    return null;
  }

  /**
   * Build schema from type definitions (SDL)
   */
  private buildFromTypeDefs(): GraphQLSchema | null {
    const { typeDefs, resolvers } = this.options;

    if (!typeDefs || !resolvers) {
      return null;
    }

    // Use graphql-tools style schema building
    try {
      const { buildSchema } = require('graphql');
      const { addResolversToSchema, makeExecutableSchema } = require('@graphql-tools/schema');

      // Try makeExecutableSchema first (recommended)
      if (makeExecutableSchema) {
        return makeExecutableSchema({
          typeDefs,
          resolvers,
        });
      }

      // Fallback to manual approach
      const schema = buildSchema(
        typeof typeDefs === 'string' ? typeDefs : this.mergeTypeDefs(typeDefs)
      );

      if (addResolversToSchema) {
        return addResolversToSchema({
          schema,
          resolvers: Array.isArray(resolvers)
            ? this.mergeResolvers(resolvers)
            : resolvers,
        });
      }

      return schema;
    } catch (error) {
      console.warn(
        'Failed to build schema from typeDefs. Install @graphql-tools/schema for full support.',
        error
      );
      return null;
    }
  }

  /**
   * Merge multiple type definition strings
   */
  private mergeTypeDefs(typeDefs: unknown): string {
    if (typeof typeDefs === 'string') {
      return typeDefs;
    }

    if (Array.isArray(typeDefs)) {
      return typeDefs
        .map((td) => {
          if (typeof td === 'string') {
            return td;
          }
          // Handle DocumentNode - convert to string
          const { print } = require('graphql');
          return print(td);
        })
        .join('\n');
    }

    // Handle DocumentNode
    const { print } = require('graphql');
    return print(typeDefs);
  }

  /**
   * Merge multiple resolver objects
   */
  private mergeResolvers(resolvers: Array<Record<string, unknown>>): Record<string, unknown> {
    return resolvers.reduce((merged, resolver) => {
      for (const [typeName, fields] of Object.entries(resolver)) {
        merged[typeName] = {
          ...(merged[typeName] as Record<string, unknown> || {}),
          ...(fields as Record<string, unknown>),
        };
      }
      return merged;
    }, {} as Record<string, unknown>);
  }

  /**
   * Get the built schema
   */
  public getSchema(): GraphQLSchema | null {
    return this.builtSchema;
  }

  /**
   * Set a new schema (for hot-reloading scenarios)
   */
  public setSchema(schema: GraphQLSchema): void {
    this.builtSchema = schema;
    this.driver.setSchema(schema);
  }

  /**
   * Check if schema is ready
   */
  public isSchemaReady(): boolean {
    return this.builtSchema !== null;
  }
}

/**
 * Schema file generator options
 */
export interface SchemaFileOptions {
  /**
   * Path to write the schema file
   */
  path: string;

  /**
   * Sort schema alphabetically
   */
  sortSchema?: boolean;

  /**
   * Include comments/descriptions
   */
  includeDescriptions?: boolean;
}

/**
 * Generate a schema file from the current schema
 */
export async function generateSchemaFile(
  schema: GraphQLSchema,
  options: SchemaFileOptions
): Promise<void> {
  const { printSchema, lexicographicSortSchema } = require('graphql');
  const { writeFile } = require('node:fs/promises');

  let schemaToWrite = schema;

  if (options.sortSchema) {
    schemaToWrite = lexicographicSortSchema(schema);
  }

  const sdl = printSchema(schemaToWrite);
  await writeFile(options.path, sdl, 'utf-8');
}

/**
 * Resolver decorator metadata storage
 */
export interface ResolverMetadata {
  type: 'Query' | 'Mutation' | 'Subscription' | 'Field';
  name: string;
  returnType: Type<unknown> | string;
  target: Type<unknown>;
  methodName: string;
  args?: Array<{
    name: string;
    type: Type<unknown> | string;
    nullable?: boolean;
  }>;
}

/**
 * Global resolver metadata storage
 */
const resolverMetadataStorage: ResolverMetadata[] = [];

/**
 * Get all registered resolver metadata
 */
export function getResolverMetadata(): ResolverMetadata[] {
  return [...resolverMetadataStorage];
}

/**
 * Register resolver metadata
 */
export function registerResolverMetadata(metadata: ResolverMetadata): void {
  resolverMetadataStorage.push(metadata);
}

/**
 * Clear resolver metadata (for testing)
 */
export function clearResolverMetadata(): void {
  resolverMetadataStorage.length = 0;
}
