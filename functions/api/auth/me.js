import { getSession } from '../../_lib/auth.js';
import { first, json } from '../../_lib/db.js';

export async function onRequestGet({ request, env }) {
  const session = await getSession(request, env.SESSION_SECRET);
  if (!session) return json({ authenticated: false }, 401);
  const user = await first(env.DB, 'SELECT id, google_id, email, nama, foto, created_at FROM users WHERE id = ?', [session.id]);
  if (!user) return json({ authenticated: false }, 401);
  return json({ authenticated: true, user });
}
