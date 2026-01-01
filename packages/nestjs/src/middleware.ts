/**
 * @leaven-graphql/nestjs - Middleware
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import {
  Injectable,
  type NestMiddleware,
  Inject,
  type Type,
} from '@nestjs/common';
import type { GqlContext } from './types';
// Express types for NestJS middleware compatibility
interface Request {
  method: string;
  path: string;
  body?: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
}

interface Response {
  status(code: number): Response;
  json(body: unknown): Response;
  send(body: unknown): Response;
  setHeader(name: string, value: string): Response;
  end(): Response;
}

type NextFunction = () => void;
import { LEAVEN_DRIVER, LEAVEN_MODULE_OPTIONS } from './module';
import { LeavenDriver } from './driver';
import type { LeavenModuleOptions } from './types';

/**
 * GraphQL middleware for handling GraphQL requests
 *
 * This middleware intercepts requests to the GraphQL endpoint
 * and processes them through the Leaven driver.
 */
@Injectable()
export class GraphQLMiddleware implements NestMiddleware {
  constructor(
    @Inject(LEAVEN_DRIVER) private readonly driver: LeavenDriver,
    @Inject(LEAVEN_MODULE_OPTIONS) private readonly options: LeavenModuleOptions
  ) {}

  /**
   * Handle incoming requests
   */
  public async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const path = this.driver.getPath();

    // Only handle requests to the GraphQL endpoint
    if (!req.path.endsWith(path)) {
      return next();
    }

    // Handle GET requests for playground
    if (req.method === 'GET' && this.driver.isPlaygroundEnabled()) {
      this.servePlayground(res);
      return;
    }

    // Handle POST requests for GraphQL queries
    if (req.method === 'POST') {
      await this.handleGraphQLRequest(req, res);
      return;
    }

    // Handle OPTIONS for CORS preflight
    if (req.method === 'OPTIONS') {
      this.handleCorsPreFlight(res);
      return;
    }

    next();
  }

  /**
   * Handle GraphQL request
   */
  private async handleGraphQLRequest(req: Request, res: Response): Promise<void> {
    try {
      const { query, variables, operationName } = req.body ?? {};

      if (!query) {
        res.status(400).json({
          errors: [{ message: 'Query is required' }],
        });
        return;
      }

      // Create context with request info
      const context = {
        req,
        res,
        ...(this.options.context
          ? await this.options.context(
              req as unknown as globalThis.Request,
              res as unknown as globalThis.Response
            )
          : {}),
      };

      const result = await this.driver.execute(
        query as string,
        variables as Record<string, unknown> | undefined,
        context as unknown as GqlContext,
        operationName as string | undefined
      );

      // Set appropriate status code
      const status = result.errors?.length ? 200 : 200; // GraphQL always returns 200
      res.status(status).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({
        errors: [{ message }],
      });
    }
  }

  /**
   * Serve GraphQL Playground HTML
   */
  private servePlayground(res: Response): void {
    const path = this.driver.getPath();
    const html = this.getPlaygroundHtml(path);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  /**
   * Handle CORS preflight request
   */
  private handleCorsPreFlight(res: Response): void {
    const corsOptions = this.options.cors;

    if (corsOptions === false) {
      res.status(204).end();
      return;
    }

    const options = corsOptions === true ? {} : corsOptions ?? {};

    res.setHeader(
      'Access-Control-Allow-Origin',
      Array.isArray(options.origin)
        ? options.origin.join(', ')
        : typeof options.origin === 'string' ? options.origin : '*'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      Array.isArray(options.methods)
        ? options.methods.join(', ')
        : options.methods ?? 'GET, POST, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      Array.isArray(options.allowedHeaders)
        ? options.allowedHeaders.join(', ')
        : options.allowedHeaders ?? 'Content-Type, Authorization'
    );

    if (options.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (options.maxAge) {
      res.setHeader('Access-Control-Max-Age', String(options.maxAge));
    }

    res.status(204).end();
  }

  /**
   * Get the playground HTML
   */
  private getPlaygroundHtml(endpoint: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leaven GraphQL Playground</title>
  <link rel="stylesheet" href="https://unpkg.com/graphiql@3.0.9/graphiql.min.css" />
  <style>
    body { margin: 0; height: 100vh; }
    #graphiql { height: 100vh; }
  </style>
</head>
<body>
  <div id="graphiql">Loading...</div>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/graphiql@3.0.9/graphiql.min.js"></script>
  <script>
    const fetcher = GraphiQL.createFetcher({ url: '${endpoint}' });
    ReactDOM.createRoot(document.getElementById('graphiql')).render(
      React.createElement(GraphiQL, { fetcher })
    );
  </script>
</body>
</html>
    `.trim();
  }
}

/**
 * Create middleware module with proper configuration
 */
export function createGraphQLMiddleware(): Type<NestMiddleware> {
  return GraphQLMiddleware;
}
