/**
 * @leaven-graphql/context - Request context
 *
 * Copyright 2026 Joseph Quinn
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
  private readonly config: RequestContextConfig | undefined;
  private readonly normalizedHeaders: Map<string, string>;

  constructor(request: RequestInfo, config?: RequestContextConfig) {
    this.requestId = config?.generateRequestId?.() ?? generateId();
    this.startTime = Date.now();
    this.request = request;
    this.config = config;
    this.normalizedHeaders = new Map();
    for (const [key, value] of Object.entries(request.headers)) {
      this.normalizedHeaders.set(key.toLowerCase(), value);
    }
  }

  /**
   * Get a header value (case-insensitive)
   */
  public getHeader(name: string): string | undefined {
    return this.normalizedHeaders.get(name.toLowerCase());
  }

  /**
   * Get the client IP address
   *
   * Uses the configuration provided at construction time by default; a
   * config passed here overrides it for this call only.
   */
  public getClientIp(config?: RequestContextConfig): string | undefined {
    const effectiveConfig = config ?? this.config;
    if (effectiveConfig?.trustProxy) {
      const proxyHeaders = effectiveConfig.proxyHeaders ?? [
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
    // Copy own properties onto a fresh object sharing this instance's
    // prototype, so the child has real own properties (visible to spread,
    // Object.keys, JSON round-trips) while class methods are preserved.
    return Object.assign(
      Object.create(Object.getPrototypeOf(this) as object) as RequestContext,
      this,
      properties
    );
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
 * Generate a unique request ID using cryptographically secure randomness
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create a request context from a Bun request
 *
 * @param request - The incoming request
 * @param config - Optional request context configuration
 * @param ip - Optional client (peer) IP address. `Request` does not carry the
 *   socket address, so the HTTP layer should supply it, e.g. from
 *   `server.requestIP(request)?.address` in a Bun server.
 */
export function createRequestContext(
  request: Request,
  config?: RequestContextConfig,
  ip?: string
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

  if (ip) {
    requestInfo.ip = ip;
  }

  return new RequestContext(requestInfo, config);
}
