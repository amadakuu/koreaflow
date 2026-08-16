import { createSessionCookie, getOAuthState, redirect } from '../../_lib/auth.js';
import { first, run, newId } from '../../_lib/db.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url); const secure = url.protocol === 'https:'; const code = url.searchParams.get('code'); const state = url.searchParams.get('state'); const savedState = getOAuthState(request);
  if (!code || !state || !savedState || state !== savedState) return new Response('OAuth state tidak valid.', { status: 400 });
  const redirectUri = `${url.origin}/api/auth/callback`;
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,redirect_uri:redirectUri,grant_type:'authorization_code'})});
  if(!tokenResponse.ok)return new Response('Gagal menukar authorization code Google.',{status:502});
  const tokens=await tokenResponse.json(); if(!tokens.access_token)return new Response('Google tidak mengembalikan access token.',{status:502});
  const profileResponse=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:`Bearer ${tokens.access_token}`}}); if(!profileResponse.ok)return new Response('Gagal mengambil profil Google.',{status:502});
  const profile=await profileResponse.json(); if(!profile.sub||!profile.email)return new Response('Profil Google tidak lengkap.',{status:400});
  let user=await first(env.DB,'SELECT id, google_id, email, nama, foto, created_at FROM users WHERE google_id = ?',[profile.sub]);
  if(!user){user={id:newId('usr'),google_id:profile.sub,email:profile.email,nama:profile.name||profile.email.split('@')[0],foto:profile.picture||null,created_at:new Date().toISOString()};await run(env.DB,'INSERT INTO users (id,google_id,email,nama,foto,created_at) VALUES (?,?,?,?,?,?)',[user.id,user.google_id,user.email,user.nama,user.foto,user.created_at]);await run(env.DB,'INSERT OR IGNORE INTO settings (user_id) VALUES (?)',[user.id]);}
  else{await run(env.DB,'UPDATE users SET email=?, nama=?, foto=? WHERE id=?',[profile.email,profile.name||user.nama,profile.picture||user.foto,user.id]);user=await first(env.DB,'SELECT id,google_id,email,nama,foto,created_at FROM users WHERE id=?',[user.id]);}
  const session=await createSessionCookie(user,env.SESSION_SECRET,secure); const headers=new Headers({'Location':`${url.origin}/`,'Cache-Control':'no-store'}); headers.append('Set-Cookie',session); return new Response(null,{status:302,headers});
}
