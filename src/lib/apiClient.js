export class ApiError extends Error {
  constructor(code, status, body) {
    super(code);
    this.code = code;
    this.status = status;
    this.body = body;
  }
}
async function send(url, options = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body?.error || "request_failed", res.status, body);
  return body;
}
const TTL = 30000;
const cache = new Map();
const flight = new Map();
let gen = 0;
export const apiGet = (url, { fresh = false } = {}) => {
  const hit = cache.get(url);
  if (!fresh && hit && Date.now() - hit.at < TTL) return Promise.resolve(hit.body);
  if (!fresh && flight.has(url)) return flight.get(url);
  const g = gen;
  const p = send(url).then((body) => {
    if (g === gen) cache.set(url, { body, at: Date.now() });
    return body;
  }).finally(() => flight.get(url) === p && flight.delete(url));
  flight.set(url, p);
  return p;
};
const mutate = (method) => (url, data) => send(url, { method, body: JSON.stringify(data) }).then((body) => {
  gen++;
  cache.clear();
  flight.clear();
  return body;
});
export const apiPost = mutate("POST");
export const apiPatch = mutate("PATCH");