/**
 * @leaven-graphql/context - Request context
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { BaseContext } from './types';

/**
 * HTTP request information
 */
export interface RequestInfo {
  /** Request method */
  method: string;
  /** Request URL */
  url: string;
  /** Request headers */
  headers: Record<string, string>;
  /** Client IP address */
  ip?: string;
  /** User agent */
  userAgent?: string;
}

/**
 * Configuration for request context
 */
export interface RequestContextConfig {
  /** Generate request IDs */
  generateRequestId?: () => string;
  /** Extract IP from headers */
  trustProxy?: boolean;
  /** Headers to trust for IP extraction */
  proxyHeaders?: string[];
}

/**
 * Request context with HTTP information
 */
export class RequestContext implements BaseContext {
  public readonly requestId: string;
  public readonly startTime: number;
  public readonly request: RequestInfo;

  constructor(request: RequestInfo, config?: RequestContextConfig) {
    this.requestId = config?.generateRequestId?.() ?? generateId();
    this.startTime = Date.now();
    this.request = request;
  }

  /**
   * Get a header value
   */
  public getHeader(name: string): string | undefined {
    const lowerName = name.toLowerCase();
    for (const [key, value] of Object.entries(this.request.headers)) {
      if (key.toLowerCase() === lowerName) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Get the client IP address
   */
  public getClientIp(config?: RequestContextConfig): string | undefined {
    if (config?.trustProxy) {
      const proxyHeaders = config.proxyHeaders ?? [
        'x-forwarded-for',
        'x-real-ip',
        'cf-connecting-ip',
      ];

      for (const header of proxyHeaders) {
        const value = this.getHeader(header);
        if (value) {
          // X-Forwarded-For may contain multiple IPs
          return value.split(',')[0]?.trim();
        }
      }
    }

    return this.request.ip;
  }

  /**
   * Get the elapsed time since the request started
   */
  public getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Create a child context with additional properties
   */
  public extend<T extends Record<string, unknown>>(
    properties: T
  ): RequestContext & T {
    return Object.assign(Object.create(this), properties);
  }

  /**
   * Convert to a JSON-serializable object
   */
  public toJSON(): {
    requestId: string;
    startTime: number;
    method: string;
    url: string;
  } {
    return {
      requestId: this.requestId,
      startTime: this.startTime,
      method: this.request.method,
      url: this.request.url,
    };
  }
}

/**
 * Generate a unique request ID
 */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

/**
 * Create a request context from a Bun request
 */
export function createRequestContext(
  request: Request,
  config?: RequestContextConfig
): RequestContext {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const userAgent = request.headers.get('user-agent');
  const requestInfo: RequestInfo = {
    method: request.method,
    url: request.url,
    headers,
  };

  if (userAgent) {
    requestInfo.userAgent = userAgent;
  }

  return new RequestContext(requestInfo, config);
}
