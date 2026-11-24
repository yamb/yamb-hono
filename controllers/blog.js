import { PostStatusError, PostValidationError, UriTakenError } from 'yamb/errors';
import { IdSchema, UriSchema } from 'yamb/schemas';

import * as views from '../views/blog.js';

const invalid = [PostStatusError, PostValidationError, UriTakenError];

async function save(c, post) {
  const { title, text, status } = await c.req.parseBody();

  try {
    Object.assign(post, { title, text, status });
    await post.save();

    return c.redirect('/', 303);
  } catch (error) {
    if (!invalid.some((type) => error instanceof type)) {
      throw error;
    }

    const values = { id: post.id, title, text, status };

    return c.html(views.form(values, error.message), 422);
  }
}

export function controller(blog) {
  const find = (id) => (IdSchema.safeParse(id).success ? blog.find(id) : null);

  return {
    async index(c) {
      const posts = await blog.all().toArray();

      return c.html(views.index(posts));
    },

    async article(c) {
      const { year, month, slug } = c.req.param();
      const uri = `${year}/${month}/${slug}`;
      const post = UriSchema.safeParse(uri).success ? await blog.fetch(uri) : null;

      if (post?.status !== 'published') {
        return c.notFound();
      }

      const { body } = await post.render('html');

      return c.html(views.article(post.title, body));
    },

    add(c) {
      return c.html(views.form({}));
    },

    create(c) {
      return save(c, blog.build());
    },

    async edit(c) {
      const post = await find(c.req.param('id'));

      return post ? c.html(views.form(post)) : c.notFound();
    },

    async update(c) {
      const post = await find(c.req.param('id'));

      return post ? save(c, post) : c.notFound();
    },

    async remove(c) {
      const post = await find(c.req.param('id'));

      if (!post) {
        return c.notFound();
      }

      await post.remove();

      return c.redirect('/', 303);
    }
  };
}
