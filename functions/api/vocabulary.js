import { getSession } from '../_lib/auth.js';
import { first, json, newId, parseJson, query, run } from '../_lib/db.js';

async function userFromRequest(request, env) {
  const session = await getSession(request, env.SESSION_SECRET);
  if (!session) return null;
  return first(env.DB, 'SELECT id FROM users WHERE id = ?', [session.id]);
}

function cleanItem(item) {
  if (!item) return item;
  return { ...item, tags_json: item.tags_json || '[]' };
}

export async function onRequestGet({ request, env }) {
  const user = await userFromRequest(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const min = url.searchParams.get('min');
  const max = url.searchParams.get('max');
  let sql = 'SELECT * FROM vocabulary WHERE user_id = ?';
  const params = [user.id];
  if (q) { sql += ' AND (kata_korea LIKE ? OR terjemahan_indo LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  if (min !== null && min !== '' && Number.isFinite(Number(min))) { sql += ' AND level_hafalan >= ?'; params.push(Math.max(0, Math.min(100, Number(min)))); }
  if (max !== null && max !== '' && Number.isFinite(Number(max))) { sql += ' AND level_hafalan <= ?'; params.push(Math.max(0, Math.min(100, Number(max)))); }
  sql += ' ORDER BY created_at DESC';
  const result = await query(env.DB, sql, params);
  return json({ data: result.results.map(cleanItem) });
}

export async function onRequestPost({ request, env }) {
  const user = await userFromRequest(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  const body = await parseJson(request);
  const kata = String(body.kata_korea || '').trim();
  const translation = String(body.terjemahan_indo || '').trim();
  if (!kata || !translation) return json({ error: 'Kata dan terjemahan wajib diisi.' }, 400);
  const existing = await first(env.DB, 'SELECT * FROM vocabulary WHERE user_id = ? AND kata_korea = ?', [user.id, kata]);
  if (existing) return json({ data: cleanItem(existing), existing: true });
  const id = newId('voc');
  await run(env.DB, `INSERT INTO vocabulary (id,user_id,kata_korea,terjemahan_indo,contoh_kalimat_korea,contoh_kalimat_indo,level_hafalan,jumlah_benar,jumlah_salah,romaja,part_of_speech,tags_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [id, user.id, kata, translation, body.contoh_kalimat_korea || null, body.contoh_kalimat_indo || null, 0, 0, 0, body.romaja || null, body.part_of_speech || null, JSON.stringify(Array.isArray(body.tags) ? body.tags : [])]);
  const item = await first(env.DB, 'SELECT * FROM vocabulary WHERE id = ?', [id]);
  return json({ data: cleanItem(item) }, 201);
}

export async function onRequestPut({ request, env }) {
  const user = await userFromRequest(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  const body = await parseJson(request);
  const id = String(body.id || '');
  const item = await first(env.DB, 'SELECT * FROM vocabulary WHERE id = ? AND user_id = ?', [id, user.id]);
  if (!item) return json({ error: 'Kosakata tidak ditemukan.' }, 404);

  if (body.mode === 'edit') {
    await run(env.DB, `UPDATE vocabulary SET kata_korea=?, terjemahan_indo=?, contoh_kalimat_korea=?, contoh_kalimat_indo=? WHERE id=? AND user_id=?`, [String(body.kata_korea || item.kata_korea).trim(), String(body.terjemahan_indo || item.terjemahan_indo).trim(), body.contoh_kalimat_korea ?? item.contoh_kalimat_korea, body.contoh_kalimat_indo ?? item.contoh_kalimat_indo, id, user.id]);
    return json({ data: await first(env.DB, 'SELECT * FROM vocabulary WHERE id = ?', [id]) });
  }

  const hasil = body.hasil === 'benar' ? 'benar' : body.hasil === 'salah' ? 'salah' : null;
  if (!hasil) return json({ error: 'hasil harus benar atau salah.' }, 400);
  const nextLevel = hasil === 'benar' ? Math.min(100, item.level_hafalan + 8) : Math.max(0, item.level_hafalan - 10);
  await run(env.DB, `UPDATE vocabulary SET level_hafalan = ?, jumlah_benar = jumlah_benar + ?, jumlah_salah = jumlah_salah + ? WHERE id = ? AND user_id = ?`, [nextLevel, hasil === 'benar' ? 1 : 0, hasil === 'salah' ? 1 : 0, id, user.id]);
  return json({ data: await first(env.DB, 'SELECT * FROM vocabulary WHERE id = ?', [id]) });
}

export async function onRequestDelete({ request, env }) {
  const user = await userFromRequest(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  if (!id) return json({ error: 'ID wajib diisi.' }, 400);
  const result = await run(env.DB, 'DELETE FROM vocabulary WHERE id = ? AND user_id = ?', [id, user.id]);
  if (!result.success) return json({ error: 'Gagal menghapus kosakata.' }, 500);
  return json({ ok: true });
}
