const BASE_URL = "https://api.groq.com/openai/v1";
const TEXT_MODEL = "openai/gpt-oss-120b";
const VISION_MODEL = "qwen/qwen3.8-27b";
export class AiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
export async function groqChat({ messages, vision = false, temperature = 0.2, maxTokens = 3000 }) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new AiError("ai_unconfigured", "GROQ_API_KEY is not set");
  const model = vision ? process.env.GROQ_VISION_MODEL || VISION_MODEL : process.env.GROQ_TEXT_MODEL || TEXT_MODEL;
  const body = JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, response_format: { type: "json_object" }, ...(model.includes("gpt-oss") ? { reasoning_effort: "low" } : {}) });
  const call = () => fetch(`${process.env.GROQ_BASE_URL || BASE_URL}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body, signal: AbortSignal.timeout(40000) });
  let res;
  try {
    res = await call();
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1500));
      res = await call();
    }
  } catch {
    throw new AiError("ai_unreachable", "Groq request failed");
  }
  if (res.status === 429) throw new AiError("ai_busy", "Groq rate limit");
  if (!res.ok) throw new AiError("ai_failed", `Groq error ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  return (await res.json())?.choices?.[0]?.message?.content ?? "";
}
export function parseJson(raw) {
  const text = String(raw).replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) try { return JSON.parse(m[0]); } catch {}
  }
  return null;
}
