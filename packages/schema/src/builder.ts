/**
 * @leaven-graphql/schema - Schema builder
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID,
  GraphQLScalarType,
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  type GraphQLType,
  type GraphQLOutputType,
  type GraphQLInputType,
  type GraphQLFieldConfig,
  type GraphQLInputFieldConfig,
} from 'graphql';

import type { ScalarConfig, EnumConfig, InterfaceConfig, UnionConfig } from './types';
import type { Resolvers } from './resolvers';

/**
 * Field definition
 */
export interface FieldDefinition {
  /** Field type (e.g., "String", "Int!", "[User]!") */
  type: string;
  /** Field description */
  description?: string;
  /** Deprecation reason */
  deprecationReason?: string;
  /** Field arguments */
  args?: Record<string, { type: string; description?: string; defaultValue?: unknown }>;
  /** Field resolver */
  resolve?: (parent: unknown, args: unknown, context: unknown, info: unknown) => unknown;
}

/**
 * Type definition
 */
export interface TypeDefinition {
  /** Type name */
  name: string;
  /** Type description */
  description?: string;
  /** Fields */
  fields: Record<string, FieldDefinition>;
  /** Interfaces this type implements */
  interfaces?: string[];
}

/**
 * Input type definition
 */
export interface InputTypeDefinition {
  /** Type name */
  name: string;
  /** Type description */
  description?: string;
  /** Fields */
  fields: Record<string, { type: string; description?: string; defaultValue?: unknown }>;
}

/**
 * Configuration for the schema builder
 */
export interface SchemaBuilderConfig {
  /** Enable query type */
  query?: boolean;
  /** Enable mutation type */
  mutation?: boolean;
  /** Enable subscription type */
  subscription?: boolean;
}

/**
 * Builder for creating GraphQL schemas programmatically
 */
export class SchemaBuilder {
  private readonly types: Map<string, GraphQLObjectType>;
  private readonly inputTypes: Map<string, GraphQLInputObjectType>;
  private readonly scalars: Map<string, GraphQLScalarType>;
  private readonly enums: Map<string, GraphQLEnumType>;
  private readonly interfaces: Map<string, GraphQLInterfaceType>;
  private readonly unions: Map<string, GraphQLUnionType>;

  private queryFields: Record<string, FieldDefinition>;
  private mutationFields: Record<string, FieldDefinition>;
  private subscriptionFields: Record<string, FieldDefinition>;

  private readonly config: Required<SchemaBuilderConfig>;

  constructor(config: SchemaBuilderConfig = {}) {
    this.types = new Map();
    this.inputTypes = new Map();
    this.scalars = new Map();
    this.enums = new Map();
    this.interfaces = new Map();
    this.unions = new Map();

    this.queryFields = {};
    this.mutationFields = {};
    this.subscriptionFields = {};

    this.config = {
      query: config.query ?? true,
      mutation: config.mutation ?? true,
      subscription: config.subscription ?? true,
    };
  }

  /**
   * Add a custom scalar type
   */
  public addScalar(config: ScalarConfig): this {
    const scalar = new GraphQLScalarType({
      name: config.name,
      description: config.description,
      serialize: config.serialize,
      parseValue: config.parseValue,
      parseLiteral: config.parseLiteral as undefined,
    });

    this.scalars.set(config.name, scalar);
    return this;
  }

  /**
   * Add an enum type
   */
  public addEnum(config: EnumConfig): this {
    const values: Record<string, { value?: unknown; description?: string; deprecationReason?: string }> = {};

    for (const [name, valueConfig] of Object.entries(config.values)) {
      values[name] = {
        value: valueConfig.value ?? name,
        description: valueConfig.description,
        deprecationReason: valueConfig.deprecationReason,
      };
    }

    const enumType = new GraphQLEnumType({
      name: config.name,
      description: config.description,
      values,
    });

    this.enums.set(config.name, enumType);
    return this;
  }

  /**
   * Add an interface type
   */
  public addInterface(config: InterfaceConfig): this {
    const interfaceType = new GraphQLInterfaceType({
      name: config.name,
      description: config.description,
      fields: () => this.buildFields(config.fields),
      resolveType: config.resolveType as undefined,
    });

    this.interfaces.set(config.name, interfaceType);
    return this;
  }

