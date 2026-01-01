/**
 * @leaven-graphql/ws - GraphQL over WebSocket protocol
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
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

/**
 * Parse a WebSocket message
 */
export function parseMessage(data: string | Buffer): Message {
  const text = typeof data === 'string' ? data : data.toString('utf-8');

  try {
    const message = JSON.parse(text);

    if (!message.type) {
      throw new Error('Message must have a type');
    }

    if (!Object.values(MessageType).includes(message.type)) {
      throw new Error(`Invalid message type: ${message.type}`);
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
  errors?: readonly { message: string; [key: string]: unknown }[]
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
 */
export function createErrorMessage(
  id: string,
  errors: readonly { message: string; [key: string]: unknown }[]
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
