import { getSession } from '../_lib/auth.js';
import { json, parseJson } from '../_lib/db.js';

export async function onRequestPost({ request, env }) {
  const session = await getSession(request, env.SESSION_SECRET);
  if (!session) return json({ error: 'Unauthorized' }, 401);

  const body = await parseJson(request);
  const kata = String(body.kata || '').trim();
  if (!kata) return json({ error: 'Kata Korea wajib diisi.' }, 400);

  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const prompt = `Kamu adalah tutor bahasa Korea untuk pelajar Indonesia. Untuk kata/frasa Korea berikut: "${kata}". Kembalikan JSON VALID saja dengan field: kata_korea, terjemahan_indo, contoh_kalimat_korea, contoh_kalimat_indo. Terjemahan harus ringkas dan contoh kalimat pendek, natural, level pemula. Jangan tambahkan markdown.`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    }),
  });

  if (!response.ok) return json({ error: 'Gemini gagal menghasilkan data.', detail: await response.text() }, 502);
  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return json({ error: 'Respons Gemini kosong.' }, 502);

  try {
    return json({ data: JSON.parse(text) });
  } catch {
    return json({ error: 'Gemini mengembalikan JSON yang tidak valid.' }, 502);
  }
}
