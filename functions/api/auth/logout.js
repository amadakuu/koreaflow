import { clearSessionCookies } from '../../_lib/auth.js';

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const headers = new Headers({ Location: `${url.origin}/login`, 'Cache-Control': 'no-store' });
  for (const c of clearSessionCookies()) headers.append('Set-Cookie', c);
  return new Response(null, { status: 302, headers });
}
