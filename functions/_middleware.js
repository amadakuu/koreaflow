import { getSession } from './_lib/auth.js';

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/auth/')) return next();
  if (url.pathname.startsWith('/assets/') || url.pathname === '/favicon.ico') return next();

  const session = await getSession(request, env.SESSION_SECRET);
  const acceptsHtml = (request.headers.get('Accept') || '').includes('text/html');

  if (!session && acceptsHtml && url.pathname !== '/login') {
    return Response.redirect(`${url.origin}/login`, 302);
  }

  if (!session && url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  return next();
}
