import { oauthStateCookie } from '../../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  const state = crypto.randomUUID();
  const url = new URL(request.url);
  const secure = url.protocol === 'https:';
  const google = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  google.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  google.searchParams.set('redirect_uri', `${url.origin}/api/auth/callback`);
  google.searchParams.set('response_type', 'code');
  google.searchParams.set('scope', 'openid email profile');
  google.searchParams.set('state', state);
  google.searchParams.set('prompt', 'select_account');
  return new Response(null, { status: 302, headers: { Location: google.toString(), 'Set-Cookie': oauthStateCookie(state, secure) } });
}
