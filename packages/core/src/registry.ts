/**
 * @leaven-graphql/core - Operation registry for persisted queries
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { DocumentNode, GraphQLSchema } from 'graphql';
import { parseDocument, validateDocument } from './parser';
import { CompiledQuery, compileQuery, type CompilerOptions } from './compiler';
import type { OperationType } from './types';

/**
 * Configuration for the operation registry
 */
export interface OperationRegistryConfig {
  /** GraphQL schema for validation */
  schema: GraphQLSchema;
  /** Enable automatic query compilation */
  compile?: boolean;
  /** Compiler options */
  compilerOptions?: CompilerOptions;
  /** Allow unregistered operations (default: true) */
  allowUnregistered?: boolean;
}

/**
 * A registered GraphQL operation
 */
export interface RegisteredOperation {
  /** Unique operation ID */
  id: string;
  /** Operation name */
  name: string | null;
  /** The query string */
  query: string;
  /** Parsed document */
  document: DocumentNode;
  /** Compiled query (if compilation is enabled) */
  compiled?: CompiledQuery;
  /** Operation type */
  operationType: OperationType;
  /** When this operation was registered */
  registeredAt: number;
  /** Hash of the query for integrity */
  hash: string;
}

/**
 * Registry for persisted/approved GraphQL operations
 */
export class OperationRegistry {
  private readonly operations: Map<string, RegisteredOperation>;
  private readonly schema: GraphQLSchema;
  private readonly shouldCompile: boolean;
  private readonly compilerOptions?: CompilerOptions;
  public readonly allowUnregistered: boolean;

  constructor(config: OperationRegistryConfig) {
    this.operations = new Map();
    this.schema = config.schema;
    this.shouldCompile = config.compile ?? false;
    this.compilerOptions = config.compilerOptions;
    this.allowUnregistered = config.allowUnregistered ?? true;
  }

  /**
   * Generate a hash for a query
   */
  private generateHash(query: string): string {
    const hasher = new Bun.CryptoHasher('sha256');
    hasher.update(query);
    return hasher.digest('hex');
  }

  /**
   * Register a new operation
   */
  public register(
    query: string,
    options?: { id?: string; name?: string }
  ): RegisteredOperation {
    const hash = this.generateHash(query);
    const id = options?.id ?? hash.slice(0, 16);

    // Check if already registered
    if (this.operations.has(id)) {
      const existing = this.operations.get(id)!;
      if (existing.hash === hash) {
        return existing;
      }
      throw new Error(`Operation ID "${id}" already registered with different query`);
    }

    // Parse the document
    const document = parseDocument(query);

    // Validate against schema
    const validation = validateDocument(this.schema, document);
    if (!validation.valid) {
      const errorMessages = validation.errors.map((e) => e.message).join(', ');
      throw new Error(`Invalid operation: ${errorMessages}`);
    }

    // Get operation info
    const opDef = document.definitions.find(
      (d) => d.kind === 'OperationDefinition'
    ) as { operation: OperationType; name?: { value: string } } | undefined;

    if (!opDef) {
      throw new Error('No operation definition found in document');
    }

    // Compile if enabled
    let compiled: CompiledQuery | undefined;
    if (this.shouldCompile) {
      compiled = compileQuery(
        this.schema,
        document,
        options?.name ?? opDef.name?.value,
        this.compilerOptions
      );
    }

    const operation: RegisteredOperation = {
      id,
      name: options?.name ?? opDef.name?.value ?? null,
      query,
      document,
      compiled,
      operationType: opDef.operation,
      registeredAt: Date.now(),
      hash,
    };

    this.operations.set(id, operation);
    return operation;
  }

  /**
   * Register multiple operations at once
   */
  public registerAll(
    operations: Array<{ query: string; id?: string; name?: string }>
  ): RegisteredOperation[] {
    return operations.map((op) => this.register(op.query, { id: op.id, name: op.name }));
  }

  /**
   * Get an operation by ID
   */
  public get(id: string): RegisteredOperation | null {
    return this.operations.get(id) ?? null;
  }

  /**
   * Get an operation by hash
   */
  public getByHash(hash: string): RegisteredOperation | null {
    for (const op of this.operations.values()) {
      if (op.hash === hash || op.hash.startsWith(hash)) {
        return op;
      }
    }
    return null;
  }

  /**
   * Check if an operation is registered
   */
  public has(id: string): boolean {
    return this.operations.has(id);
  }

  /**
   * Check if a query hash is registered
   */
  public hasHash(hash: string): boolean {
    return this.getByHash(hash) !== null;
  }

  /**
   * Unregister an operation
   */
  public unregister(id: string): boolean {
    return this.operations.delete(id);
  }

  /**
   * Clear all registered operations
   */
  public clear(): void {
    this.operations.clear();
  }

  /**
   * Get the number of registered operations
   */
  public get size(): number {
    return this.operations.size;
  }

  /**
   * Get all registered operations
   */
  public getAll(): RegisteredOperation[] {
    return Array.from(this.operations.values());
  }

  /**
   * Get operations by type
   */
  public getByType(type: OperationType): RegisteredOperation[] {
    return this.getAll().filter((op) => op.operationType === type);
  }

  /**
   * Export the registry as a JSON-serializable object
   */
  public export(): Record<string, { query: string; name: string | null; type: OperationType }> {
    const exported: Record<string, { query: string; name: string | null; type: OperationType }> = {};

    for (const [id, op] of this.operations) {
      exported[id] = {
        query: op.query,
        name: op.name,
        type: op.operationType,
      };
    }

    return exported;
  }

  /**
   * Import operations from a serialized registry
   */
  public import(
    data: Record<string, { query: string; name?: string | null; type?: OperationType }>
  ): number {
    let imported = 0;

    for (const [id, op] of Object.entries(data)) {
      try {
        this.register(op.query, { id, name: op.name ?? undefined });
        imported++;
      } catch {
        // Skip invalid operations
      }
    }

    return imported;
  }
}

/**
 * Create a new operation registry
 */
export function createOperationRegistry(
  config: OperationRegistryConfig
): OperationRegistry {
  return new OperationRegistry(config);
}
