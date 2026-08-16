import { getSession, clearSessionCookies, redirect } from '../../_lib/auth.js';
import { first, run } from '../../_lib/db.js';

export async function onRequestPost({ request, env }) {
  const session = await getSession(request, env.SESSION_SECRET);
  if (!session) return new Response('Unauthorized', { status: 401 });
  const user = await first(env.DB, 'SELECT id FROM users WHERE id = ?', [session.id]);
  if (!user) return new Response('Not found', { status: 404 });
  await run(env.DB, 'DELETE FROM users WHERE id = ?', [user.id]);
  const url = new URL(request.url);
  const headers = new Headers({ Location: `${url.origin}/login`, 'Cache-Control': 'no-store' });
  for (const c of clearSessionCookies()) headers.append('Set-Cookie', c);
  return new Response(null, { status: 302, headers });
}
