/**
 * @leaven-graphql/ws - GraphQL over WebSocket protocol
 *
 * Copyright 2026 Joseph Quinn
 * Licensed under the Apache License, Version 2.0
 *
 * Implements graphql-ws protocol
 */

/**
 * Message types as defined by graphql-ws protocol
 */
export enum MessageType {
  ConnectionInit = 'connection_init',
  ConnectionAck = 'connection_ack',
  Ping = 'ping',
  Pong = 'pong',
  Subscribe = 'subscribe',
  Next = 'next',
  Error = 'error',
  Complete = 'complete',
}

/**
 * Connection init message
 */
export interface ConnectionInitMessage {
  type: MessageType.ConnectionInit;
  payload?: Record<string, unknown>;
}

/**
 * Connection ack message
 */
export interface ConnectionAckMessage {
  type: MessageType.ConnectionAck;
  payload?: Record<string, unknown>;
}

/**
 * Ping message
 */
export interface PingMessage {
  type: MessageType.Ping;
  payload?: Record<string, unknown>;
}

/**
 * Pong message
 */
export interface PongMessage {
  type: MessageType.Pong;
  payload?: Record<string, unknown>;
}

/**
 * Subscribe message
 */
export interface SubscribeMessage {
  id: string;
  type: MessageType.Subscribe;
  payload: {
    operationName?: string;
    query: string;
    variables?: Record<string, unknown>;
    extensions?: Record<string, unknown>;
  };
}

/**
 * Next message (data result)
 */
export interface NextMessage {
  id: string;
  type: MessageType.Next;
  payload: {
    data?: Record<string, unknown> | null;
    errors?: readonly { message: string; [key: string]: unknown }[];
    extensions?: Record<string, unknown>;
  };
}

/**
 * Error message
 */
export interface ErrorMessage {
  id: string;
  type: MessageType.Error;
  payload: readonly { message: string; [key: string]: unknown }[];
}

/**
 * Complete message
 */
export interface CompleteMessage {
  id: string;
  type: MessageType.Complete;
}

/**
 * All message types
 */
export type Message =
  | ConnectionInitMessage
  | ConnectionAckMessage
  | PingMessage
  | PongMessage
  | SubscribeMessage
  | NextMessage
  | ErrorMessage
  | CompleteMessage;

/** Valid message types, hoisted so parseMessage does not allocate per frame */
const VALID_MESSAGE_TYPES: ReadonlySet<string> = new Set(Object.values(MessageType));

/** Message types that require a string `id` field */
const ID_REQUIRED_TYPES: ReadonlySet<string> = new Set([
  MessageType.Subscribe,
  MessageType.Next,
  MessageType.Error,
  MessageType.Complete,
]);

/**
 * Options for {@link parseMessage}
 */
export interface ParseMessageOptions {
  /**
   * Require a string `id` on the message types that carry one
   * (`subscribe`, `next`, `error`, `complete`). Defaults to `true`.
   *
   * `true` is correct for a server parsing CLIENT -> server frames: an
   * operation frame with no id cannot be routed, so rejecting it is the only
   * safe option.
   *
   * Pass `false` when parsing SERVER -> client frames on the client side. A
   * lenient peer may omit the id on `next`/`error`, and a parse throw there is
   * far more disruptive (it tears down the whole connection) than tolerating
   * the frame.
   */
  requireId?: boolean;
}

/**
 * Parse a WebSocket message
 *
 * By default this is strict about the `id` field (see
 * {@link ParseMessageOptions.requireId}); pass `{ requireId: false }` to
 * restore the lenient behaviour for peer frames that may omit it.
 */
export function parseMessage(
  data: string | Buffer,
  options: ParseMessageOptions = {}
): Message {
  const requireId = options.requireId ?? true;
  const text = typeof data === 'string' ? data : data.toString('utf-8');

  try {
    const parsed: unknown = JSON.parse(text);

    // `JSON.parse` happily returns `null`, a number, a string or an array for
    // perfectly valid JSON. Reject those explicitly: without this check the
    // `message.type` dereference below throws an engine-specific TypeError
    // ("null is not an object"), which the server then hands back to the
    // client as a close reason.
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Message must be an object');
    }

    const message = parsed as { type?: unknown; id?: unknown };

    if (!message.type) {
      throw new Error('Message must have a type');
    }

    if (typeof message.type !== 'string' || !VALID_MESSAGE_TYPES.has(message.type)) {
      throw new Error(`Invalid message type: ${String(message.type)}`);
    }

    if (
      requireId &&
      ID_REQUIRED_TYPES.has(message.type) &&
      typeof message.id !== 'string'
    ) {
      throw new Error(`Message of type "${message.type}" must have a string id`);
    }

    return message as Message;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON message');
    }
    throw error;
  }
}

/**
 * Format a message for sending
 */
export function formatMessage(message: Message): string {
  return JSON.stringify(message);
}

/**
 * Create a connection ack message
 */
export function createConnectionAck(
  payload?: Record<string, unknown>
): ConnectionAckMessage {
  return {
    type: MessageType.ConnectionAck,
    payload,
  };
}

/**
 * Create a next message
 */
export function createNextMessage(
  id: string,
  data: Record<string, unknown> | null | undefined,
  errors?: readonly { message: string }[]
): NextMessage {
  return {
    id,
    type: MessageType.Next,
    payload: {
      data,
      errors,
    },
  };
}

/**
 * Create an error message
 *
 * The parameter is deliberately looser than {@link ErrorMessage.payload}, and
 * matches {@link createNextMessage}: graphql-js hands back
 * `GraphQLFormattedError`, an interface with no index signature, so requiring
 * one here would reject the very errors this is called with.
 */
export function createErrorMessage(
  id: string,
  errors: readonly { message: string }[]
): ErrorMessage {
  return {
    id,
    type: MessageType.Error,
    payload: errors,
  };
}

/**
 * Create a complete message
 */
export function createCompleteMessage(id: string): CompleteMessage {
  return {
    id,
    type: MessageType.Complete,
  };
}

/**
 * Create a pong message
 */
export function createPongMessage(
  payload?: Record<string, unknown>
): PongMessage {
  return {
    type: MessageType.Pong,
    payload,
  };
}
