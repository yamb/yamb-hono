import { Hono } from 'hono';
import { csrf } from 'hono/csrf';

import { controller } from '../controllers/blog.js';

function trusted(base) {
  return (c, next) => {
    const host = c.req.header('host') === base.host;

    return host ? next() : c.text('Forbidden', 403);
  };
}

export function routes(blog, base) {
  const posts = controller(blog);

  return new Hono()
    .use(trusted(base), csrf())
    .get('/', posts.index)
    .get('/posts/new', posts.add)
    .post('/posts', posts.create)
    .get('/posts/:id', posts.edit)
    .post('/posts/:id', posts.update)
    .post('/posts/:id/delete', posts.remove)
    .get('/:year/:month/:slug', posts.article);
}
