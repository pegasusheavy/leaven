/**
 * @leaven-graphql/nestjs - Schema Builder Integration
 *
 * Builds the module's `GraphQLSchema` from a pre-built `schema` or from SDL
 * `typeDefs` (optionally merged with a `resolvers` map) and hands it to the
 * driver. Code-first generation (`autoSchemaFile`) is not implemented and
 * fails at bootstrap rather than silently.
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 */

import { Injectable, type OnModuleInit, Inject, type Type } from '@nestjs/common';
import {
  buildSchema as buildSchemaFromSDL,
  lexicographicSortSchema,
  parse,
  print,
  printSchema,
  visit,
  type DocumentNode,
  type GraphQLNamedType,
  type GraphQLObjectType,
  type GraphQLSchema,
} from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { LEAVEN_MODULE_OPTIONS, LEAVEN_DRIVER } from './module';
import { LeavenDriver } from './driver';
import { DEPRECATED_KEY, DESCRIPTION_KEY } from './decorators';
import type { LeavenModuleOptions, BuildSchemaOptions } from './types';

/**
 * Resolver map as accepted by {@link LeavenModuleOptions.resolvers}.
 */
type ResolverMap = Record<string, unknown> | Array<Record<string, unknown>>;

/**
 * Schema source type - determines how to build the schema
 *
 * {@link SchemaBuilderService.buildSchema} narrows on a value of this type,
 * so every supported configuration is enumerated here exactly once.
 */
export type SchemaSource =
  | { type: 'provided'; schema: GraphQLSchema }
  | {
      type: 'typeDefs';
      typeDefs: string | DocumentNode | Array<string | DocumentNode>;
      resolvers?: ResolverMap;
    }
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
   * Classify the configured options into a {@link SchemaSource}.
   *
   * `schema` wins over `typeDefs`, which wins over `autoSchemaFile`.
   * Returns `null` when no schema source is configured at all.
   */
  private resolveSchemaSource(): SchemaSource | null {
    const { schema, typeDefs, resolvers, autoSchemaFile, buildSchemaOptions } =
      this.options;

    if (schema) {
      return { type: 'provided', schema };
    }

    if (typeDefs) {
      return { type: 'typeDefs', typeDefs, resolvers };
    }

    if (autoSchemaFile) {
      return { type: 'autoSchema', options: buildSchemaOptions ?? {} };
    }

    return null;
  }

  /**
   * Build the schema from configured sources
   *
   * @throws {Error} When only `autoSchemaFile` is configured. Leaven has no
   * code-first pipeline, so returning `null` here would leave the driver
   * without a schema and fail every request at runtime; failing at bootstrap
   * points at the actual misconfiguration instead.
   */
  public async buildSchema(): Promise<GraphQLSchema | null> {
    const source = this.resolveSchemaSource();

    if (!source) {
      return null;
    }

    switch (source.type) {
      case 'provided':
        return source.schema;
      case 'typeDefs':
        return this.buildFromTypeDefs(source.typeDefs, source.resolvers);
      case 'autoSchema':
        throw new Error(
          "Failed to build the GraphQL schema: 'autoSchemaFile' was configured, but code-first " +
            'schema generation is not implemented. Supply a pre-built executable schema via the ' +
            "'schema' option, or SDL via 'typeDefs' (optionally with 'resolvers')."
        );
    }
  }

  /**
   * Build schema from type definitions (SDL)
   *
   * SDL alone is a complete schema and is built with graphql-js directly.
   * When a resolver map is supplied it is merged in with
   * `makeExecutableSchema`, after which any `@Description`/`@Deprecated`
   * metadata recorded on the resolver functions is applied to the matching
   * schema fields.
   */
  private async buildFromTypeDefs(
    typeDefs: string | DocumentNode | Array<string | DocumentNode>,
    resolvers: ResolverMap | undefined
  ): Promise<GraphQLSchema> {
    const sdl = this.mergeTypeDefs(typeDefs);

    if (!resolvers) {
      return buildSchemaFromSDL(sdl);
    }

    const schema = makeExecutableSchema({
      typeDefs: sdl,
      // `LeavenModuleOptions.resolvers` is deliberately loose so consumers do
      // not have to depend on @graphql-tools' `IResolvers`; the shape is
      // validated by `makeExecutableSchema` itself.
      resolvers: resolvers as Parameters<typeof makeExecutableSchema>[0]['resolvers'],
    });
    applyResolverFieldMetadata(schema, resolvers);
    return schema;
  }

  /**
   * Normalize type definitions to a single SDL string
   */
  private mergeTypeDefs(
    typeDefs: string | DocumentNode | Array<string | DocumentNode>
  ): string {
    if (typeof typeDefs === 'string') {
      return typeDefs;
    }

    if (Array.isArray(typeDefs)) {
      return typeDefs
        .map((td) => (typeof td === 'string' ? td : print(td)))
        .join('\n');
    }

    // Handle DocumentNode
    return print(typeDefs);
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
 * Collect the resolver functions a type's resolver container exposes.
 *
 * Walks the prototype chain so a class instance registered as a type's
 * resolvers contributes its methods, not just its own properties.
 */
function collectResolverFunctions(container: object): Map<string, Function> {
  const functions = new Map<string, Function>();

  let current: object | null = container;
  while (current && current !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(current)) {
      if (key === 'constructor' || functions.has(key)) continue;

      const descriptor = Object.getOwnPropertyDescriptor(current, key);
      if (descriptor && typeof descriptor.value === 'function') {
        functions.set(key, descriptor.value as Function);
      }
    }
    current = Object.getPrototypeOf(current) as object | null;
  }

  return functions;
}

