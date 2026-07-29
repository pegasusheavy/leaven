/**
 * @leaven-graphql/schema - Schema building utilities for Leaven
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 */

export { SchemaBuilder, createSchemaBuilder } from './builder';
export type {
  SchemaBuilderConfig,
  TypeDefinition,
  InputTypeDefinition,
  FieldDefinition,
} from './builder';

export { mergeSchemas, mergeSchemasFromStrings } from './merge';
export type { MergeOptions } from './merge';

export {
  createResolvers,
  mergeResolvers,
  wrapResolver,
  defaultResolver,
  constantResolver,
} from './resolvers';
export type { Resolvers, ResolverFn, FieldResolver } from './resolvers';

export {
  loadSchemaFromFile,
  loadSchemaFromDirectory,
  loadSchemaFromGlob,
  loadTypeDefsFromFile,
  loadTypeDefsFromDirectory,
  loadTypeDefsFromGlob,
} from './loader';
export type { LoaderOptions } from './loader';

export {
  addDirective,
  addDirectives,
  createDirective,
  applyDirectives,
  getDirectiveValues,
  specDeprecatedDirective,
  authDirective,
  cacheControlDirective,
} from './directives';
export type { DirectiveConfig, DirectiveTransformer } from './directives';

export type { ScalarConfig, EnumConfig, InterfaceConfig, UnionConfig } from './types';
