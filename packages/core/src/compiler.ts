/**
 * @leaven-graphql/core - Query compilation for optimized execution
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type {
  DocumentNode,
  GraphQLSchema,
  OperationDefinitionNode,
  FieldNode,
  SelectionSetNode,
  FragmentDefinitionNode,
} from 'graphql';
import { Kind, getOperationAST } from 'graphql';

import type { OperationType, Variables, GraphQLResponse } from './types';

/**
 * Options for query compilation
 */
export interface CompilerOptions {
  /** Enable field-level caching hints */
  cacheHints?: boolean;
  /** Enable query complexity calculation */
  calculateComplexity?: boolean;
  /** Custom complexity calculator */
  complexityCalculator?: (field: FieldNode, depth: number) => number;
}

/**
 * Result of query compilation
 */
export interface CompiledQueryResult<TData = Record<string, unknown>> {
  /** Execute the compiled query */
  execute: (
    rootValue: unknown,
    context: unknown,
    variables?: Variables
  ) => Promise<GraphQLResponse<TData>>;
  /** The operation type */
  operationType: OperationType;
  /** Calculated complexity score */
  complexity?: number;
  /** Fields that can be cached */
  cacheableFields?: string[];
  /** Required variables */
  requiredVariables: string[];
  /** Optional variables */
  optionalVariables: string[];
}

/**
 * A compiled GraphQL query ready for execution
 */
export class CompiledQuery<_TData = Record<string, unknown>> {
  public readonly document: DocumentNode;
  public readonly schema: GraphQLSchema;
  public readonly operationType: OperationType;
  public readonly operationName: string | null;
  public readonly complexity: number;
  public readonly requiredVariables: string[];
  public readonly optionalVariables: string[];
  public readonly fields: CompiledField[];

  private readonly fragmentMap: Map<string, FragmentDefinitionNode>;

  constructor(
    schema: GraphQLSchema,
    document: DocumentNode,
    operationName?: string,
    options?: CompilerOptions
  ) {
    this.schema = schema;
    this.document = document;
    this.fragmentMap = this.buildFragmentMap(document);

    const operation = getOperationAST(document, operationName);
    if (!operation) {
      throw new Error(
        operationName
          ? `Operation "${operationName}" not found`
          : 'No operation found in document'
      );
    }

    this.operationType = operation.operation as OperationType;
    this.operationName = operation.name?.value ?? null;

    // Extract variable definitions
    const { required, optional } = this.extractVariables(operation);
    this.requiredVariables = required;
    this.optionalVariables = optional;

    // Compile fields
    this.fields = this.compileSelectionSet(operation.selectionSet, 0);

    // Calculate complexity
    this.complexity = options?.calculateComplexity
      ? this.calculateComplexity(this.fields, options.complexityCalculator)
      : 0;
  }

  /**
   * Build a map of fragment definitions
   */
  private buildFragmentMap(document: DocumentNode): Map<string, FragmentDefinitionNode> {
    const map = new Map<string, FragmentDefinitionNode>();

    for (const definition of document.definitions) {
      if (definition.kind === Kind.FRAGMENT_DEFINITION) {
        map.set(definition.name.value, definition);
      }
    }

    return map;
  }

  /**
   * Extract variable definitions from an operation
   */
  private extractVariables(operation: OperationDefinitionNode): {
    required: string[];
    optional: string[];
  } {
    const required: string[] = [];
    const optional: string[] = [];

    if (operation.variableDefinitions) {
      for (const varDef of operation.variableDefinitions) {
        const name = varDef.variable.name.value;
        const isRequired =
          varDef.type.kind === Kind.NON_NULL_TYPE && !varDef.defaultValue;

        if (isRequired) {
          required.push(name);
        } else {
          optional.push(name);
        }
      }
    }

    return { required, optional };
  }

