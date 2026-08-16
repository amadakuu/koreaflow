export async function query(db, sql, params = []) {
  return db.prepare(sql).bind(...params).all();
}

export async function first(db, sql, params = []) {
  return db.prepare(sql).bind(...params).first();
}

export async function run(db, sql, params = []) {
  return db.prepare(sql).bind(...params).run();
}

export function newId(prefix = 'id') {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

export function parseJson(request) {
  return request.json().catch(() => ({}));
}
