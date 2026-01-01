/**
 * @leaven-graphql/http - Bun HTTP server
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import type { Server } from 'bun';
import { createHandler, type HandlerConfig, type GraphQLHandler } from './handler';

/**
 * Server configuration
 */
export interface ServerConfig<TContext = unknown> extends HandlerConfig<TContext> {
  /** Port to listen on (default: 4000) */
  port?: number;
  /** Hostname to bind to (default: '0.0.0.0') */
  hostname?: string;
  /** Enable development mode */
  development?: boolean;
  /** Custom fetch handler for non-GraphQL routes */
  fallback?: (request: Request) => Response | Promise<Response>;
  /** Routes map for multiple endpoints */
  routes?: Record<string, GraphQLHandler | ((request: Request) => Response | Promise<Response>)>;
  /** Called when server starts */
  onStart?: (server: Server) => void;
  /** Called when server stops */
  onStop?: () => void;
  /** Called on request error */
  onError?: (error: Error, request: Request) => Response | Promise<Response>;
}

/**
 * Server information
 */
export interface ServerInfo {
  /** Port the server is listening on */
  port: number;
  /** Hostname the server is bound to */
  hostname: string;
  /** Full URL of the server */
  url: string;
}

/**
 * Leaven GraphQL Server for Bun
 */
export class LeavenServer {
  private server: Server | null = null;
  private readonly config: ServerConfig;
  private readonly handler: GraphQLHandler;
  private readonly path: string;

  constructor(config: ServerConfig) {
    this.config = config;
    this.path = config.path ?? '/graphql';
    this.handler = createHandler(config);
  }

  /**
   * Handle incoming requests
   */
  private async handleRequest(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);

      // Check routes
      if (this.config.routes) {
        for (const [routePath, routeHandler] of Object.entries(this.config.routes)) {
          if (url.pathname === routePath) {
            return routeHandler(request);
          }
        }
      }

      // Handle GraphQL endpoint
      if (url.pathname === this.path) {
        return this.handler(request);
      }

      // Fallback handler
      if (this.config.fallback) {
        return this.config.fallback(request);
      }

      // Default 404
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      if (this.config.onError) {
        return this.config.onError(error as Error, request);
      }

      console.error('Request error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  /**
   * Start the server
   */
  public start(): ServerInfo {
    const port = this.config.port ?? 4000;
    const hostname = this.config.hostname ?? '0.0.0.0';

    this.server = Bun.serve({
      port,
      hostname,
      development: this.config.development,
      fetch: (request) => this.handleRequest(request),
    });

    const info: ServerInfo = {
      port: this.server.port,
      hostname: this.server.hostname,
      url: `http://${hostname === '0.0.0.0' ? 'localhost' : hostname}:${this.server.port}${this.path}`,
    };

    this.config.onStart?.(this.server);

    return info;
  }

  /**
   * Stop the server
   */
  public stop(): void {
    if (this.server) {
      this.server.stop();
      this.server = null;
      this.config.onStop?.();
    }
  }

  /**
   * Get the underlying Bun server
   */
  public getServer(): Server | null {
    return this.server;
  }

  /**
   * Check if the server is running
   */
  public isRunning(): boolean {
    return this.server !== null;
  }

  /**
   * Reload the server (for development)
   */
  public reload(): void {
    if (this.server) {
      this.server.reload({
        fetch: (request) => this.handleRequest(request),
      });
    }
  }
}

/**
 * Create and start a Leaven GraphQL server
 */
export function createServer<TContext = unknown>(
  config: ServerConfig<TContext>
): LeavenServer {
  return new LeavenServer(config as ServerConfig);
}
