import { getSession } from '../_lib/auth.js';
import { first, json, newId, parseJson, query, run } from '../_lib/db.js';
import { generateJson } from '../_lib/gemini.js';

async function user(request, env) {
  const session = await getSession(request, env.SESSION_SECRET);
  return session ? first(env.DB, 'SELECT id FROM users WHERE id = ?', [session.id]) : null;
}

export async function onRequestGet({ request, env }) {
  const u = await user(request, env);
  if (!u) return json({ error: 'Unauthorized' }, 401);
  const result = await query(env.DB, 'SELECT * FROM stories WHERE user_id = ? ORDER BY tanggal DESC LIMIT 100', [u.id]);
  return json({ data: result.results });
}

export async function onRequestPost({ request, env }) {
  const u = await user(request, env);
  if (!u) return json({ error: 'Unauthorized' }, 401);
  const body = await parseJson(request);
  const tema = String(body.tema || 'Kehidupan sehari-hari');
  const tingkat = String(body.tingkat || 'Dasar');
  const vocab = await query(env.DB, 'SELECT id, kata_korea, terjemahan_indo FROM vocabulary WHERE user_id = ? ORDER BY level_hafalan ASC, RANDOM() LIMIT 80', [u.id]);
  if (!vocab.results.length) return json({ error: 'Tambahkan kosakata ke kamus terlebih dahulu.' }, 400);

  const prompt = `Buat cerita pendek bahasa Korea bertema "${tema}" level "${tingkat}" menggunakan kosakata user berikut sebanyak mungkin. Kembalikan JSON: {"judul":"...","isi_cerita_korea":"...","analysis":[{"surface":"kata persis dalam cerita","lemma":"bentuk kamus","meaning":"arti Indonesia","particles":"partikel/grammar yang menempel dan fungsi","role":"S|P|O|K","explanation":"penjelasan singkat"}],"new_vocabulary":[{"kata_korea":"...","terjemahan_indo":"..."}]}. Analysis harus mencakup kata penting yang dapat diklik. Daftar kosakata: ${JSON.stringify(vocab.results)}`;

  try {
    const data = await generateJson(env, prompt);
    for (const nv of data.new_vocabulary || []) {
      if (!nv.kata_korea || !nv.terjemahan_indo) continue;
      await run(env.DB, `INSERT OR IGNORE INTO vocabulary (id,user_id,kata_korea,terjemahan_indo,level_hafalan,jumlah_benar,jumlah_salah) VALUES (?,?,?, ?,0,0,0)`, [newId('voc'), u.id, nv.kata_korea, nv.terjemahan_indo]);
    }
    const id = newId('story');
    await run(env.DB, 'INSERT INTO stories (id,user_id,tema,judul,isi_cerita_korea,tingkat,analysis_json) VALUES (?,?,?,?,?,?,?)', [id, u.id, tema, data.judul || tema, data.isi_cerita_korea || '', tingkat, JSON.stringify(data.analysis || [])]);
    return json({ data: { ...data, id } }, 201);
  } catch (error) {
    return json({ error: 'Gagal membuat cerita.', detail: error.message }, 502);
  }
}