  /**
   * Compile a selection set into compiled fields
   */
  private compileSelectionSet(
    selectionSet: SelectionSetNode,
    depth: number
  ): CompiledField[] {
    const fields: CompiledField[] = [];

    for (const selection of selectionSet.selections) {
      switch (selection.kind) {
        case Kind.FIELD:
          fields.push(this.compileField(selection, depth));
          break;
        case Kind.INLINE_FRAGMENT:
          if (selection.selectionSet) {
            fields.push(
              ...this.compileSelectionSet(selection.selectionSet, depth)
            );
          }
          break;
        case Kind.FRAGMENT_SPREAD: {
          const fragment = this.fragmentMap.get(selection.name.value);
          if (fragment) {
            fields.push(
              ...this.compileSelectionSet(fragment.selectionSet, depth)
            );
          }
          break;
        }
      }
    }

    return fields;
  }

  /**
   * Compile a single field
   */
  private compileField(field: FieldNode, depth: number): CompiledField {
    const compiled: CompiledField = {
      name: field.name.value,
      alias: field.alias?.value ?? null,
      depth,
      arguments: this.extractArguments(field),
      children: field.selectionSet
        ? this.compileSelectionSet(field.selectionSet, depth + 1)
        : [],
    };

    return compiled;
  }

  /**
   * Extract arguments from a field
   */
  private extractArguments(field: FieldNode): Record<string, unknown> {
    const args: Record<string, unknown> = {};

    if (field.arguments) {
      for (const arg of field.arguments) {
        args[arg.name.value] = this.extractValue(arg.value);
      }
    }

    return args;
  }

  /**
   * Extract a value from an AST node
   */
  private extractValue(node: { kind: string; value?: unknown; values?: unknown[]; fields?: Array<{ name: { value: string }; value: unknown }> }): unknown {
    switch (node.kind) {
      case Kind.VARIABLE:
        return { __variable: (node as { name: { value: string } }).name.value };
      case Kind.INT:
        return parseInt(node.value as string, 10);
      case Kind.FLOAT:
        return parseFloat(node.value as string);
      case Kind.STRING:
      case Kind.BOOLEAN:
      case Kind.ENUM:
        return node.value;
      case Kind.NULL:
        return null;
      case Kind.LIST:
        return (node.values ?? []).map((v) => this.extractValue(v as { kind: string; value?: unknown; values?: unknown[] }));
      case Kind.OBJECT: {
        const obj: Record<string, unknown> = {};
        for (const field of node.fields ?? []) {
          obj[field.name.value] = this.extractValue(field.value as { kind: string; value?: unknown; values?: unknown[] });
        }
        return obj;
      }
      default:
        return undefined;
    }
  }

  /**
   * Calculate query complexity
   */
  private calculateComplexity(
    fields: CompiledField[],
    calculator?: (field: FieldNode, depth: number) => number
  ): number {
    let total = 0;

    const traverse = (compiledFields: CompiledField[], depth: number): void => {
      for (const field of compiledFields) {
        // Default complexity: 1 + (depth * 0.5)
        const fieldComplexity = calculator
          ? 1 // If custom calculator provided, default to 1
          : 1 + depth * 0.5;

        total += fieldComplexity;

        if (field.children.length > 0) {
          traverse(field.children, depth + 1);
        }
      }
    };

    traverse(fields, 0);
    return total;
  }

  /**
   * Validate variables against requirements
   */
  public validateVariables(variables?: Variables): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const required of this.requiredVariables) {
      if (variables === undefined || !(required in variables)) {
        missing.push(required);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Get a flattened list of all field names
   */
  public getFieldNames(): string[] {
    const names: string[] = [];

    const traverse = (fields: CompiledField[]): void => {
      for (const field of fields) {
        names.push(field.name);
        traverse(field.children);
      }
    };

    traverse(this.fields);
    return names;
  }
}

/**
 * A compiled field
 */
export interface CompiledField {
  /** Field name */
  name: string;
  /** Field alias or null */
  alias: string | null;
  /** Depth in the query */
  depth: number;
  /** Field arguments */
  arguments: Record<string, unknown>;
  /** Child fields */
  children: CompiledField[];
}

/**
 * Compile a GraphQL query
 */
export function compileQuery<TData = Record<string, unknown>>(
  schema: GraphQLSchema,
  document: DocumentNode,
  operationName?: string,
  options?: CompilerOptions
): CompiledQuery<TData> {
  return new CompiledQuery<TData>(schema, document, operationName, options);
}
