const SESSION_COOKIE = 'koreaflow_session';
const STATE_COOKIE = 'koreaflow_oauth_state';
function base64url(bytes){let binary='';bytes.forEach(b=>binary+=String.fromCharCode(b));return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function encodeText(value){return new TextEncoder().encode(value);}
async function sign(value,secret){const key=await crypto.subtle.importKey('raw',encodeText(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return base64url(new Uint8Array(await crypto.subtle.sign('HMAC',key,encodeText(value))));}
async function verify(value,signature,secret){const expected=await sign(value,secret);if(expected.length!==signature.length)return false;let diff=0;for(let i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^signature.charCodeAt(i);return diff===0;}
function getCookie(request,name){const cookie=request.headers.get('Cookie')||'';const match=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${name}=`));return match?decodeURIComponent(match.slice(name.length+1)):null;}
function cookie(name,value,options={}){const parts=[`${name}=${encodeURIComponent(value)}`,'Path=/','HttpOnly','SameSite=Lax'];if(options.maxAge!=null)parts.push(`Max-Age=${options.maxAge}`);if(options.secure)parts.push('Secure');return parts.join('; ');}
export async function createSessionCookie(user,secret,secure=true){const payload=base64url(encodeText(JSON.stringify({id:user.id,email:user.email,exp:Math.floor(Date.now()/1000)+60*60*24*30})));return cookie(SESSION_COOKIE,`${payload}.${await sign(payload,secret)}`,{maxAge:60*60*24*30,secure});}
export async function getSession(request,secret){const raw=getCookie(request,SESSION_COOKIE);if(!raw)return null;const [payload,signature]=raw.split('.');if(!payload||!signature||!(await verify(payload,signature,secret)))return null;try{const json=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.replace(/-/g,'+').replace(/_/g,'/')),(c)=>c.charCodeAt(0))));if(!json.exp||json.exp<Math.floor(Date.now()/1000))return null;return json;}catch{return null;}}
export function oauthStateCookie(state,secure=true){return cookie(STATE_COOKIE,state,{maxAge:600,secure});}
export function getOAuthState(request){return getCookie(request,STATE_COOKIE);}
export function clearSessionCookies(secure=true){return[cookie(SESSION_COOKIE,'',{maxAge:0,secure}),cookie(STATE_COOKIE,'',{maxAge:0,secure})];}
export function redirect(url,headers={}){return new Response(null,{status:302,headers:{Location:url,...headers}});}
export {getCookie};
