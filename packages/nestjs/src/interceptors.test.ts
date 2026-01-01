/**
 * @leaven-graphql/nestjs - Interceptors tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { of, throwError } from 'rxjs';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext, CallHandler } from '@nestjs/common';
import {
  LoggingInterceptor,
  ErrorFormattingInterceptor,
  ComplexityInterceptor,
  CachingInterceptor,
  MetricsInterceptor,
} from './interceptors';

function createMockContext(): ExecutionContext {
  return {
    getHandler: () => ({ name: 'testMethod' }),
    getClass: () => ({ name: 'TestClass' }),
    getArgs: () => [{}, {}, {}, {}],
    getType: () => 'graphql',
    switchToHttp: () => ({} as any),
    switchToRpc: () => ({} as any),
    switchToWs: () => ({} as any),
    getArgByIndex: () => ({} as any),
  } as unknown as ExecutionContext;
}

function createMockCallHandler(returnValue: unknown = 'success'): CallHandler {
  return {
    handle: () => of(returnValue),
  };
}

function createErrorCallHandler(error: Error): CallHandler {
  return {
    handle: () => throwError(() => error),
  };
}

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let consoleLogSpy: ReturnType<typeof mock>;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    consoleLogSpy = mock(() => {});
    console.log = consoleLogSpy;
  });

  test('should log successful execution', async () => {
    const context = createMockContext();
    const handler = createMockCallHandler();

    const result$ = interceptor.intercept(context, handler);

    await new Promise<void>((resolve) => {
      result$.subscribe({
        next: (value) => {
          expect(value).toBe('success');
        },
        complete: () => {
          expect(consoleLogSpy).toHaveBeenCalled();
          resolve();
        },
      });
    });
  });

  test('should include timing in log', async () => {
    const context = createMockContext();
    const handler = createMockCallHandler();

    const result$ = interceptor.intercept(context, handler);

    await new Promise<void>((resolve) => {
      result$.subscribe({
        complete: () => {
          const logCall = consoleLogSpy.mock.calls[0][0];
          expect(logCall).toContain('[GraphQL]');
          expect(logCall).toContain('TestClass.testMethod');
          expect(logCall).toContain('ms');
          resolve();
        },
      });
    });
  });
});

describe('ErrorFormattingInterceptor', () => {
  let interceptor: ErrorFormattingInterceptor;

  beforeEach(() => {
    interceptor = new ErrorFormattingInterceptor();
  });

  test('should pass through successful results', async () => {
    const context = createMockContext();
    const handler = createMockCallHandler({ data: 'test' });

    const result$ = interceptor.intercept(context, handler);

    await new Promise<void>((resolve) => {
      result$.subscribe({
        next: (value) => {
          expect(value).toEqual({ data: 'test' });
          resolve();
        },
      });
    });
  });

  test('should format errors', async () => {
    const context = createMockContext();
    const error = new Error('Test error');
    const handler = createErrorCallHandler(error);

    const result$ = interceptor.intercept(context, handler);

    await new Promise<void>((resolve) => {
      result$.subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe('Test error');
          resolve();
        },
      });
    });
  });

  test('should handle non-Error objects', async () => {
    const context = createMockContext();
    const handler = {
      handle: () => throwError(() => 'string error'),
    };

    const result$ = interceptor.intercept(context, handler);

    await new Promise<void>((resolve) => {
      result$.subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe('string error');
          resolve();
        },
      });
    });
  });
});

describe('ComplexityInterceptor', () => {
  let interceptor: ComplexityInterceptor;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new ComplexityInterceptor(reflector);
  });

  test('should store complexity in context', async () => {
    reflector.get = () => 10;

    const gqlContext: Record<string, unknown> = {};
    const context = {
      ...createMockContext(),
      getArgs: () => [{}, {}, gqlContext, {}],
    } as ExecutionContext;

    const handler = createMockCallHandler();

    const result$ = interceptor.intercept(context, handler);

    await new Promise<void>((resolve) => {
      result$.subscribe({
        complete: () => {
          expect(gqlContext._fieldComplexity).toBe(10);
          resolve();
        },
      });
    });
  });

  test('should not set complexity if not defined', async () => {
    reflector.get = () => undefined;

    const gqlContext: Record<string, unknown> = {};
    const context = {
      ...createMockContext(),
      getArgs: () => [{}, {}, gqlContext, {}],
    } as ExecutionContext;

    const handler = createMockCallHandler();

    const result$ = interceptor.intercept(context, handler);

    await new Promise<void>((resolve) => {
      result$.subscribe({
        complete: () => {
          expect(gqlContext._fieldComplexity).toBeUndefined();
          resolve();
        },
      });
    });
  });
});

describe('CachingInterceptor', () => {
  let interceptor: CachingInterceptor;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new CachingInterceptor(reflector);
  });

  test('should pass through when no cache hint', async () => {
    reflector.get = () => undefined;

    const context = createMockContext();
    const handler = createMockCallHandler({ data: 'test' });

    const result$ = interceptor.intercept(context, handler);

    await new Promise<void>((resolve) => {
      result$.subscribe({
        next: (value) => {
          expect(value).toEqual({ data: 'test' });
          resolve();
        },
      });
    });
  });

  test('should apply cache hint when defined', async () => {
    reflector.get = () => ({ maxAge: 3600, scope: 'PUBLIC' });

    const cacheControl = {
      setCacheHint: mock(() => {}),
    };
    const context = {
      ...createMockContext(),
      getArgs: () => [{}, {}, {}, { cacheControl }],
    } as ExecutionContext;

    const handler = createMockCallHandler();

    const result$ = interceptor.intercept(context, handler);

    await new Promise<void>((resolve) => {
      result$.subscribe({
        complete: () => {
          expect(cacheControl.setCacheHint).toHaveBeenCalledWith({
            maxAge: 3600,
            scope: 'PUBLIC',
          });
          resolve();
        },
      });
    });
  });
});

describe('MetricsInterceptor', () => {
  let interceptor: MetricsInterceptor;

  beforeEach(() => {
    interceptor = new MetricsInterceptor();
  });

  test('should record successful operations', async () => {
    const context = createMockContext();
    const handler = createMockCallHandler();

    const result$ = interceptor.intercept(context, handler);

    await new Promise<void>((resolve) => {
      result$.subscribe({
        complete: () => {
          const metrics = interceptor.getMetrics();
          const key = 'TestClass.testMethod';

          expect(metrics.has(key)).toBe(true);
          expect(metrics.get(key)?.successCount).toBe(1);
          expect(metrics.get(key)?.errorCount).toBe(0);
          resolve();
        },
      });
    });
  });

  test('should record error operations', async () => {
    const context = createMockContext();
    const handler = createErrorCallHandler(new Error('Test error'));

    const result$ = interceptor.intercept(context, handler);

    await new Promise<void>((resolve) => {
      result$.subscribe({
        error: () => {
          const metrics = interceptor.getMetrics();
          const key = 'TestClass.testMethod';

          expect(metrics.has(key)).toBe(true);
          expect(metrics.get(key)?.errorCount).toBe(1);
          resolve();
        },
      });
    });
  });

  test('should aggregate multiple operations', async () => {
    const context = createMockContext();
    const handler = createMockCallHandler();

    // Execute multiple times
    for (let i = 0; i < 5; i++) {
      await new Promise<void>((resolve) => {
        interceptor.intercept(context, handler).subscribe({
          complete: resolve,
        });
      });
    }

    const metrics = interceptor.getMetrics();
    const key = 'TestClass.testMethod';

    expect(metrics.get(key)?.totalCount).toBe(5);
    expect(metrics.get(key)?.successCount).toBe(5);
  });

  test('should return summary with calculated fields', async () => {
    const context = createMockContext();
    const handler = createMockCallHandler();

    await new Promise<void>((resolve) => {
      interceptor.intercept(context, handler).subscribe({
        complete: resolve,
      });
    });

    const summary = interceptor.getSummary();

    expect(summary.length).toBe(1);
    expect(summary[0].operation).toBe('TestClass.testMethod');
    expect(summary[0].averageDuration).toBeGreaterThanOrEqual(0);
    expect(summary[0].errorRate).toBe(0);
  });

  test('should reset metrics', async () => {
    const context = createMockContext();
    const handler = createMockCallHandler();

    await new Promise<void>((resolve) => {
      interceptor.intercept(context, handler).subscribe({
        complete: resolve,
      });
    });

    expect(interceptor.getMetrics().size).toBe(1);

    interceptor.reset();

    expect(interceptor.getMetrics().size).toBe(0);
  });

  test('should calculate min and max durations', async () => {
    const context = createMockContext();

    // Execute with varying delays
    for (let i = 0; i < 3; i++) {
      await new Promise<void>((resolve) => {
        interceptor.intercept(context, createMockCallHandler()).subscribe({
          complete: resolve,
        });
      });
    }

    const metrics = interceptor.getMetrics();
    const key = 'TestClass.testMethod';

    expect(metrics.get(key)?.minDuration).toBeGreaterThanOrEqual(0);
    expect(metrics.get(key)?.maxDuration).toBeGreaterThanOrEqual(0);
  });
});
