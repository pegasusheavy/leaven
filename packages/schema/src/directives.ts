/**
 * @leaven-graphql/schema - Directive utilities
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import {
  GraphQLSchema,
  GraphQLDirective,
  DirectiveLocation,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  type GraphQLFieldConfig,
} from 'graphql';

/**
 * Directive configuration
 */
export interface DirectiveConfig {
  /** Directive name */
  name: string;
  /** Description */
  description?: string;
  /** Valid locations for the directive */
  locations: DirectiveLocation[];
  /** Arguments */
  args?: Record<string, { type: 'String' | 'Boolean' | 'Int'; description?: string; defaultValue?: unknown }>;
}

/**
 * Directive transformer function
 */
export type DirectiveTransformer = (
  schema: GraphQLSchema,
  directiveName: string
) => GraphQLSchema;

/**
 * Create a GraphQL directive
 */
export function createDirective(config: DirectiveConfig): GraphQLDirective {
  const args: Record<string, { type: typeof GraphQLString | typeof GraphQLBoolean | typeof GraphQLInt; description?: string; defaultValue?: unknown }> = {};

  if (config.args) {
    for (const [name, argConfig] of Object.entries(config.args)) {
      let type: typeof GraphQLString | typeof GraphQLBoolean | typeof GraphQLInt;
      switch (argConfig.type) {
        case 'Boolean':
          type = GraphQLBoolean;
          break;
        case 'Int':
          type = GraphQLInt;
          break;
        default:
          type = GraphQLString;
      }

      args[name] = {
        type,
        description: argConfig.description,
        defaultValue: argConfig.defaultValue,
      };
    }
  }

  return new GraphQLDirective({
    name: config.name,
    description: config.description,
    locations: config.locations,
    args,
  });
}

/**
 * Add a directive to a schema
 */
export function addDirective(
  schema: GraphQLSchema,
  directive: GraphQLDirective
): GraphQLSchema {
  const existingDirectives = schema.getDirectives();

  // Check if directive already exists
  const exists = existingDirectives.some((d) => d.name === directive.name);
  if (exists) {
    return schema;
  }

  return new GraphQLSchema({
    ...schema.toConfig(),
    directives: [...existingDirectives, directive],
  });
}

/**
 * Apply directive transformers to a schema
 */
export function applyDirectives(
  schema: GraphQLSchema,
  transformers: Record<string, DirectiveTransformer>
): GraphQLSchema {
  let transformedSchema = schema;

  for (const [directiveName, transformer] of Object.entries(transformers)) {
    transformedSchema = transformer(transformedSchema, directiveName);
  }

  return transformedSchema;
}

/**
 * Get directive values from a field
 */
export function getDirectiveValues(
  field: GraphQLFieldConfig<unknown, unknown>,
  directiveName: string
): Record<string, unknown> | null {
  const astNode = field.astNode;

  if (!astNode?.directives) {
    return null;
  }

  const directive = astNode.directives.find((d) => d.name.value === directiveName);

  if (!directive) {
    return null;
  }

  const values: Record<string, unknown> = {};

  for (const arg of directive.arguments ?? []) {
    const argValue = arg.value;

    switch (argValue.kind) {
      case 'StringValue':
        values[arg.name.value] = argValue.value;
        break;
      case 'IntValue':
        values[arg.name.value] = parseInt(argValue.value, 10);
        break;
      case 'FloatValue':
        values[arg.name.value] = parseFloat(argValue.value);
        break;
      case 'BooleanValue':
        values[arg.name.value] = argValue.value;
        break;
      case 'NullValue':
        values[arg.name.value] = null;
        break;
      case 'EnumValue':
        values[arg.name.value] = argValue.value;
        break;
    }
  }

  return values;
}

/**
 * Common directive: @deprecated
 */
export const deprecatedDirective = createDirective({
  name: 'deprecated',
  description: 'Marks an element as deprecated',
  locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.ENUM_VALUE],
  args: {
    reason: {
      type: 'String',
      description: 'Reason for deprecation',
      defaultValue: 'No longer supported',
    },
  },
});

/**
 * Common directive: @auth
 */
export const authDirective = createDirective({
  name: 'auth',
  description: 'Requires authentication',
  locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.OBJECT],
  args: {
    requires: {
      type: 'String',
      description: 'Required role or permission',
    },
  },
});

/**
 * Common directive: @cacheControl
 */
export const cacheControlDirective = createDirective({
  name: 'cacheControl',
  description: 'Cache control hints',
  locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.OBJECT],
  args: {
    maxAge: {
      type: 'Int',
      description: 'Maximum age in seconds',
    },
    scope: {
      type: 'String',
      description: 'Cache scope (PUBLIC or PRIVATE)',
      defaultValue: 'PUBLIC',
    },
  },
});
