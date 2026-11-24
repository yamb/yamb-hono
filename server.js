import { once } from 'node:events';

import { serve } from '@hono/node-server';

import { open } from './models/blog.js';
import { routes } from './routes/blog.js';

const hostname = '127.0.0.1';
const port = Number(process.env.PORT ?? 3001);
const base = new URL(`http://${hostname}:${port}`);

const stopping = Promise.withResolvers();
process.on('SIGINT', stopping.resolve);
process.on('SIGTERM', stopping.resolve);

await using resources = new AsyncDisposableStack();

const blog = await open(resources, {
  base,
  path: process.env.YAMB_POSTS_DIR
});

const app = routes(blog, base);

const server = serve({ fetch: app.fetch, hostname, port });
await once(server, 'listening');

await using listener = server;
base.port = String(listener.address().port);

console.log(base.origin);
await stopping.promise;
