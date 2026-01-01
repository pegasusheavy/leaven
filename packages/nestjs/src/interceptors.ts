/**
 * @leaven-graphql/nestjs - Interceptors
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { COMPLEXITY_KEY, CACHE_KEY, type CacheHintOptions } from './decorators';

/**
 * Logging interceptor for GraphQL operations
 *
 * Logs timing and operation information for debugging.
 *
 * @example
 * ```typescript
 * @UseInterceptors(LoggingInterceptor)
 * @Resolver(() => User)
 * export class UserResolver {
 *   // ...
 * }
 * ```
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const start = performance.now();

    return next.handle().pipe(
      tap(() => {
        const duration = (performance.now() - start).toFixed(2);
        console.log(`[GraphQL] ${className}.${methodName} - ${duration}ms`);
      })
    );
  }
}

/**
 * Error formatting interceptor
 *
 * Catches errors and formats them consistently.
 *
 * @example
 * ```typescript
 * @UseInterceptors(ErrorFormattingInterceptor)
 * @Resolver(() => User)
 * export class UserResolver {
 *   // ...
 * }
 * ```
 */
@Injectable()
export class ErrorFormattingInterceptor implements NestInterceptor {
  public intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        // Format the error
        const formattedError = this.formatError(error);
        return throwError(() => formattedError);
      })
    );
  }

  /**
   * Format an error for GraphQL response
   */
  private formatError(error: unknown): Error {
    if (error instanceof Error) {
      // Remove sensitive stack traces in production
      if (process.env.NODE_ENV === 'production') {
        delete (error as { stack?: string }).stack;
      }
      return error;
    }
    return new Error(String(error));
  }
}

/**
 * Complexity tracking interceptor
 *
 * Tracks query complexity for monitoring.
 *
 * @example
 * ```typescript
 * @UseInterceptors(ComplexityInterceptor)
 * @Resolver(() => User)
 * export class UserResolver {
 *   @Query(() => [User])
 *   @Complexity(10)
 *   async users() {
 *     return this.userService.findAll();
 *   }
 * }
 * ```
 */
@Injectable()
export class ComplexityInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const complexity = this.reflector.get<number | undefined>(
      COMPLEXITY_KEY,
      context.getHandler()
    );

    if (complexity !== undefined) {
      // Store complexity for later aggregation
      const args = context.getArgs();
      const gqlContext = args[2];
      if (gqlContext) {
        gqlContext._fieldComplexity = complexity;
      }
    }

    return next.handle();
  }
}

/**
 * Caching interceptor
 *
 * Handles cache hints for responses.
 *
 * @example
 * ```typescript
 * @UseInterceptors(CachingInterceptor)
 * @Resolver(() => Settings)
 * export class SettingsResolver {
 *   @Query(() => Settings)
 *   @CacheHint({ maxAge: 3600, scope: 'PUBLIC' })
 *   async settings() {
 *     return this.settingsService.getAll();
 *   }
 * }
 * ```
 */
@Injectable()
export class CachingInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const cacheHint = this.reflector.get<CacheHintOptions | undefined>(
      CACHE_KEY,
      context.getHandler()
    );

    return next.handle().pipe(
      tap(() => {
        if (cacheHint) {
          // Store cache hints for response processing
          const args = context.getArgs();
          const gqlInfo = args[3];
          if (gqlInfo?.cacheControl) {
            gqlInfo.cacheControl.setCacheHint({
              maxAge: cacheHint.maxAge,
              scope: cacheHint.scope,
            });
          }
        }
      })
    );
  }
}

/**
 * Metrics interceptor
 *
 * Collects metrics for GraphQL operations.
 *
 * @example
 * ```typescript
 * @UseInterceptors(MetricsInterceptor)
 * @Resolver(() => User)
 * export class UserResolver {
 *   // ...
 * }
 * ```
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly metrics = new Map<string, OperationMetrics>();

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const key = `${className}.${methodName}`;
    const start = performance.now();

    return next.handle().pipe(
      tap(() => {
        const duration = performance.now() - start;
        this.recordSuccess(key, duration);
      }),
      catchError((error) => {
        const duration = performance.now() - start;
        this.recordError(key, duration);
        return throwError(() => error);
      })
    );
  }

  /**
   * Record a successful operation
   */
  private recordSuccess(key: string, duration: number): void {
    const metrics = this.getOrCreateMetrics(key);
    metrics.totalCount++;
    metrics.successCount++;
    metrics.totalDuration += duration;
    metrics.lastDuration = duration;
    metrics.minDuration = Math.min(metrics.minDuration, duration);
    metrics.maxDuration = Math.max(metrics.maxDuration, duration);
  }

  /**
   * Record an error
   */
  private recordError(key: string, duration: number): void {
    const metrics = this.getOrCreateMetrics(key);
    metrics.totalCount++;
    metrics.errorCount++;
    metrics.totalDuration += duration;
    metrics.lastDuration = duration;
  }

  /**
   * Get or create metrics for a key
   */
  private getOrCreateMetrics(key: string): OperationMetrics {
    let metrics = this.metrics.get(key);
    if (!metrics) {
      metrics = {
        totalCount: 0,
        successCount: 0,
        errorCount: 0,
        totalDuration: 0,
        lastDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
      };
      this.metrics.set(key, metrics);
    }
    return metrics;
  }

  /**
   * Get all metrics
   */
  public getMetrics(): Map<string, OperationMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Get metrics summary
   */
  public getSummary(): MetricsSummary[] {
    return Array.from(this.metrics.entries()).map(([operation, metrics]) => ({
      operation,
      ...metrics,
      averageDuration: metrics.totalCount > 0 ? metrics.totalDuration / metrics.totalCount : 0,
      errorRate: metrics.totalCount > 0 ? metrics.errorCount / metrics.totalCount : 0,
    }));
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.metrics.clear();
  }
}

/**
 * Operation metrics
 */
export interface OperationMetrics {
  totalCount: number;
  successCount: number;
  errorCount: number;
  totalDuration: number;
  lastDuration: number;
  minDuration: number;
  maxDuration: number;
}

/**
 * Metrics summary for an operation
 */
export interface MetricsSummary extends OperationMetrics {
  operation: string;
  averageDuration: number;
  errorRate: number;
}
