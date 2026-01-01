import{a as g}from"./chunk-SQ3LWRKC.js";import{a as h}from"./chunk-VABBLMJJ.js";import{C as o,D as n,E as e,F as i,S as t,Z as b,ga as S,j as c,k as u,r as s,s as d,t as p}from"./chunk-SPTROXX7.js";var x=class l{constructor(m){this.seoService=m}ngOnInit(){this.seoService.updatePageSEO({title:"WebSocket Subscriptions",description:"Implement real-time GraphQL subscriptions with @leaven-graphql/ws using the graphql-ws protocol and built-in PubSub.",keywords:["GraphQL subscriptions","WebSocket","real-time GraphQL","PubSub","Leaven"],canonical:"/websockets",ogType:"article"})}installCode="bun add @leaven-graphql/ws @leaven-graphql/core graphql";quickStartCode=`import { createPubSub } from '@leaven-graphql/ws';
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
});`;pubsubCode=`import { PubSub, createPubSub } from '@leaven-graphql/ws';

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
}`;resolversCode=`import { createPubSub } from '@leaven-graphql/ws';

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
};`;authCode=`import { createPubSub, parseMessage } from '@leaven-graphql/ws';

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
});`;schemaCode=`type Subscription {
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
}`;clientCode=`import { createClient } from 'graphql-ws';

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
unsubscribe();`;static \u0275fac=function(a){return new(a||l)(d(g))};static \u0275cmp=p({type:l,selectors:[["app-websockets"]],decls:140,vars:7,consts:[["itemscope","","itemtype","https://schema.org/TechArticle",1,"px-6","py-12","lg:py-16","max-w-4xl","mx-auto"],["aria-label","Breadcrumb",1,"flex","items-center","gap-2","text-sm","text-zinc-500","mb-8"],["routerLink","/",1,"hover:text-white","transition-colors"],[1,"text-zinc-300"],[1,"mb-12"],[1,"inline-flex","items-center","gap-2","px-3","py-1","rounded-full","bg-green-500/10","border","border-green-500/20","text-green-400","text-xs","font-medium","mb-4"],["itemprop","headline",1,"text-4xl","md:text-5xl","font-bold","text-white","mb-4"],["itemprop","description",1,"text-xl","text-zinc-400"],[1,"text-2xl","font-semibold","text-white","mb-4"],[1,"text-zinc-400","mb-4"],[1,"text-green-400"],[1,"card","p-6"],[1,"space-y-2","text-zinc-300"],[1,"text-white"],["title","terminal",3,"code"],["title","subscriptions.ts",3,"code"],["title","pubsub.ts",3,"code"],["title","resolvers.ts",3,"code"],["title","auth.ts",3,"code"],["title","schema.graphql","language","graphql",3,"code"],["title","client.ts",3,"code"],[1,"overflow-x-auto"],[1,"w-full","text-left"],[1,"border-b","border-zinc-800"],[1,"py-3","pr-4","text-zinc-300","font-semibold"],[1,"py-3","text-zinc-300","font-semibold"],[1,"text-zinc-400"],[1,"border-b","border-zinc-800/50"],[1,"py-3","pr-4"],[1,"py-3"],[1,"flex","items-center","justify-between","pt-8","border-t","border-zinc-800"],["routerLink","/http",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:-translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M11 17l-5-5m0 0l5-5m-5 5h12"],[1,"text-right"],[1,"text-xs","text-zinc-500","block"],[1,"font-medium"],["routerLink","/nestjs",1,"group","flex","items-center","gap-2","text-zinc-400","hover:text-white","transition-colors","text-right"],["fill","none","stroke","currentColor","viewBox","0 0 24 24",1,"w-5","h-5","group-hover:translate-x-1","transition-transform"],["stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","M13 7l5 5m0 0l-5 5m5-5H6"]],template:function(a,r){a&1&&(n(0,"article",0)(1,"nav",1)(2,"a",2),t(3,"Home"),e(),n(4,"span"),t(5,"/"),e(),n(6,"span",3),t(7,"WebSocket Subscriptions"),e()(),n(8,"header",4)(9,"div",5),t(10," \u{1F4E1} Real-time "),e(),n(11,"h1",6),t(12,"WebSocket Subscriptions"),e(),n(13,"p",7),t(14," Implement real-time GraphQL subscriptions with @leaven/ws using the graphql-ws protocol. "),e()(),n(15,"section",4)(16,"h2",8),t(17,"Overview"),e(),n(18,"p",9),t(19," The "),n(20,"code",10),t(21,"@leaven/ws"),e(),t(22," package provides WebSocket support for GraphQL subscriptions using the standard graphql-ws protocol. "),e(),n(23,"div",11)(24,"ul",12)(25,"li")(26,"strong",13),t(27,"graphql-ws Protocol"),e(),t(28," - Industry-standard subscription protocol"),e(),n(29,"li")(30,"strong",13),t(31,"Built-in PubSub"),e(),t(32," - Simple event publishing system"),e(),n(33,"li")(34,"strong",13),t(35,"Connection Management"),e(),t(36," - Automatic keep-alive and cleanup"),e(),n(37,"li")(38,"strong",13),t(39,"Authentication"),e(),t(40," - Secure connection initialization"),e()()()(),n(41,"section",4)(42,"h2",8),t(43,"Installation"),e(),i(44,"app-code-block",14),e(),n(45,"section",4)(46,"h2",8),t(47,"Quick Start"),e(),n(48,"p",9),t(49,"Set up subscriptions with PubSub:"),e(),i(50,"app-code-block",15),e(),n(51,"section",4)(52,"h2",8),t(53,"Using PubSub"),e(),n(54,"p",9),t(55,"The built-in PubSub for publishing events:"),e(),i(56,"app-code-block",16),e(),n(57,"section",4)(58,"h2",8),t(59,"Subscription Resolvers"),e(),n(60,"p",9),t(61,"Create subscription resolvers with filters:"),e(),i(62,"app-code-block",17),e(),n(63,"section",4)(64,"h2",8),t(65,"Authentication"),e(),n(66,"p",9),t(67,"Authenticate WebSocket connections:"),e(),i(68,"app-code-block",18),e(),n(69,"section",4)(70,"h2",8),t(71,"Subscription Schema"),e(),n(72,"p",9),t(73,"Define subscriptions in your schema:"),e(),i(74,"app-code-block",19),e(),n(75,"section",4)(76,"h2",8),t(77,"Client Usage"),e(),n(78,"p",9),t(79,"Connect from a client using graphql-ws:"),e(),i(80,"app-code-block",20),e(),n(81,"section",4)(82,"h2",8),t(83,"API Reference"),e(),n(84,"div",21)(85,"table",22)(86,"thead")(87,"tr",23)(88,"th",24),t(89,"Export"),e(),n(90,"th",25),t(91,"Description"),e()()(),n(92,"tbody",26)(93,"tr",27)(94,"td",28)(95,"code",10),t(96,"PubSub"),e()(),n(97,"td",29),t(98,"Event publishing/subscription system"),e()(),n(99,"tr",27)(100,"td",28)(101,"code",10),t(102,"createPubSub"),e()(),n(103,"td",29),t(104,"Create a PubSub instance"),e()(),n(105,"tr",27)(106,"td",28)(107,"code",10),t(108,"parseMessage"),e()(),n(109,"td",29),t(110,"Parse graphql-ws protocol messages"),e()(),n(111,"tr",27)(112,"td",28)(113,"code",10),t(114,"formatMessage"),e()(),n(115,"td",29),t(116,"Format messages for sending"),e()(),n(117,"tr")(118,"td",28)(119,"code",10),t(120,"createNextMessage"),e()(),n(121,"td",29),t(122,"Create a subscription data message"),e()()()()()(),n(123,"nav",30)(124,"a",31),c(),n(125,"svg",32),i(126,"path",33),e(),u(),n(127,"div",34)(128,"span",35),t(129,"Previous"),e(),n(130,"span",36),t(131,"HTTP Server"),e()()(),n(132,"a",37)(133,"div")(134,"span",35),t(135,"Next"),e(),n(136,"span",36),t(137,"NestJS Integration"),e()(),c(),n(138,"svg",38),i(139,"path",39),e()()()()),a&2&&(s(44),o("code",r.installCode),s(6),o("code",r.quickStartCode),s(6),o("code",r.pubsubCode),s(6),o("code",r.resolversCode),s(6),o("code",r.authCode),s(6),o("code",r.schemaCode),s(6),o("code",r.clientCode))},dependencies:[b,S,h],encapsulation:2})};export{x as WebsocketsComponent};
