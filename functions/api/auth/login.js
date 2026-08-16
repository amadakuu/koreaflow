import { oauthStateCookie, redirect } from '../../_lib/auth.js';
export async function onRequestGet({ request }) {
  const state = crypto.randomUUID(); const url = new URL(request.url); const secure = url.protocol === 'https:'; const redirectUri = `${url.origin}/api/auth/callback`;
  const google = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  google.searchParams.set('client_id', url.searchParams.get('client_id') || '');
  // Cloudflare secret is read by the runtime below; this parameter is overwritten safely.
  google.searchParams.set('client_id', request.cf ? '' : '');
  return new Response(null, { status: 302, headers: { Location: (() => { const u = new URL('https://accounts.google.com/o/oauth2/v2/auth'); u.searchParams.set('client_id', request.env?.GOOGLE_CLIENT_ID || ''); u.searchParams.set('redirect_uri', redirectUri); u.searchParams.set('response_type','code'); u.searchParams.set('scope','openid email profile'); u.searchParams.set('state',state); u.searchParams.set('prompt','select_account'); return u.toString(); })(), 'Set-Cookie': oauthStateCookie(state, secure) } });
}
