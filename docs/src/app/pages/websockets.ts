import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../components/code-block';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-websockets',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeBlockComponent],
  template: `
    <article class="px-6 py-12 lg:py-16 max-w-4xl mx-auto" itemscope itemtype="https://schema.org/TechArticle">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-zinc-500 mb-8" aria-label="Breadcrumb">
        <a routerLink="/" class="hover:text-white transition-colors">Home</a>
        <span>/</span>
        <span class="text-zinc-300">WebSocket Subscriptions</span>
      </nav>

      <!-- Header -->
      <header class="mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-4">
          📡 Real-time
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4" itemprop="headline">WebSocket Subscriptions</h1>
        <p class="text-xl text-zinc-400" itemprop="description">
          Implement real-time GraphQL subscriptions with &#64;leaven/ws using the graphql-ws protocol.
        </p>
      </header>

      <!-- Overview -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Overview</h2>
        <p class="text-zinc-400 mb-4">
          The <code class="text-green-400">&#64;leaven/ws</code> package provides WebSocket support for
          GraphQL subscriptions using the standard graphql-ws protocol.
        </p>
        <div class="card p-6">
          <ul class="space-y-2 text-zinc-300">
            <li><strong class="text-white">graphql-ws Protocol</strong> - Industry-standard subscription protocol</li>
            <li><strong class="text-white">Built-in PubSub</strong> - Simple event publishing system</li>
            <li><strong class="text-white">Connection Management</strong> - Automatic keep-alive and cleanup</li>
            <li><strong class="text-white">Authentication</strong> - Secure connection initialization</li>
          </ul>
        </div>
      </section>

      <!-- Installation -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Installation</h2>
        <app-code-block [code]="installCode" title="terminal" />
      </section>

      <!-- Quick Start -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Quick Start</h2>
        <p class="text-zinc-400 mb-4">Set up subscriptions with PubSub:</p>
        <app-code-block [code]="quickStartCode" title="subscriptions.ts" />
      </section>

      <!-- PubSub -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Using PubSub</h2>
        <p class="text-zinc-400 mb-4">The built-in PubSub for publishing events:</p>
        <app-code-block [code]="pubsubCode" title="pubsub.ts" />
      </section>

      <!-- Subscription Resolvers -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Subscription Resolvers</h2>
        <p class="text-zinc-400 mb-4">Create subscription resolvers with filters:</p>
        <app-code-block [code]="resolversCode" title="resolvers.ts" />
      </section>

      <!-- Authentication -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Authentication</h2>
        <p class="text-zinc-400 mb-4">Authenticate WebSocket connections:</p>
        <app-code-block [code]="authCode" title="auth.ts" />
      </section>

      <!-- Schema -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Subscription Schema</h2>
        <p class="text-zinc-400 mb-4">Define subscriptions in your schema:</p>
        <app-code-block [code]="schemaCode" title="schema.graphql" language="graphql" />
      </section>

      <!-- Client Usage -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">Client Usage</h2>
        <p class="text-zinc-400 mb-4">Connect from a client using graphql-ws:</p>
        <app-code-block [code]="clientCode" title="client.ts" />
      </section>

      <!-- API Reference -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-white mb-4">API Reference</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-zinc-800">
                <th class="py-3 pr-4 text-zinc-300 font-semibold">Export</th>
                <th class="py-3 text-zinc-300 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody class="text-zinc-400">
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-green-400">PubSub</code></td>
                <td class="py-3">Event publishing/subscription system</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-green-400">createPubSub</code></td>
                <td class="py-3">Create a PubSub instance</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-green-400">parseMessage</code></td>
                <td class="py-3">Parse graphql-ws protocol messages</td>
              </tr>
              <tr class="border-b border-zinc-800/50">
                <td class="py-3 pr-4"><code class="text-green-400">formatMessage</code></td>
                <td class="py-3">Format messages for sending</td>
              </tr>
              <tr>
                <td class="py-3 pr-4"><code class="text-green-400">createNextMessage</code></td>
                <td class="py-3">Create a subscription data message</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Navigation -->
      <nav class="flex items-center justify-between pt-8 border-t border-zinc-800">
        <a routerLink="/http" class="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
          </svg>
          <div class="text-right">
            <span class="text-xs text-zinc-500 block">Previous</span>
            <span class="font-medium">HTTP Server</span>
          </div>
        </a>
        <a routerLink="/nestjs" class="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-right">
          <div>
            <span class="text-xs text-zinc-500 block">Next</span>
            <span class="font-medium">NestJS Integration</span>
          </div>
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </a>
      </nav>
    </article>
  `,
})
export class WebsocketsComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updatePageSEO({
      title: 'WebSocket Subscriptions',
      description: 'Implement real-time GraphQL subscriptions with @leaven-graphql/ws using the graphql-ws protocol and built-in PubSub.',
      keywords: ['GraphQL subscriptions', 'WebSocket', 'real-time GraphQL', 'PubSub', 'Leaven'],
      canonical: '/websockets',
      ogType: 'article'
    });
  }

  installCode = `bun add @leaven-graphql/ws @leaven-graphql/core graphql`;

  quickStartCode = `import { createPubSub } from '@leaven-graphql/ws';
import { LeavenExecutor } from '@leaven-graphql/core';
import { schema } from './schema';

// Create PubSub instance
const pubsub = createPubSub();

// Create executor with schema
const executor = new LeavenExecutor({ schema });

// Set up WebSocket server
Bun.serve({
  port: 4000,
  fetch(request, server) {
    // Upgrade to WebSocket for subscription requests
    if (request.headers.get('upgrade') === 'websocket') {
      server.upgrade(request);
      return;
    }
    return new Response('Not Found', { status: 404 });
  },
  websocket: {
    message(ws, message) {
      // Handle graphql-ws protocol messages
      handleMessage(ws, message, executor, pubsub);
    },
    close(ws) {
      // Clean up subscriptions
      cleanupConnection(ws);
    },
  },
});`;

  pubsubCode = `import { PubSub, createPubSub } from '@leaven-graphql/ws';

// Create with default config
const pubsub = createPubSub();

// Or with custom config
const pubsub = createPubSub({
  maxSubscribers: 1000,
  wildcards: true,  // Enable topic wildcards
});

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

// Unsubscribe when done
unsubscribe();

// Create async iterator for subscriptions
const iterator = pubsub.asyncIterator('messages:new');

// Use in resolver
for await (const message of iterator) {
  yield message;
}`;

  resolversCode = `import { createPubSub } from '@leaven-graphql/ws';

const pubsub = createPubSub();

const resolvers = {
  Subscription: {
    // Simple subscription
    messageAdded: {
      subscribe: () => pubsub.asyncIterator('MESSAGE_ADDED'),
    },

    // Subscription with filter
    messageAddedToRoom: {
      subscribe: (_, { roomId }) => {
        // Only receive messages for this room
        return pubsub.asyncIterator(\`MESSAGE_ADDED:\${roomId}\`);
      },
    },

    // Subscription with resolver
    userStatusChanged: {
      subscribe: () => pubsub.asyncIterator('USER_STATUS'),
      resolve: (payload, _, context) => {
        // Transform the payload
        return {
          ...payload,
          timestamp: new Date().toISOString(),
        };
      },
    },
  },

  Mutation: {
    sendMessage: async (_, { roomId, content }, context) => {
      const message = await context.db.messages.create({
        roomId,
        content,
        authorId: context.user.id,
      });

      // Publish to subscribers
      pubsub.publish(\`MESSAGE_ADDED:\${roomId}\`, message);
      pubsub.publish('MESSAGE_ADDED', message);

      return message;
    },
  },
};`;

  authCode = `import { createPubSub, parseMessage } from '@leaven-graphql/ws';

const pubsub = createPubSub();
const connections = new Map();

Bun.serve({
  websocket: {
    async message(ws, data) {
      const message = parseMessage(data);

      switch (message.type) {
        case 'connection_init': {
          // Authenticate the connection
          const token = message.payload?.authToken;

          try {
            const user = await verifyToken(token);
            connections.set(ws, { user, subscriptions: new Map() });

            // Send connection acknowledgment
            ws.send(JSON.stringify({ type: 'connection_ack' }));
          } catch (error) {
            // Reject connection
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

          // Handle subscription with authenticated user
          handleSubscribe(ws, message, connection.user);
          break;
        }

        case 'complete': {
          // Client wants to stop subscription
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
        // Clean up all subscriptions
        for (const sub of connection.subscriptions.values()) {
          sub.unsubscribe();
        }
        connections.delete(ws);
      }
    },
  },
});`;

  schemaCode = `type Subscription {
  # Simple subscription
  messageAdded: Message!

  # Subscription with argument
  messageAddedToRoom(roomId: ID!): Message!

  # User status updates
  userStatusChanged(userId: ID): UserStatus!

  # Real-time notifications
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
}`;

  clientCode = `import { createClient } from 'graphql-ws';

// Create WebSocket client
const client = createClient({
  url: 'ws://localhost:4000/graphql',
  connectionParams: {
    authToken: 'your-jwt-token',
  },
});

// Subscribe to messages
const unsubscribe = client.subscribe(
  {
    query: \`
      subscription OnMessageAdded($roomId: ID!) {
        messageAddedToRoom(roomId: $roomId) {
          id
          content
          author {
            name
          }
        }
      }
    \`,
    variables: { roomId: 'room-123' },
  },
  {
    next: (data) => {
      console.log('New message:', data);
    },
    error: (error) => {
      console.error('Subscription error:', error);
    },
    complete: () => {
      console.log('Subscription completed');
    },
  }
);

// Later: unsubscribe
unsubscribe();`;
}
