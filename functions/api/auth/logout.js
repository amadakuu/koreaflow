import { clearSessionCookies, redirect } from '../../_lib/auth.js';

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  return redirect(`${url.origin}/`, {
    'Set-Cookie': clearSessionCookies().join(', '),
    'Cache-Control': 'no-store',
  });
}
