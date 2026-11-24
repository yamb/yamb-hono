import { html, raw } from 'hono/html';

function page(title, content) {
  return html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
      </head>
      <body>
        <main>${content}</main>
      </body>
    </html>`;
}

function item(post) {
  const title =
    post.status === 'published'
      ? html`<a href="${post.url().pathname}">${post.title}</a>`
      : post.title;

  return html`<li>
    ${title} (${post.status}) <a href="/posts/${encodeURIComponent(post.id)}">Edit</a>
  </li>`;
}

export function index(posts) {
  return page(
    'Posts',
    html`<h1>Posts</h1>
      <p><a href="/posts/new">New post</a></p>
      <ul>
        ${posts.map(item)}
      </ul>`
  );
}

export function article(title, body) {
  return page(
    title,
    html`<article>
        <h1>${title}</h1>
        ${raw(body)}
      </article>
      <a href="/">All posts</a>`
  );
}

export function form({ id, title = '', text = '', status = 'draft' }, error) {
  const heading = id ? 'Edit post' : 'New post';
  const action = id ? `/posts/${encodeURIComponent(id)}` : '/posts';
  const option = (value) => html`<option ${value === status ? 'selected' : ''}>${value}</option>`;

  return page(
    heading,
    html`<h1>${heading}</h1>
      ${error ? html`<p role="alert">${error}</p>` : ''}
      <form method="post" action="${action}">
        <p>
          <label>Title <input name="title" value="${title}" required /></label>
        </p>
        <p>
          <label>Text <textarea name="text" rows="12">${text}</textarea></label>
        </p>
        <p>
          <label>
            Status
            <select name="status">
              ${option('draft')}${option('published')}
            </select>
          </label>
        </p>
        <p><button>Save</button></p>
      </form>
      ${id ? html`<form method="post" action="${action}/delete"><button>Delete</button></form>` : ''}
      <a href="/">All posts</a>`
  );
}
