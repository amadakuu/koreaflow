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
  const result = await query(env.DB, 'SELECT * FROM quiz_history WHERE user_id = ? ORDER BY tanggal DESC LIMIT 100', [u.id]);
  return json({ data: result.results });
}

export async function onRequestPost({ request, env }) {
  const u = await user(request, env);
  if (!u) return json({ error: 'Unauthorized' }, 401);
  const body = await parseJson(request);
  const action = body.action || 'generate';
  const vocabResult = await query(env.DB, 'SELECT id, kata_korea, terjemahan_indo, contoh_kalimat_korea, contoh_kalimat_indo, level_hafalan FROM vocabulary WHERE user_id = ? ORDER BY level_hafalan ASC, RANDOM() LIMIT 100', [u.id]);
  if (!vocabResult.results.length) return json({ error: 'Tambahkan kosakata ke kamus terlebih dahulu.' }, 400);

  if (action === 'generate') {
    const jumlah = Math.max(1, Math.min(50, Number(body.jumlah_soal || 10)));
    const tema = String(body.tema || 'Kosakata umum');
    const tingkat = String(body.tingkat_kesulitan || 'Sedang');
    const compact = vocabResult.results.map(v => ({ id: v.id, korea: v.kata_korea, indo: v.terjemahan_indo, contoh: v.contoh_kalimat_korea })).slice(0, 80);
    const prompt = `Buat ${jumlah} soal bahasa Korea bertema "${tema}" dengan tingkat ${tingkat}. WAJIB memprioritaskan dan hanya memakai kosakata dari daftar user berikut. Jika membutuhkan kata lain, masukkan kata itu dalam field new_vocabulary sehingga backend dapat menambahkannya. Format JSON: {"questions":[{"question":"...","type":"mcq|fill","options":["..."],"answer":"...","related_vocab_ids":["id"],"related_words":["kata Korea"]}],"new_vocabulary":[{"kata_korea":"...","terjemahan_indo":"..."}]}. Daftar: ${JSON.stringify(compact)}`;
    try {
      const data = await generateJson(env, prompt);
      for (const nv of data.new_vocabulary || []) {
        if (!nv.kata_korea || !nv.terjemahan_indo) continue;
        await run(env.DB, `INSERT OR IGNORE INTO vocabulary (id,user_id,kata_korea,terjemahan_indo,level_hafalan,jumlah_benar,jumlah_salah) VALUES (?,?,?, ?,0,0,0)`, [newId('voc'), u.id, nv.kata_korea, nv.terjemahan_indo]);
      }
      return json({ data });
    } catch (error) {
      return json({ error: 'Gagal membuat soal.', detail: error.message }, 502);
    }
  }

  if (action === 'submit') {
    const score = Math.max(0, Math.min(100, Number(body.nilai || 0)));
    const questions = Array.isArray(body.questions) ? body.questions : [];
    const answers = Array.isArray(body.answers) ? body.answers : [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i] || {};
      const correct = answers[i] === q.answer;
      const ids = Array.isArray(q.related_vocab_ids) ? q.related_vocab_ids : [];
      for (const id of ids) {
        const v = await first(env.DB, 'SELECT level_hafalan FROM vocabulary WHERE id = ? AND user_id = ?', [id, u.id]);
        if (!v) continue;
        const next = correct ? Math.min(100, v.level_hafalan + 8) : Math.max(0, v.level_hafalan - 10);
        await run(env.DB, 'UPDATE vocabulary SET level_hafalan = ?, jumlah_benar = jumlah_benar + ?, jumlah_salah = jumlah_salah + ? WHERE id = ? AND user_id = ?', [next, correct ? 1 : 0, correct ? 0 : 1, id, u.id]);
      }
    }
    const id = newId('quiz');
    await run(env.DB, 'INSERT INTO quiz_history (id,user_id,tema,jumlah_soal,tingkat_kesulitan,nilai) VALUES (?,?,?,?,?,?)', [id, u.id, String(body.tema || 'Latihan'), questions.length, String(body.tingkat_kesulitan || 'Sedang'), score]);
    return json({ data: await first(env.DB, 'SELECT * FROM quiz_history WHERE id = ?', [id]) }, 201);
  }

  return json({ error: 'Action tidak dikenal.' }, 400);
}
