/**
 * @leaven-graphql/ws - Protocol tests
 *
 * Copyright 2026 Pegasus Heavy Industries LLC
 * Licensed under the Apache License, Version 2.0
 */

import { describe, test, expect } from 'bun:test';
import {
  MessageType,
  parseMessage,
  formatMessage,
  createConnectionAck,
  createNextMessage,
  createErrorMessage,
  createCompleteMessage,
  createPongMessage,
} from './protocol';

describe('MessageType', () => {
  test('should have all message types', () => {
    expect(MessageType.ConnectionInit).toBe('connection_init');
    expect(MessageType.ConnectionAck).toBe('connection_ack');
    expect(MessageType.Ping).toBe('ping');
    expect(MessageType.Pong).toBe('pong');
    expect(MessageType.Subscribe).toBe('subscribe');
    expect(MessageType.Next).toBe('next');
    expect(MessageType.Error).toBe('error');
    expect(MessageType.Complete).toBe('complete');
  });
});

describe('parseMessage', () => {
  test('should parse connection_init message', () => {
    const message = parseMessage('{"type":"connection_init"}');
    expect(message.type).toBe(MessageType.ConnectionInit);
  });

  test('should parse connection_init with payload', () => {
    const message = parseMessage(
      '{"type":"connection_init","payload":{"token":"abc"}}'
    );
    expect(message.type).toBe(MessageType.ConnectionInit);
    expect((message as { payload?: { token: string } }).payload?.token).toBe('abc');
  });

  test('should parse subscribe message', () => {
    const message = parseMessage(
      '{"id":"1","type":"subscribe","payload":{"query":"{ hello }"}}'
    );
    expect(message.type).toBe(MessageType.Subscribe);
    expect((message as { id: string }).id).toBe('1');
  });

  test('should parse complete message', () => {
    const message = parseMessage('{"id":"1","type":"complete"}');
    expect(message.type).toBe(MessageType.Complete);
    expect((message as { id: string }).id).toBe('1');
  });

  test('should parse ping message', () => {
    const message = parseMessage('{"type":"ping"}');
    expect(message.type).toBe(MessageType.Ping);
  });

  test('should parse pong message', () => {
    const message = parseMessage('{"type":"pong"}');
    expect(message.type).toBe(MessageType.Pong);
  });

  test('should parse from Buffer', () => {
    const buffer = Buffer.from('{"type":"ping"}');
    const message = parseMessage(buffer);
    expect(message.type).toBe(MessageType.Ping);
  });

  test('should throw for invalid JSON', () => {
    expect(() => parseMessage('not json')).toThrow(/Invalid JSON/);
  });

  test('should throw for missing type', () => {
    expect(() => parseMessage('{}')).toThrow(/must have a type/);
  });

  test('should throw for invalid type', () => {
    expect(() => parseMessage('{"type":"invalid"}')).toThrow(/Invalid message type/);
  });
});

describe('formatMessage', () => {
  test('should format connection_ack message', () => {
    const message = { type: MessageType.ConnectionAck } as const;
    const formatted = formatMessage(message);
    expect(JSON.parse(formatted)).toEqual({ type: 'connection_ack' });
  });

  test('should format next message', () => {
    const message = {
      id: '1',
      type: MessageType.Next as const,
      payload: { data: { hello: 'world' } },
    };
    const formatted = formatMessage(message);
    const parsed = JSON.parse(formatted);

    expect(parsed.id).toBe('1');
    expect(parsed.type).toBe('next');
    expect(parsed.payload.data.hello).toBe('world');
  });

  test('should format error message', () => {
    const message = {
      id: '1',
      type: MessageType.Error as const,
      payload: [{ message: 'Error occurred' }],
    };
    const formatted = formatMessage(message);
    const parsed = JSON.parse(formatted);

    expect(parsed.type).toBe('error');
    expect(parsed.payload[0].message).toBe('Error occurred');
  });
});

describe('createConnectionAck', () => {
  test('should create connection_ack message', () => {
    const message = createConnectionAck();
    expect(message.type).toBe(MessageType.ConnectionAck);
    expect(message.payload).toBeUndefined();
  });

  test('should include payload', () => {
    const message = createConnectionAck({ sessionId: 'abc' });
    expect(message.payload?.sessionId).toBe('abc');
  });
});

describe('createNextMessage', () => {
  test('should create next message with data', () => {
    const message = createNextMessage('1', { hello: 'world' });

    expect(message.type).toBe(MessageType.Next);
    expect(message.id).toBe('1');
    expect(message.payload.data).toEqual({ hello: 'world' });
  });

  test('should include errors', () => {
    const message = createNextMessage('1', null, [{ message: 'Error' }]);

    expect(message.payload.data).toBeNull();
    expect(message.payload.errors?.[0]?.message).toBe('Error');
  });
});

describe('createErrorMessage', () => {
  test('should create error message', () => {
    const message = createErrorMessage('1', [{ message: 'Something went wrong' }]);

    expect(message.type).toBe(MessageType.Error);
    expect(message.id).toBe('1');
    expect(message.payload[0]?.message).toBe('Something went wrong');
  });

  test('should include multiple errors', () => {
    const message = createErrorMessage('1', [
      { message: 'Error 1' },
      { message: 'Error 2' },
    ]);

    expect(message.payload.length).toBe(2);
  });
});

describe('createCompleteMessage', () => {
  test('should create complete message', () => {
    const message = createCompleteMessage('1');

    expect(message.type).toBe(MessageType.Complete);
    expect(message.id).toBe('1');
  });
});

describe('createPongMessage', () => {
  test('should create pong message', () => {
    const message = createPongMessage();

    expect(message.type).toBe(MessageType.Pong);
    expect(message.payload).toBeUndefined();
  });

  test('should include payload', () => {
    const message = createPongMessage({ timestamp: 123 });

    expect(message.payload?.timestamp).toBe(123);
  });
});
