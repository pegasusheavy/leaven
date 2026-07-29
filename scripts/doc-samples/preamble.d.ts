/**
 * Ambient placeholders for the documentation samples.
 *
 * Docs samples are illustrative fragments: they show how a Leaven API is used
 * and lean on names the reader is expected to supply — a schema, a domain type,
 * an injected service. Those names are declared here so a fragment can be
 * type-checked without being rewritten into a runnable program.
 *
 * RULES
 *
 * 1. Nothing exported by `@leaven-graphql/*` may be declared here. A
 *    placeholder that shadowed a real export would let a sample compile while
 *    omitting the import it documents — the exact drift this check exists to
 *    catch. `assertPreambleDoesNotShadowLeaven()` in
 *    `scripts/check-doc-samples.ts` fails the run if that ever happens.
 * 2. Keep the list short and boring. Every entry is a name the docs use without
 *    defining; if a sample needs something specific, define it in the sample —
 *    the sample is documentation, and a reader benefits from the definition too.
 */

// --- The reader's schema and server ----------------------------------------
declare const schema: import('graphql').GraphQLSchema;
declare const typeDefs: string;
declare const resolvers: any;
declare const server: any;
declare const app: any;
declare const request: Request;
declare const response: Response;

// --- The reader's domain ----------------------------------------------------
declare class User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}
declare class Post {
  id: string;
  title: string;
  authorId: string;
}
declare class Comment {
  id: string;
  body: string;
}
declare class Message {
  id: string;
  body: string;
}
declare class UserStats {
  total: number;
}
declare class CreatePostInput {
  title: string;
}
declare type Database = any;
declare type AppContext = any;
declare type QueryData = any;
declare type UserService = any;
declare type PostService = any;
declare type ProfileService = any;
declare type MessageService = any;
declare type StatsService = any;

declare class Profile {
  id: string;
}
declare type CacheClient = any;

// --- The reader's collaborators ---------------------------------------------
declare const db: any;
declare const database: any;
declare const databaseConnection: any;
declare const redis: any;
declare const cacheClient: any;
declare const logger: any;
declare const auditLog: any;
declare const reportService: any;
declare const authenticatedUser: any;
declare const userId: string;
declare const token: string;
declare function currentRequestId(): string;
declare const clientIp: string;
declare const graphqlHandler: any;
declare const myCustomPlugin: any;
declare function verify(token: string): Promise<any>;
declare function authenticate(...args: any[]): any;
declare function authenticateRequest(...args: any[]): any;
declare function verifyToken(...args: any[]): any;
declare function getDatabase(...args: any[]): any;
declare function isValidEmail(value: string): boolean;
declare function findUser(...args: any[]): any;
declare function collectMetrics(...args: any[]): any;
declare function codeForStatus(status: number): string;
declare function onAnyUserEvent(...args: any[]): any;
declare function onAnyTenantUserCreated(...args: any[]): any;
declare class HttpException extends Error {
  getStatus(): number;
}

// --- The reader's schemas and directives ------------------------------------
declare const baseSchema: import('graphql').GraphQLSchema;
declare const usersSchema: import('graphql').GraphQLSchema;
declare const postsSchema: import('graphql').GraphQLSchema;
declare const commentsSchema: import('graphql').GraphQLSchema;

/**
 * Values a sample takes as given so it can show a call.
 *
 * These are `any` on purpose: the point of, say, `formatError(error, { ... })`
 * is that the *options literal* is checked against the real parameter type, and
 * an `any` first argument does not weaken that at all.
 */
declare const error: any;
declare const errors: any;
declare const options: any;
declare const data: any;
declare const result: any;
declare const message: any;
declare const metrics: any;
declare const socket: any;
declare const id: string;
declare const caughtError: Error;
declare const contextValue: any;
declare const graphqlRequest: import('@leaven-graphql/core').GraphQLRequest;

/**
 * Samples written as a class body reach for `this.<service>` — an injected
 * collaborator the reader owns. A global declaration cannot supply those, so
 * such samples declare the field themselves (which reads better anyway).
 */
