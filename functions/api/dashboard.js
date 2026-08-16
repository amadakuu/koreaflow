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
  const days = await query(env.DB, `SELECT hari FROM (SELECT substr(created_at,1,10) hari FROM vocabulary WHERE user_id=? UNION SELECT substr(tanggal,1,10) FROM quiz_history WHERE user_id=? UNION SELECT substr(tanggal,1,10) FROM stories WHERE user_id=?) WHERE hari IS NOT NULL ORDER BY hari DESC LIMIT 60`, [uid, uid, uid]);
  const weekly = await query(env.DB, `SELECT hari, COUNT(*) aktivitas FROM (SELECT substr(created_at,1,10) hari FROM vocabulary WHERE user_id=? AND created_at>=date('now','-6 days') UNION ALL SELECT substr(tanggal,1,10) FROM quiz_history WHERE user_id=? AND tanggal>=date('now','-6 days') UNION ALL SELECT substr(tanggal,1,10) FROM stories WHERE user_id=? AND tanggal>=date('now','-6 days')) GROUP BY hari ORDER BY hari`, [uid,uid,uid]);
  const today = new Date().toISOString().slice(0,10); const activeDays = new Set(days.results.map(x=>x.hari)); let streak=0; let cursor=new Date(`${today}T00:00:00Z`); while(activeDays.has(cursor.toISOString().slice(0,10))){streak++;cursor.setUTCDate(cursor.getUTCDate()-1);}
  return json({ data: { totals, rekomendasi: low.results, quiz_history: history.results, activity: activity.results, weekly: weekly.results, streak } });
}
