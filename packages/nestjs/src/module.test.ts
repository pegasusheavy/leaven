/**
 * @leaven-graphql/nestjs - Module tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import { LeavenModule, LEAVEN_MODULE_OPTIONS, LEAVEN_DRIVER } from './module';
import type { LeavenModuleOptions } from './types';

describe('LeavenModule', () => {
  describe('forRoot', () => {
    test('should create module with default options', () => {
      const module = LeavenModule.forRoot();

      expect(module.module).toBe(LeavenModule);
      expect(module.providers).toBeDefined();
      expect(module.exports).toContain(LEAVEN_MODULE_OPTIONS);
      expect(module.exports).toContain(LEAVEN_DRIVER);
    });

    test('should create module with custom options', () => {
      const options: LeavenModuleOptions = {
        path: '/api/graphql',
        playground: true,
        introspection: true,
      };

      const module = LeavenModule.forRoot(options);

      expect(module.module).toBe(LeavenModule);
      expect(module.providers).toBeDefined();
      expect(module.providers?.length).toBeGreaterThan(0);
    });

    test('should provide options with correct token', () => {
      const options: LeavenModuleOptions = {
        path: '/custom',
      };

      const module = LeavenModule.forRoot(options);
      const optionsProvider = module.providers?.find(
        (p) => (p as { provide: symbol }).provide === LEAVEN_MODULE_OPTIONS
      );

      expect(optionsProvider).toBeDefined();
      expect((optionsProvider as { useValue: LeavenModuleOptions }).useValue).toEqual(options);
    });

    test('should provide driver with correct token', () => {
      const module = LeavenModule.forRoot();
      const driverProvider = module.providers?.find(
        (p) => (p as { provide: symbol }).provide === LEAVEN_DRIVER
      );

      expect(driverProvider).toBeDefined();
      expect((driverProvider as { useFactory: Function }).useFactory).toBeDefined();
    });
  });

  describe('forRootAsync', () => {
    test('should create module with factory', () => {
      const module = LeavenModule.forRootAsync({
        useFactory: () => ({
          path: '/graphql',
        }),
      });

      expect(module.module).toBe(LeavenModule);
      expect(module.providers).toBeDefined();
      expect(module.exports).toContain(LEAVEN_MODULE_OPTIONS);
      expect(module.exports).toContain(LEAVEN_DRIVER);
    });

    test('should create module with async factory', () => {
      const module = LeavenModule.forRootAsync({
        useFactory: async () => ({
          path: '/graphql',
          playground: true,
        }),
      });

      expect(module.module).toBe(LeavenModule);
      expect(module.providers).toBeDefined();
    });

    test('should create module with inject dependencies', () => {
      const ConfigService = class ConfigService {};

      const module = LeavenModule.forRootAsync({
        useFactory: (_config: unknown) => ({
          path: '/graphql',
        }),
        inject: [ConfigService],
      });

      expect(module.module).toBe(LeavenModule);
      expect(module.providers).toBeDefined();
    });

    test('should create module with useClass', () => {
      class CustomOptionsFactory {
        createLeavenOptions(): LeavenModuleOptions {
          return { path: '/graphql' };
        }
      }

      const module = LeavenModule.forRootAsync({
        useClass: CustomOptionsFactory,
      });

      expect(module.module).toBe(LeavenModule);
      expect(module.providers?.length).toBeGreaterThan(1);
    });

    test('should create module with useExisting', () => {
      class ExistingOptionsFactory {
        createLeavenOptions(): LeavenModuleOptions {
          return { path: '/graphql' };
        }
      }

      const module = LeavenModule.forRootAsync({
        useExisting: ExistingOptionsFactory,
      });

      expect(module.module).toBe(LeavenModule);
      expect(module.providers).toBeDefined();
    });

    test('should include imports', () => {
      const MockModule = class MockModule {};

      const module = LeavenModule.forRootAsync({
        imports: [MockModule as any],
        useFactory: () => ({}),
      });

      expect(module.imports).toContain(MockModule);
    });
  });

  describe('token exports', () => {
    test('should export LEAVEN_MODULE_OPTIONS token', () => {
      expect(LEAVEN_MODULE_OPTIONS).toBe('LEAVEN_MODULE_OPTIONS');
    });

    test('should export LEAVEN_DRIVER token', () => {
      expect(LEAVEN_DRIVER).toBe('LEAVEN_DRIVER');
    });
  });
});