  /**
   * Add a union type
   */
  public addUnion(config: UnionConfig): this {
    const union = new GraphQLUnionType({
      name: config.name,
      description: config.description,
      types: () =>
        config.types.map((typeName) => {
          const type = this.types.get(typeName);
          if (!type) {
            throw new Error(`Type "${typeName}" not found for union "${config.name}"`);
          }
          return type;
        }),
      resolveType: config.resolveType as undefined,
    });

    this.unions.set(config.name, union);
    return this;
  }

  /**
   * Add an object type
   */
  public addType(definition: TypeDefinition): this {
    const type = new GraphQLObjectType({
      name: definition.name,
      description: definition.description,
      fields: () => this.buildFields(definition.fields),
      interfaces: definition.interfaces
        ? () =>
            definition.interfaces!.map((name) => {
              const iface = this.interfaces.get(name);
              if (!iface) {
                throw new Error(`Interface "${name}" not found for type "${definition.name}"`);
              }
              return iface;
            })
        : undefined,
    });

    this.types.set(definition.name, type);
    return this;
  }

  /**
   * Add an input type
   */
  public addInputType(definition: InputTypeDefinition): this {
    const inputType = new GraphQLInputObjectType({
      name: definition.name,
      description: definition.description,
      fields: () => this.buildInputFields(definition.fields),
    });

    this.inputTypes.set(definition.name, inputType);
    return this;
  }

  /**
   * Add query fields
   */
  public addQueryFields(fields: Record<string, FieldDefinition>): this {
    this.queryFields = { ...this.queryFields, ...fields };
    return this;
  }

  /**
   * Add mutation fields
   */
  public addMutationFields(fields: Record<string, FieldDefinition>): this {
    this.mutationFields = { ...this.mutationFields, ...fields };
    return this;
  }

  /**
   * Add subscription fields
   */
  public addSubscriptionFields(fields: Record<string, FieldDefinition>): this {
    this.subscriptionFields = { ...this.subscriptionFields, ...fields };
    return this;
  }

  /**
   * Parse a type string into a GraphQL type
   */
  private parseType(typeStr: string, isInput: boolean = false): GraphQLType {
    const trimmed = typeStr.trim();

    // Handle non-null types
    if (trimmed.endsWith('!')) {
      const innerType = this.parseType(trimmed.slice(0, -1), isInput);
      return new GraphQLNonNull(innerType as GraphQLOutputType | GraphQLInputType);
    }

    // Handle list types
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const innerType = this.parseType(trimmed.slice(1, -1), isInput);
      return new GraphQLList(innerType as GraphQLOutputType | GraphQLInputType);
    }

    // Handle built-in scalars
    switch (trimmed) {
      case 'String':
        return GraphQLString;
      case 'Int':
        return GraphQLInt;
      case 'Float':
        return GraphQLFloat;
      case 'Boolean':
        return GraphQLBoolean;
      case 'ID':
        return GraphQLID;
    }

    // Check custom scalars
    const scalar = this.scalars.get(trimmed);
    if (scalar) return scalar;

    // Check enums
    const enumType = this.enums.get(trimmed);
    if (enumType) return enumType;

    // Check interfaces
    const interfaceType = this.interfaces.get(trimmed);
    if (interfaceType) return interfaceType;

    // Check unions
    const unionType = this.unions.get(trimmed);
    if (unionType) return unionType;

    // Check input types (for input fields)
    if (isInput) {
      const inputType = this.inputTypes.get(trimmed);
      if (inputType) return inputType;
    }

    // Check object types
    const objectType = this.types.get(trimmed);
    if (objectType) return objectType;

