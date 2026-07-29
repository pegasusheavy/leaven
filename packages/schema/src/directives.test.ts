/**
 * @leaven-graphql/schema - Directive tests
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import {
  buildSchema,
  DirectiveLocation,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLString,
  type GraphQLSchema,
} from 'graphql';
import {
  createDirective,
  addDirective,
  addDirectives,
  applyDirectives,
  getDirectiveValues,
  specDeprecatedDirective,
  authDirective,
  cacheControlDirective,
} from './directives';

describe('createDirective', () => {
  test('should create a directive with name, description and locations', () => {
    const directive = createDirective({
      name: 'example',
      description: 'An example directive',
      locations: [DirectiveLocation.FIELD_DEFINITION],
    });

    expect(directive.name).toBe('example');
    expect(directive.description).toBe('An example directive');
    expect(directive.locations).toEqual([DirectiveLocation.FIELD_DEFINITION]);
  });

  test('should map argument types and default values', () => {
    const directive = createDirective({
      name: 'limits',
      locations: [DirectiveLocation.FIELD_DEFINITION],
      args: {
        label: { type: 'String', defaultValue: 'none' },
        max: { type: 'Int' },
        enabled: { type: 'Boolean' },
      },
    });

    const argTypes = Object.fromEntries(
      directive.args.map((arg) => [arg.name, arg.type])
    );
    expect(argTypes.label).toBe(GraphQLString);
    expect(argTypes.max).toBe(GraphQLInt);
    expect(argTypes.enabled).toBe(GraphQLBoolean);

    const label = directive.args.find((arg) => arg.name === 'label');
    expect(label?.defaultValue).toBe('none');
  });
});

describe('addDirective', () => {
  test('should add a directive to a schema', () => {
    const schema = buildSchema('type Query { hello: String }');
    const result = addDirective(schema, authDirective);

    expect(result).not.toBe(schema);
    expect(result.getDirective('auth')).toBeDefined();
  });

  test('should return the schema unchanged when the directive already exists', () => {
    // graphql-js always provides the spec @deprecated directive
    const schema = buildSchema('type Query { hello: String }');
    const result = addDirective(schema, specDeprecatedDirective);

    expect(result).toBe(schema);
  });
});

describe('addDirectives', () => {
  test('should add every new directive in one rebuild', () => {
    const schema = buildSchema('type Query { hello: String }');
    const result = addDirectives(schema, [authDirective, cacheControlDirective]);

    expect(result).not.toBe(schema);
    expect(result.getDirective('auth')).toBeDefined();
    expect(result.getDirective('cacheControl')).toBeDefined();
  });

  test('should skip directives that already exist on the schema', () => {
    const schema = addDirective(
      buildSchema('type Query { hello: String }'),
      authDirective
    );

    const result = addDirectives(schema, [authDirective, cacheControlDirective]);

    expect(
      result.getDirectives().filter((d) => d.name === 'auth')
    ).toHaveLength(1);
    expect(result.getDirective('cacheControl')).toBeDefined();
  });

  test('should skip duplicates within the same batch', () => {
    const schema = buildSchema('type Query { hello: String }');
    const result = addDirectives(schema, [authDirective, authDirective]);

    expect(
      result.getDirectives().filter((d) => d.name === 'auth')
    ).toHaveLength(1);
  });

  test('should return the schema unchanged when nothing is left to add', () => {
    const schema = buildSchema('type Query { hello: String }');

    expect(addDirectives(schema, [])).toBe(schema);
    expect(addDirectives(schema, [specDeprecatedDirective])).toBe(schema);
  });
});

describe('applyDirectives', () => {
  test('should invoke each transformer with the schema and directive name', () => {
    const schema = buildSchema('type Query { hello: String }');
    const calls: string[] = [];

    const passthrough = (input: GraphQLSchema, name: string): GraphQLSchema => {
      calls.push(name);
      return input;
    };

    const result = applyDirectives(schema, {
      first: passthrough,
      second: passthrough,
    });

    expect(calls).toEqual(['first', 'second']);
    expect(result).toBe(schema);
  });

  test('should chain transformed schemas', () => {
    const schema = buildSchema('type Query { hello: String }');

    const result = applyDirectives(schema, {
      auth: (input) => addDirective(input, authDirective),
      cacheControl: (input) => addDirective(input, cacheControlDirective),
    });

    expect(result.getDirective('auth')).toBeDefined();
    expect(result.getDirective('cacheControl')).toBeDefined();
  });
});

describe('getDirectiveValues', () => {
  const sdl = `
    directive @meta(
      str: String
      num: Int
      flt: Float
      flag: Boolean
      nothing: String
      tags: [String]
      extra: MetaInput
      color: Color
    ) on FIELD_DEFINITION

    input MetaInput {
      a: Int
      nested: [String]
    }

    enum Color {
      RED
      GREEN
    }

    type Query {
      hello: String
        @meta(
          str: "s"
          num: 42
          flt: 1.5
          flag: true
          nothing: null
          tags: ["x", "y"]
          extra: { a: 1, nested: ["deep"] }
          color: RED
        )
      plain: String
    }
  `;

  test('should convert scalar, enum, list and object argument values', () => {
    const schema = buildSchema(sdl);
    const fields = schema.getQueryType()!.toConfig().fields;

    const values = getDirectiveValues(fields.hello!, 'meta');

    expect(values).toEqual({
      str: 's',
      num: 42,
      flt: 1.5,
      flag: true,
      nothing: null,
      tags: ['x', 'y'],
      extra: { a: 1, nested: ['deep'] },
      color: 'RED',
    });
  });

  test('should return null when the directive is not present', () => {
    const schema = buildSchema(sdl);
    const fields = schema.getQueryType()!.toConfig().fields;

    expect(getDirectiveValues(fields.plain!, 'meta')).toBeNull();
  });

  test('should return null when the field has no AST node', () => {
    expect(getDirectiveValues({ type: GraphQLString }, 'meta')).toBeNull();
  });
});

describe('specDeprecatedDirective', () => {
  test('should cover all spec locations', () => {
    expect(specDeprecatedDirective.locations).toEqual([
      DirectiveLocation.FIELD_DEFINITION,
      DirectiveLocation.ARGUMENT_DEFINITION,
      DirectiveLocation.INPUT_FIELD_DEFINITION,
      DirectiveLocation.ENUM_VALUE,
    ]);
  });

  test('should default the reason argument', () => {
    const reason = specDeprecatedDirective.args.find(
      (arg) => arg.name === 'reason'
    );
    expect(reason?.defaultValue).toBe('No longer supported');
  });
});

describe('common directives', () => {
  test('authDirective should target fields and objects', () => {
    expect(authDirective.name).toBe('auth');
    expect(authDirective.locations).toEqual([
      DirectiveLocation.FIELD_DEFINITION,
      DirectiveLocation.OBJECT,
    ]);
  });

  test('cacheControlDirective should expose maxAge and scope arguments', () => {
    expect(cacheControlDirective.name).toBe('cacheControl');
    const argNames = cacheControlDirective.args.map((arg) => arg.name).sort();
    expect(argNames).toEqual(['maxAge', 'scope']);
  });
});