/**
 * Apply the `@Description` and `@Deprecated` metadata recorded on resolver
 * functions to the matching fields of a built schema.
 *
 * This is what makes those decorators observable: without it an annotated
 * field is not marked deprecated in the emitted schema and every client tool
 * reports it as current. Metadata is read only when `reflect-metadata` is
 * loaded (it always is under NestJS), so this is a no-op otherwise.
 */
function applyResolverFieldMetadata(
  schema: GraphQLSchema,
  resolvers: ResolverMap
): void {
  if (typeof Reflect.getMetadata !== 'function') {
    return;
  }

  const maps = Array.isArray(resolvers) ? resolvers : [resolvers];

  for (const map of maps) {
    for (const [typeName, container] of Object.entries(map ?? {})) {
      if (!container || typeof container !== 'object') continue;

      const type: GraphQLNamedType | undefined | null = schema.getType(typeName);
      if (!type || typeof (type as GraphQLObjectType).getFields !== 'function') {
        continue;
      }

      const fields = (type as GraphQLObjectType).getFields();

      for (const [fieldName, fn] of collectResolverFunctions(container)) {
        const field = fields[fieldName];
        if (!field) continue;

        const description = Reflect.getMetadata(DESCRIPTION_KEY, fn) as unknown;
        if (typeof description === 'string') {
          field.description = description;
        }

        const deprecationReason = Reflect.getMetadata(DEPRECATED_KEY, fn) as unknown;
        if (typeof deprecationReason === 'string') {
          field.deprecationReason = deprecationReason;
        }
      }
    }
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
 * Remove all descriptions from an SDL string
 */
function stripDescriptions(sdl: string): string {
  const strippedAst = visit(parse(sdl), {
    enter(node) {
      if ('description' in node && node.description) {
        const { description: _description, ...rest } = node;
        return rest;
      }
      return undefined;
    },
  });

  return print(strippedAst);
}

/**
 * Generate a schema file from the current schema
 *
 * Creates the parent directory if it does not exist. When
 * `includeDescriptions` is `false`, all type, field, and argument
 * descriptions are stripped from the emitted SDL.
 */
export async function generateSchemaFile(
  schema: GraphQLSchema,
  options: SchemaFileOptions
): Promise<void> {
  const schemaToWrite = options.sortSchema
    ? lexicographicSortSchema(schema)
    : schema;

  let sdl = printSchema(schemaToWrite);

  if (options.includeDescriptions === false) {
    sdl = stripDescriptions(sdl);
  }

  // `Bun.write` creates any missing parent directories.
  await Bun.write(options.path, sdl);
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
