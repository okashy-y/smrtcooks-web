export function cleanText(s: string): string {
  return s.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function pickSentences(text: string, maxChars: number): string {
  const t = cleanText(text);
  if (t.length <= maxChars) return t;
  const parts = t.split(/(?<=[.!?])\s+/);
  let out = "";
  for (const p of parts) {
    if ((out + p).length > maxChars) break;
    out += (out ? " " : "") + p;
  }
  if (!out) out = t.slice(0, maxChars);
  return out.trim();
}

export function extractBullets(text: string): string[] {
  const lines = cleanText(text).split("\n").map((l) => l.trim());
  const bullets: string[] = [];
  for (const l of lines) {
    const m = l.match(/^[-*•]\s+(.{3,})$/);
    if (m) bullets.push(m[1].trim());
  }
  return bullets;
}
