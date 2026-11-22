import { DAY_MS, missingDocs, unresolvedHigh } from "./process.js";
export function priorityOf(app, now = Date.now()) {
  if (app.status !== "open") return { score: -1, reasons: [], daysLeft: null };
  const reasons = [];
  let score = 0;
  const daysLeft = Math.ceil((new Date(app.dueAt).getTime() - now) / DAY_MS);
  if (daysLeft < 0) {
    score += 60 + Math.min(-daysLeft, 30) * 2;
    reasons.push({ code: "overdue", n: -daysLeft });
  } else if (daysLeft <= 5) {
    score += 30 + (5 - daysLeft) * 3;
    reasons.push({ code: "due_soon", n: daysLeft });
  }
  const miss = missingDocs(app).length;
  if (miss) {
    score += 12 * miss;
    reasons.push({ code: "missing_docs", n: miss });
  }
  const high = unresolvedHigh(app).length;
  if (high) {
    score += 20 * high;
    reasons.push({ code: "flags", n: high });
  }
  if (app.inspection?.objection) {
    score += 25;
    reasons.push({ code: "objection" });
  }
  const idle = Math.floor((now - new Date(app.stepEnteredAt || app.receivedAt).getTime()) / DAY_MS);
  if (idle >= 7) {
    score += 10;
    reasons.push({ code: "idle", n: idle });
  }
  return { score, reasons, daysLeft };
}
export const byPriority = (a, b) => b.priority.score - a.priority.score || new Date(a.dueAt) - new Date(b.dueAt);
export const NEEDS_ATTENTION = 30;
