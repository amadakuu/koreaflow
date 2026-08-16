import { getSession } from '../_lib/auth.js';
import { first, json, query } from '../_lib/db.js';

export async function onRequestGet({ request, env }) {
  const session = await getSession(request, env.SESSION_SECRET);
  if (!session) return json({ error: 'Unauthorized' }, 401);
  const uid = session.id;
  const totals = await first(env.DB, `SELECT COUNT(*) total, COALESCE(SUM(CASE WHEN level_hafalan >= 80 THEN 1 ELSE 0 END),0) hafal, COALESCE(ROUND(AVG(level_hafalan),1),0) rata FROM vocabulary WHERE user_id = ?`, [uid]);
  const low = await query(env.DB, `SELECT id,kata_korea,terjemahan_indo,level_hafalan FROM vocabulary WHERE user_id = ? ORDER BY level_hafalan ASC, RANDOM() LIMIT 10`, [uid]);
  const history = await query(env.DB, `SELECT * FROM quiz_history WHERE user_id = ? ORDER BY tanggal DESC LIMIT 10`, [uid]);
  const activity = await query(env.DB, `SELECT * FROM activity_log WHERE user_id = ? ORDER BY tanggal DESC LIMIT 20`, [uid]);
  const weekly = await query(env.DB, `SELECT substr(tanggal,1,10) hari, COUNT(*) aktivitas FROM activity_log WHERE user_id = ? AND tanggal >= datetime('now','-6 days') GROUP BY substr(tanggal,1,10) ORDER BY hari`, [uid]);
  return json({ data: { totals, rekomendasi: low.results, quiz_history: history.results, activity: activity.results, weekly: weekly.results } });
}
