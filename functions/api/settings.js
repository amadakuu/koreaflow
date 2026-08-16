import { getSession } from '../_lib/auth.js';
import { first, json, parseJson, run } from '../_lib/db.js';

async function sessionUser(request, env) {
  const session = await getSession(request, env.SESSION_SECRET);
  return session ? first(env.DB, 'SELECT id FROM users WHERE id = ?', [session.id]) : null;
}

export async function onRequestGet({ request, env }) {
  const u = await sessionUser(request, env);
  if (!u) return json({ error: 'Unauthorized' }, 401);
  await run(env.DB, 'INSERT OR IGNORE INTO settings (user_id) VALUES (?)', [u.id]);
  return json({ data: await first(env.DB, 'SELECT * FROM settings WHERE user_id = ?', [u.id]) });
}

export async function onRequestPut({ request, env }) {
  const u = await sessionUser(request, env);
  if (!u) return json({ error: 'Unauthorized' }, 401);
  const b = await parseJson(request);
  await run(env.DB, `INSERT INTO settings (user_id,tema_warna,ukuran_font,target_harian,model_ai,bahasa_penjelasan,speech_speed,show_romaja,auto_play_audio) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET tema_warna=excluded.tema_warna,ukuran_font=excluded.ukuran_font,target_harian=excluded.target_harian,model_ai=excluded.model_ai,bahasa_penjelasan=excluded.bahasa_penjelasan,speech_speed=excluded.speech_speed,show_romaja=excluded.show_romaja,auto_play_audio=excluded.auto_play_audio`, [u.id, b.tema_warna || 'purple', b.ukuran_font || 'medium', Math.max(1, Number(b.target_harian || 10)), b.model_ai || 'gemini-2.5-flash', b.bahasa_penjelasan || 'id', Number(b.speech_speed || 1), b.show_romaja ? 1 : 0, b.auto_play_audio ? 1 : 0]);
  return json({ data: await first(env.DB, 'SELECT * FROM settings WHERE user_id = ?', [u.id]) });
}
