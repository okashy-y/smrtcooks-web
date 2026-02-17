import { VerifiedDoc } from "@/lib/types";
import { extractBullets, pickSentences } from "@/lib/text";

export type Citation = { url: string; title: string; domain: string };
export type AnswerResult = {
  summary: string;
  ingredients: string[];
  steps: string[];
  safetyNotes: string[];
  citations: Citation[];
};

function keywordScore(hay: string, needles: string[]): number {
  const lower = hay.toLowerCase();
  let score = 0;
  for (const n of needles) {
    const k = n.toLowerCase().trim();
    if (!k) continue;
    if (lower.includes(k)) score += 2;
  }
  return score;
}

export function buildAnswer(opts: {
  query: string;
  restrictions: string[];
  docs: VerifiedDoc[];
}): AnswerResult | null {
  const q = opts.query.trim();
  const restrictions = opts.restrictions.map((r) => r.trim()).filter(Boolean);
  const needles = [q, ...q.split(/\s+/), ...restrictions];

  const scored = opts.docs
    .map((d) => ({ d, s: keywordScore(d.title + "\n" + d.text, needles) }))
    .sort((a, b) => b.s - a.s);

  const top = scored.filter((x) => x.s > 0).slice(0, 5).map((x) => x.d);
  if (top.length === 0) return null;

  const citations = top.map((d) => ({ url: d.url, title: d.title, domain: d.domain }));
  const combined = top.map((d) => d.text).join("\n\n");
  const bullets = extractBullets(combined);

  const ingredients: string[] = [];
  const steps: string[] = [];

  for (const b of bullets) {
    const lower = b.toLowerCase();
    const isIngredient =
      lower.includes("cup") ||
      lower.includes("tbsp") ||
      lower.includes("tsp") ||
      lower.includes("gram") ||
      lower.includes("ml") ||
      lower.includes("oz") ||
      lower.includes("salt") ||
      lower.includes("flour") ||
      lower.includes("milk") ||
      lower.includes("sugar") ||
      lower.includes("butter") ||
      lower.includes("oil");

    const isStep =
      lower.startsWith("preheat") ||
      lower.startsWith("mix") ||
      lower.startsWith("whisk") ||
      lower.startsWith("bake") ||
      lower.startsWith("cook") ||
      lower.startsWith("stir") ||
      lower.startsWith("add") ||
      lower.startsWith("heat");

    if (isIngredient && ingredients.length < 12) ingredients.push(b);
    if (isStep && steps.length < 10) steps.push(b);
  }

  const summary = pickSentences(combined, 700);

  const safetyNotes: string[] = [];
  if (restrictions.length) {
    safetyNotes.push(
      `Double check labels for: ${restrictions.join(", ")}. Avoid shared equipment, and watch for cross contamination.`
    );
  } else {
    safetyNotes.push("Check labels carefully and consider cross contamination, especially with allergies.");
  }
  safetyNotes.push("If your restriction is medically critical, confirm with a clinician or dietitian.");

  if (!ingredients.length) ingredients.push("No structured ingredient list found in the current verified dataset for this exact query.");
  if (!steps.length) steps.push("No structured steps found in the current verified dataset for this exact query.");

  return { summary, ingredients, steps, safetyNotes, citations };
}
