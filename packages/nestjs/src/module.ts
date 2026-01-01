/**
 * @leaven-graphql/nestjs - NestJS Module
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import {
  Module,
  DynamicModule,
  Global,
  Provider,
  type Type,
  type InjectionToken,
} from '@nestjs/common';
import type {
  LeavenModuleOptions,
  LeavenModuleAsyncOptions,
  LeavenOptionsFactory,
} from './types';
import { LeavenDriver } from './driver';

/**
 * Injection token for Leaven module options
 */
export const LEAVEN_MODULE_OPTIONS = 'LEAVEN_MODULE_OPTIONS';

/**
 * Injection token for Leaven driver
 */
export const LEAVEN_DRIVER = 'LEAVEN_DRIVER';

/**
 * Leaven GraphQL Module for NestJS
 *
 * This module provides integration between NestJS and Leaven GraphQL.
 * It can be used with both schema-first and code-first approaches.
 *
 * @example
 * ```typescript
 * // Schema-first approach
 * @Module({
 *   imports: [
 *     LeavenModule.forRoot({
 *       typeDefs: `
 *         type Query {
 *           hello: String!
 *         }
 *       `,
 *       resolvers: {
 *         Query: {
 *           hello: () => 'Hello World!',
 *         },
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * // Async configuration
 * @Module({
 *   imports: [
 *     LeavenModule.forRootAsync({
 *       useFactory: (configService: ConfigService) => ({
 *         playground: configService.get('GRAPHQL_PLAYGROUND'),
 *         introspection: configService.get('GRAPHQL_INTROSPECTION'),
 *       }),
 *       inject: [ConfigService],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({})
export class LeavenModule {
  /**
   * Configure the module synchronously
   */
  public static forRoot(options: LeavenModuleOptions = {}): DynamicModule {
    const optionsProvider: Provider = {
      provide: LEAVEN_MODULE_OPTIONS,
      useValue: options,
    };

    const driverProvider: Provider = {
      provide: LEAVEN_DRIVER,
      useFactory: (opts: LeavenModuleOptions) => new LeavenDriver(opts),
      inject: [LEAVEN_MODULE_OPTIONS],
    };

    return {
      module: LeavenModule,
      providers: [optionsProvider, driverProvider],
      exports: [LEAVEN_MODULE_OPTIONS, LEAVEN_DRIVER],
    };
  }

  /**
   * Configure the module asynchronously
   */
  public static forRootAsync(options: LeavenModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);

    const driverProvider: Provider = {
      provide: LEAVEN_DRIVER,
      useFactory: (opts: LeavenModuleOptions) => new LeavenDriver(opts),
      inject: [LEAVEN_MODULE_OPTIONS],
    };

    return {
      module: LeavenModule,
      imports: options.imports ?? [],
      providers: [...asyncProviders, driverProvider],
      exports: [LEAVEN_MODULE_OPTIONS, LEAVEN_DRIVER],
    };
  }

  /**
   * Create async providers based on configuration
   */
  private static createAsyncProviders(
    options: LeavenModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<LeavenOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  /**
   * Create the async options provider
   */
  private static createAsyncOptionsProvider(
    options: LeavenModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: LEAVEN_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: (options.inject ?? []) as InjectionToken[],
      };
    }

    const inject = [
      (options.useClass ?? options.useExisting) as Type<LeavenOptionsFactory>,
    ];

    return {
      provide: LEAVEN_MODULE_OPTIONS,
      useFactory: async (optionsFactory: LeavenOptionsFactory) =>
        optionsFactory.createLeavenOptions(),
      inject,
    };
  }
}
