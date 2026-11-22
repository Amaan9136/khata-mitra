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
export const apiGet = (url) => send(url);
export const apiPost = (url, data) => send(url, { method: "POST", body: JSON.stringify(data) });
export const apiPatch = (url, data) => send(url, { method: "PATCH", body: JSON.stringify(data) });
