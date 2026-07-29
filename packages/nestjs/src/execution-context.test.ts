/**
 * @leaven-graphql/nestjs - Execution Context tests
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import type { ExecutionContext } from '@nestjs/common';
import type { GraphQLResolveInfo } from 'graphql';
import {
  GqlExecutionContext,
  GQL_RESOLVER_ARGS,
  getGqlContext,
  getGqlArgs,
  getGqlInfo,
  getGqlRoot,
} from './execution-context';

function createMockContext(overrides: {
  root?: unknown;
  args?: Record<string, unknown>;
  context?: Record<string, unknown>;
  info?: Partial<GraphQLResolveInfo>;
} = {}): ExecutionContext {
  const {
    root = { id: '1', name: 'Test' },
    args = { id: '123' },
    context = { user: { id: 'user1' }, req: {}, res: {} },
    info = {
      fieldName: 'testField',
      parentType: { name: 'Query' } as any,
      returnType: { toString: () => 'String' } as any,
      operation: {
        operation: 'query' as const,
        name: { value: 'TestQuery' },
      } as any,
      variableValues: { var1: 'value1' },
      fieldNodes: [
        {
          kind: 'Field' as const,
          name: { kind: 'Name' as const, value: 'testField' },
          selectionSet: {
            kind: 'SelectionSet' as const,
            selections: [
              { kind: 'Field' as const, name: { kind: 'Name' as const, value: 'id' } },
              { kind: 'Field' as const, name: { kind: 'Name' as const, value: 'name' } },
            ],
          },
        },
      ] as any,
      path: { key: 'testField', prev: undefined } as any,
    },
  } = overrides;

  return {
    getArgs: () => [root, args, context, info],
    getHandler: () => function testMethod() {},
    getClass: () => class TestClass {},
    getType: () => 'graphql',
    switchToHttp: () => ({} as any),
    switchToRpc: () => ({} as any),
    switchToWs: () => ({} as any),
    getArgByIndex: (index: number) => [root, args, context, info][index],
  } as unknown as ExecutionContext;
}

describe('GqlExecutionContext', () => {
  describe('create', () => {
    test('should create instance from ExecutionContext', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext).toBeInstanceOf(GqlExecutionContext);
    });
  });

  describe('getContext', () => {
    test('should return GraphQL context', () => {
      const context = createMockContext({
        context: { user: { id: 'test' }, req: {}, res: {} },
      });
      const gqlContext = GqlExecutionContext.create(context);

      const result = gqlContext.getContext();

      expect(result.user).toEqual({ id: 'test' });
    });

    test('should return typed context', () => {
      interface CustomContext {
        user: { id: string };
        token: string;
      }
      const context = createMockContext({
        context: { user: { id: 'test' }, token: 'abc123', req: {}, res: {} },
      });
      const gqlContext = GqlExecutionContext.create(context);

      const result = gqlContext.getContext<CustomContext>();

      expect(result.token).toBe('abc123');
    });
  });

  describe('getRoot', () => {
    test('should return root/parent value', () => {
      const context = createMockContext({
        root: { id: '123', value: 'test' },
      });
      const gqlContext = GqlExecutionContext.create(context);

      const result = gqlContext.getRoot<{ id: string; value: string }>();

      expect(result.id).toBe('123');
      expect(result.value).toBe('test');
    });
  });

  describe('getArgs', () => {
    test('should return resolver arguments', () => {
      const context = createMockContext({
        args: { id: '123', filter: { active: true } },
      });
      const gqlContext = GqlExecutionContext.create(context);

      const result = gqlContext.getArgs<{ id: string; filter: { active: boolean } }>();

      expect(result.id).toBe('123');
      expect(result.filter.active).toBe(true);
    });
  });

  describe('getInfo', () => {
    test('should return GraphQL resolve info', () => {
      const context = createMockContext({
        info: { fieldName: 'users' } as any,
      });
      const gqlContext = GqlExecutionContext.create(context);

      const result = gqlContext.getInfo();

      expect(result.fieldName).toBe('users');
    });
  });

  describe('getArg', () => {
    test('should return specific argument by name', () => {
      const context = createMockContext({
        args: { id: '123', name: 'test' },
      });
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getArg<string>('id')).toBe('123');
      expect(gqlContext.getArg<string>('name')).toBe('test');
    });

    test('should return undefined for non-existent argument', () => {
      const context = createMockContext({ args: {} });
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getArg('nonexistent')).toBeUndefined();
    });
  });

  describe('getContextProperty', () => {
    test('should return specific context property by name', () => {
      const context = createMockContext({
        context: { user: { id: 'test' }, customProp: 'value', req: {}, res: {} },
      });
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getContextProperty('customProp')).toBe('value');
    });

    test('should return undefined for non-existent property', () => {
      const context = createMockContext({ context: { req: {}, res: {} } });
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getContextProperty('nonexistent')).toBeUndefined();
    });
  });

  describe('getHost', () => {
    test('should return the original ArgumentsHost', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getHost()).toBe(context);
    });
  });

  describe('getType', () => {
    test('should return context type', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getType()).toBe('graphql');
    });
  });

  describe('isGraphQL', () => {
    test('should return true for GraphQL context', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.isGraphQL()).toBe(true);
    });
  });

  describe('getHandler', () => {
    test('should return the handler function', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      expect(typeof gqlContext.getHandler()).toBe('function');
    });
  });

  describe('getClass', () => {
    test('should return the class', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      expect(typeof gqlContext.getClass()).toBe('function');
    });
  });

  describe('getFieldName', () => {
    test('should return the field name from info', () => {
      const context = createMockContext({
        info: { fieldName: 'users' } as any,
      });
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getFieldName()).toBe('users');
    });
  });

  describe('getParentTypeName', () => {
    test('should return the parent type name', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getParentTypeName()).toBe('Query');
    });
  });

  describe('getReturnTypeName', () => {
    test('should return the return type name', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getReturnTypeName()).toBe('String');
    });
  });

  describe('getOperationName', () => {
    test('should return the operation name', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getOperationName()).toBe('TestQuery');
    });
  });

  describe('getOperationType', () => {
    test('should return query for query operations', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getOperationType()).toBe('query');
    });
  });

  describe('getVariables', () => {
    test('should return variable values', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getVariables()).toEqual({ var1: 'value1' });
    });
  });

  describe('getPath', () => {
    test('should return the field path', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      const path = gqlContext.getPath();
      expect(path).toContain('testField');
    });

    test('should return empty array when no path', () => {
      const context = createMockContext({
        info: {} as any,
      });
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getPath()).toEqual([]);
    });

    test('should omit numeric list indices so join() keys stay stable', () => {
      const context = createMockContext({
        info: {
          path: {
            key: 'email',
            prev: { key: 3, prev: { key: 'users', prev: undefined } },
          },
        } as any,
      });
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getPath()).toEqual(['users', 'email']);
      expect(gqlContext.getPath().join('.')).toBe('users.email');
    });
  });

  describe('getFullPath', () => {
    test('should return the field path', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getFullPath()).toEqual(['testField']);
    });

    test('should return empty array when no path', () => {
      const context = createMockContext({
        info: {} as any,
      });
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getFullPath()).toEqual([]);
    });

    test('should include numeric list indices as number segments', () => {
      const context = createMockContext({
        info: {
          path: {
            key: 'email',
            prev: { key: 3, prev: { key: 'users', prev: undefined } },
          },
        } as any,
      });
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getFullPath()).toEqual(['users', 3, 'email']);
    });
  });

  describe('getSelectedFields', () => {
    test('should return selected field names', () => {
      const context = createMockContext();
      const gqlContext = GqlExecutionContext.create(context);

      const fields = gqlContext.getSelectedFields();
      expect(fields).toContain('id');
      expect(fields).toContain('name');
    });

    test('should return empty array when no selections', () => {
      const context = createMockContext({
        info: { fieldNodes: [] } as any,
      });
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getSelectedFields()).toEqual([]);
    });

    test('should resolve fields requested via fragment spreads', () => {
      const context = createMockContext({
        info: {
          fieldNodes: [
            {
              kind: 'Field',
              name: { kind: 'Name', value: 'user' },
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                  { kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFields' } },
                ],
              },
            },
          ],
          fragments: {
            UserFields: {
              kind: 'FragmentDefinition',
              name: { kind: 'Name', value: 'UserFields' },
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                  { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                ],
              },
            },
          },
        } as any,
      });
      const gqlContext = GqlExecutionContext.create(context);

      const fields = gqlContext.getSelectedFields();
      expect(fields).toContain('id');
      expect(fields).toContain('email');
      expect(fields).toContain('role');
    });

    test('should resolve fields requested via inline fragments', () => {
      const context = createMockContext({
        info: {
          fieldNodes: [
            {
              kind: 'Field',
              name: { kind: 'Name', value: 'node' },
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                  {
                    kind: 'InlineFragment',
                    selectionSet: {
                      kind: 'SelectionSet',
                      selections: [
                        { kind: 'Field', name: { kind: 'Name', value: 'secret' } },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        } as any,
      });
      const gqlContext = GqlExecutionContext.create(context);

      const fields = gqlContext.getSelectedFields();
      expect(fields).toContain('id');
      expect(fields).toContain('secret');
    });

    test('should terminate on cyclic fragment spreads', () => {
      const context = createMockContext({
        info: {
          fieldNodes: [
            {
              kind: 'Field',
              name: { kind: 'Name', value: 'user' },
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  { kind: 'FragmentSpread', name: { kind: 'Name', value: 'A' } },
                ],
              },
            },
          ],
          fragments: {
            A: {
              kind: 'FragmentDefinition',
              name: { kind: 'Name', value: 'A' },
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  { kind: 'Field', name: { kind: 'Name', value: 'fromA' } },
                  { kind: 'FragmentSpread', name: { kind: 'Name', value: 'B' } },
                ],
              },
            },
            B: {
              kind: 'FragmentDefinition',
              name: { kind: 'Name', value: 'B' },
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  { kind: 'Field', name: { kind: 'Name', value: 'fromB' } },
                  { kind: 'FragmentSpread', name: { kind: 'Name', value: 'A' } },
                ],
              },
            },
          },
        } as any,
      });
      const gqlContext = GqlExecutionContext.create(context);

      const fields = gqlContext.getSelectedFields();
      expect(fields).toContain('fromA');
      expect(fields).toContain('fromB');
    });

    test('should merge selections across all field nodes without duplicates', () => {
      const context = createMockContext({
        info: {
          fieldNodes: [
            {
              kind: 'Field',
              name: { kind: 'Name', value: 'user' },
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                ],
              },
            },
            {
              kind: 'Field',
              name: { kind: 'Name', value: 'user' },
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                  { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                ],
              },
            },
          ],
        } as any,
      });
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getSelectedFields().sort()).toEqual(['id', 'name']);
    });

    test('should ignore fragment spreads with no matching fragment definition', () => {
      const context = createMockContext({
        info: {
          fieldNodes: [
            {
              kind: 'Field',
              name: { kind: 'Name', value: 'user' },
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                  { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Missing' } },
                ],
              },
            },
          ],
        } as any,
      });
      const gqlContext = GqlExecutionContext.create(context);

      expect(gqlContext.getSelectedFields()).toEqual(['id']);
    });
  });
});

describe('GQL_RESOLVER_ARGS', () => {
  test('should map the positional resolver arguments (root, args, context, info)', () => {
    expect(GQL_RESOLVER_ARGS).toEqual({
      ROOT: 0,
      ARGS: 1,
      CONTEXT: 2,
      INFO: 3,
    });
  });
});

describe('Helper Functions', () => {
  describe('getGqlContext', () => {
    test('should extract context', () => {
      const context = createMockContext({
        context: { test: 'value', req: {}, res: {} },
      });

      const result = getGqlContext(context);

      expect(result.test).toBe('value');
    });
  });

  describe('getGqlArgs', () => {
    test('should extract args', () => {
      const context = createMockContext({
        args: { id: '123' },
      });

      const result = getGqlArgs(context);

      expect(result.id).toBe('123');
    });
  });

  describe('getGqlInfo', () => {
    test('should extract info', () => {
      const context = createMockContext({
        info: { fieldName: 'test' } as any,
      });

      const result = getGqlInfo(context);

      expect(result.fieldName).toBe('test');
    });
  });

  describe('getGqlRoot', () => {
    test('should extract root', () => {
      const context = createMockContext({
        root: { id: 'root123' },
      });

      const result = getGqlRoot<{ id: string }>(context);

      expect(result.id).toBe('root123');
    });
  });
});
