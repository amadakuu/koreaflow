import { getSession } from '../_lib/auth.js';
import { first, json, newId, parseJson, query, run } from '../_lib/db.js';

async function userFromRequest(request, env) {
  const session = await getSession(request, env.SESSION_SECRET);
  if (!session) return null;
  return first(env.DB, 'SELECT id FROM users WHERE id = ?', [session.id]);
}

export async function onRequestGet({ request, env }) {
  const user = await userFromRequest(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const level = url.searchParams.get('level');
  let sql = 'SELECT * FROM vocabulary WHERE user_id = ?';
  const params = [user.id];
  if (q) { sql += ' AND (kata_korea LIKE ? OR terjemahan_indo LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  if (level !== null && level !== '' && Number.isFinite(Number(level))) { sql += ' AND level_hafalan BETWEEN ? AND ?'; const n = Math.max(0, Math.min(100, Number(level))); params.push(n, n); }
  sql += ' ORDER BY created_at DESC';
  const result = await query(env.DB, sql, params);
  return json({ data: result.results });
}

export async function onRequestPost({ request, env }) {
  const user = await userFromRequest(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  const body = await parseJson(request);
  const kata = String(body.kata_korea || '').trim();
  const translation = String(body.terjemahan_indo || '').trim();
  if (!kata || !translation) return json({ error: 'Kata dan terjemahan wajib diisi.' }, 400);
  const id = newId('voc');
  await run(env.DB, `INSERT INTO vocabulary (id,user_id,kata_korea,terjemahan_indo,contoh_kalimat_korea,contoh_kalimat_indo,level_hafalan,jumlah_benar,jumlah_salah) VALUES (?,?,?,?,?, ?,0,0,0)`, [id, user.id, kata, translation, body.contoh_kalimat_korea || null, body.contoh_kalimat_indo || null]);
  const item = await first(env.DB, 'SELECT * FROM vocabulary WHERE id = ?', [id]);
  return json({ data: item }, 201);
}

export async function onRequestPut({ request, env }) {
  const user = await userFromRequest(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  const body = await parseJson(request);
  const id = String(body.id || '');
  const item = await first(env.DB, 'SELECT * FROM vocabulary WHERE id = ? AND user_id = ?', [id, user.id]);
  if (!item) return json({ error: 'Kosakata tidak ditemukan.' }, 404);
  const level = Math.max(0, Math.min(100, Number(body.level_hafalan ?? item.level_hafalan)));
  const delta = body.hasil === 'benar' ? { benar: item.jumlah_benar + 1, salah: item.jumlah_salah } : body.hasil === 'salah' ? { benar: item.jumlah_benar, salah: item.jumlah_salah + 1 } : { benar: item.jumlah_benar, salah: item.jumlah_salah };
  await run(env.DB, 'UPDATE vocabulary SET level_hafalan = ?, jumlah_benar = ?, jumlah_salah = ? WHERE id = ? AND user_id = ?', [level, delta.benar, delta.salah, id, user.id]);
  return json({ data: await first(env.DB, 'SELECT * FROM vocabulary WHERE id = ?', [id]) });
}