    throw new Error(`Unknown type: ${trimmed}`);
  }

  /**
   * Build GraphQL field configs from field definitions
   */
  private buildFields(
    fields: Record<string, FieldDefinition>
  ): Record<string, GraphQLFieldConfig<unknown, unknown>> {
    const result: Record<string, GraphQLFieldConfig<unknown, unknown>> = {};

    for (const [name, field] of Object.entries(fields)) {
      const args: Record<string, { type: GraphQLInputType; description?: string; defaultValue?: unknown }> = {};

      if (field.args) {
        for (const [argName, argDef] of Object.entries(field.args)) {
          args[argName] = {
            type: this.parseType(argDef.type, true) as GraphQLInputType,
            description: argDef.description,
            defaultValue: argDef.defaultValue,
          };
        }
      }

      result[name] = {
        type: this.parseType(field.type) as GraphQLOutputType,
        description: field.description,
        deprecationReason: field.deprecationReason,
        args: Object.keys(args).length > 0 ? args : undefined,
        resolve: field.resolve,
      };
    }

    return result;
  }

  /**
   * Build GraphQL input field configs
   */
  private buildInputFields(
    fields: Record<string, { type: string; description?: string; defaultValue?: unknown }>
  ): Record<string, GraphQLInputFieldConfig> {
    const result: Record<string, GraphQLInputFieldConfig> = {};

    for (const [name, field] of Object.entries(fields)) {
      result[name] = {
        type: this.parseType(field.type, true) as GraphQLInputType,
        description: field.description,
        defaultValue: field.defaultValue,
      };
    }

    return result;
  }

  /**
   * Apply resolvers to the schema
   */
  public applyResolvers(resolvers: Resolvers): this {
    // Apply query resolvers
    if (resolvers.Query) {
      for (const [fieldName, resolver] of Object.entries(resolvers.Query)) {
        if (this.queryFields[fieldName]) {
          this.queryFields[fieldName] = {
            ...this.queryFields[fieldName],
            resolve: resolver as FieldDefinition['resolve'],
          };
        }
      }
    }

    // Apply mutation resolvers
    if (resolvers.Mutation) {
      for (const [fieldName, resolver] of Object.entries(resolvers.Mutation)) {
        if (this.mutationFields[fieldName]) {
          this.mutationFields[fieldName] = {
            ...this.mutationFields[fieldName],
            resolve: resolver as FieldDefinition['resolve'],
          };
        }
      }
    }

    // Apply subscription resolvers
    if (resolvers.Subscription) {
      for (const [fieldName, resolver] of Object.entries(resolvers.Subscription)) {
        if (this.subscriptionFields[fieldName]) {
          this.subscriptionFields[fieldName] = {
            ...this.subscriptionFields[fieldName],
            resolve: resolver as FieldDefinition['resolve'],
          };
        }
      }
    }

    return this;
  }

  /**
   * Build the GraphQL schema
   */
  public build(): GraphQLSchema {
    let query: GraphQLObjectType | undefined;
    let mutation: GraphQLObjectType | undefined;
    let subscription: GraphQLObjectType | undefined;

    // Build Query type
    if (this.config.query && Object.keys(this.queryFields).length > 0) {
      query = new GraphQLObjectType({
        name: 'Query',
        fields: () => this.buildFields(this.queryFields),
      });
    }

    // Build Mutation type
    if (this.config.mutation && Object.keys(this.mutationFields).length > 0) {
      mutation = new GraphQLObjectType({
        name: 'Mutation',
        fields: () => this.buildFields(this.mutationFields),
      });
    }

    // Build Subscription type
    if (this.config.subscription && Object.keys(this.subscriptionFields).length > 0) {
      subscription = new GraphQLObjectType({
        name: 'Subscription',
        fields: () => this.buildFields(this.subscriptionFields),
      });
    }

    if (!query) {
      // GraphQL requires at least a Query type
      query = new GraphQLObjectType({
        name: 'Query',
        fields: {
          _empty: {
            type: GraphQLString,
            resolve: () => null,
          },
        },
      });
    }

    return new GraphQLSchema({
      query,
      mutation,
      subscription,
      types: [
        ...this.types.values(),
        ...this.inputTypes.values(),
        ...this.scalars.values(),
        ...this.enums.values(),
        ...this.interfaces.values(),
        ...this.unions.values(),
      ],
    });
  }
}

/**
 * Create a new schema builder
 */
export function createSchemaBuilder(config?: SchemaBuilderConfig): SchemaBuilder {
  return new SchemaBuilder(config);
}
