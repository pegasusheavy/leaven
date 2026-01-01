# @leaven-graphql/ws

WebSocket support for GraphQL subscriptions using the graphql-ws protocol.

## Installation

```bash
bun add @leaven-graphql/ws @leaven-graphql/core graphql
```

## Quick Start

```typescript
import { createPubSub } from '@leaven-graphql/ws';
import { LeavenExecutor } from '@leaven-graphql/core';

const pubsub = createPubSub();
const executor = new LeavenExecutor({ schema });

Bun.serve({
  port: 4000,
  fetch(request, server) {
    if (request.headers.get('upgrade') === 'websocket') {
      server.upgrade(request);
      return;
    }
    return new Response('Not Found', { status: 404 });
  },
  websocket: {
    message(ws, message) {
      handleMessage(ws, message, executor, pubsub);
    },
    close(ws) {
      cleanupConnection(ws);
    },
  },
});
```

## Features

### PubSub

Built-in event publishing system:

```typescript
import { PubSub, createPubSub } from '@leaven-graphql/ws';

const pubsub = createPubSub();

// Subscribe to a topic
const unsubscribe = pubsub.subscribe('user:created', (payload) => {
  console.log('New user:', payload);
});

// Publish an event
pubsub.publish('user:created', {
  id: '123',
  name: 'Alice',
  email: 'alice@example.com',
});

// Unsubscribe
unsubscribe();

// Create async iterator for subscriptions
const iterator = pubsub.asyncIterator('messages:new');
```

### Subscription Resolvers

```typescript
import { createPubSub } from '@leaven-graphql/ws';

const pubsub = createPubSub();

const resolvers = {
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator('MESSAGE_ADDED'),
    },

    messageAddedToRoom: {
      subscribe: (_, { roomId }) => {
        return pubsub.asyncIterator(`MESSAGE_ADDED:${roomId}`);
      },
    },

    userStatusChanged: {
      subscribe: () => pubsub.asyncIterator('USER_STATUS'),
      resolve: (payload, _, context) => ({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    },
  },

  Mutation: {
    sendMessage: async (_, { roomId, content }, context) => {
      const message = await context.db.messages.create({
        roomId,
        content,
        authorId: context.user.id,
      });

      pubsub.publish(`MESSAGE_ADDED:${roomId}`, message);
      pubsub.publish('MESSAGE_ADDED', message);

      return message;
    },
  },
};
```

### Authentication

```typescript
import { parseMessage } from '@leaven-graphql/ws';

const connections = new Map();

Bun.serve({
  websocket: {
    async message(ws, data) {
      const message = parseMessage(data);

      switch (message.type) {
        case 'connection_init': {
          const token = message.payload?.authToken;

          try {
            const user = await verifyToken(token);
            connections.set(ws, { user, subscriptions: new Map() });
            ws.send(JSON.stringify({ type: 'connection_ack' }));
          } catch (error) {
            ws.close(4401, 'Unauthorized');
          }
          break;
        }

        case 'subscribe': {
          const connection = connections.get(ws);
          if (!connection) {
            ws.close(4401, 'Unauthorized');
            return;
          }
          handleSubscribe(ws, message, connection.user);
          break;
        }

        case 'complete': {
          const connection = connections.get(ws);
          connection?.subscriptions.get(message.id)?.unsubscribe();
          connection?.subscriptions.delete(message.id);
          break;
        }
      }
    },

    close(ws) {
      const connection = connections.get(ws);
      if (connection) {
        for (const sub of connection.subscriptions.values()) {
          sub.unsubscribe();
        }
        connections.delete(ws);
      }
    },
  },
});
```

### Schema Definition

```graphql
type Subscription {
  messageAdded: Message!
  messageAddedToRoom(roomId: ID!): Message!
  userStatusChanged(userId: ID): UserStatus!
  notificationReceived: Notification!
}

type Message {
  id: ID!
  content: String!
  author: User!
  room: Room!
  createdAt: DateTime!
}

type UserStatus {
  user: User!
  status: Status!
  lastSeen: DateTime
}

enum Status {
  ONLINE
  AWAY
  OFFLINE
}
```

### Client Usage

```typescript
import { createClient } from 'graphql-ws';

const client = createClient({
  url: 'ws://localhost:4000/graphql',
  connectionParams: {
    authToken: 'your-jwt-token',
  },
});

const unsubscribe = client.subscribe(
  {
    query: `
      subscription OnMessageAdded($roomId: ID!) {
        messageAddedToRoom(roomId: $roomId) {
          id
          content
          author { name }
        }
      }
    `,
    variables: { roomId: 'room-123' },
  },
  {
    next: (data) => console.log('New message:', data),
    error: (error) => console.error('Error:', error),
    complete: () => console.log('Completed'),
  }
);

// Later: unsubscribe
unsubscribe();
```

## API Reference

### PubSub

```typescript
class PubSub {
  subscribe(topic: string, callback: (payload: unknown) => void): () => void;
  publish(topic: string, payload: unknown): void;
  asyncIterator(topic: string | string[]): AsyncIterableIterator<unknown>;
}

function createPubSub(config?: PubSubConfig): PubSub;

interface PubSubConfig {
  maxSubscribers?: number;
  wildcards?: boolean;
}
```

### Message Handling

```typescript
function parseMessage(data: string | Buffer): GraphQLWSMessage;
function formatMessage(type: string, payload?: unknown): string;
function createNextMessage(id: string, payload: unknown): string;
function createErrorMessage(id: string, errors: GraphQLError[]): string;
function createCompleteMessage(id: string): string;
```

### Message Types

```typescript
interface GraphQLWSMessage {
  type: 'connection_init' | 'connection_ack' | 'ping' | 'pong'
      | 'subscribe' | 'next' | 'error' | 'complete';
  id?: string;
  payload?: unknown;
}
```

## License

Apache 2.0 - Pegasus Heavy Industries LLC
