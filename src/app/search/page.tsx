"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import type { VerifiedBundle } from "@/lib/types";
import { buildAnswer } from "@/lib/answer";

const BundleSchema = z.object({
  version: z.number(),
  updated_at: z.string(),
  docs: z.array(
    z.object({
      id: z.string(),
      domain: z.string(),
      url: z.string().url(),
      title: z.string(),
      text: z.string()
    })
  )
});

type AnswerState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "none"; reason: string }
  | { kind: "ok"; data: any };

function chipNormalize(s: string): string {
  return s.trim().toLowerCase();
}

export default function SearchPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const initialQ = typeof searchParams?.q === "string" ? searchParams.q : "";
  const [q, setQ] = useState(initialQ);
  const [chipInput, setChipInput] = useState("");
  const [chips, setChips] = useState<string[]>(["lactose-free"]);
  const [state, setState] = useState<AnswerState>({ kind: "idle" });
  const [bundle, setBundle] = useState<VerifiedBundle | null>(null);

  const canSearch = useMemo(() => q.trim().length > 0, [q]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/data/verified_docs.json", { cache: "no-store" });
        const json = await res.json();
        const parsed = BundleSchema.safeParse(json);
        if (!parsed.success) throw new Error("Invalid verified_docs.json format");
        if (!cancelled) setBundle(parsed.data as any);
      } catch (e) {
        if (!cancelled) setState({ kind: "error", message: e instanceof Error ? e.message : "Failed to load dataset" });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function addChip() {
    const v = chipNormalize(chipInput);
    if (!v) return;
    if (!chips.includes(v)) setChips([...chips, v]);
    setChipInput("");
  }

  function removeChip(v: string) {
    setChips(chips.filter((c) => c !== v));
  }

  async function run() {
    if (!bundle || !canSearch) return;
    setState({ kind: "loading" });
    const ans = buildAnswer({ query: q, restrictions: chips, docs: bundle.docs });
    if (!ans) {
      setState({ kind: "none", reason: "No verified sources found in the current dataset for this query yet." });
      return;
    }
    setState({ kind: "ok", data: { ...ans, updated_at: bundle.updated_at } });
  }

  const headerNote = bundle ? `Dataset updated: ${bundle.updated_at}. Docs: ${bundle.docs.length}` : "Loading verified dataset...";

  return (
    <main className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="text-sm font-semibold">Search</div>
        <div className="mt-2 text-xs text-zinc-400">{headerNote}</div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="lactose free pancakes"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-zinc-500"
          />
          <button
            onClick={run}
            disabled={!canSearch || state.kind === "loading" || !bundle}
            className="rounded-xl bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-60"
          >
            {state.kind === "loading" ? "Searching..." : "Get verified answer"}
          </button>
        </div>

        <div className="mt-5">
          <div className="text-xs text-zinc-300">Restrictions</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => removeChip(c)}
                className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-200 hover:border-zinc-500"
                title="Click to remove"
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={chipInput}
              onChange={(e) => setChipInput(e.target.value)}
              placeholder="Add: gluten-free, nut-free, egg-free"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm outline-none focus:border-zinc-500"
            />
            <button onClick={addChip} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900">
              Add
            </button>
          </div>

          <div className="mt-2 text-xs text-zinc-400">
            This version searches only the shipped dataset. Update it from /admin.
          </div>
        </div>
      </div>

      {state.kind === "error" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="text-sm font-semibold">Error</div>
          <div className="mt-2 text-sm text-zinc-300">{state.message}</div>
        </div>
      )}

      {state.kind === "none" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="text-sm font-semibold">No verified answer</div>
          <div className="mt-2 text-sm text-zinc-300">{state.reason}</div>
        </div>
      )}

      {state.kind === "ok" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="text-sm font-semibold">Verified summary</div>
            <p className="mt-2 text-sm text-zinc-200 whitespace-pre-wrap">{state.data.summary}</p>
            <div className="mt-3 text-xs text-zinc-500">Dataset updated: {state.data.updated_at}</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="text-sm font-semibold">Ingredients</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-zinc-200">
                {state.data.ingredients.map((x: string, i: number) => <li key={i}>{x}</li>)}
              </ul>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="text-sm font-semibold">Steps</div>
              <ol className="mt-2 list-decimal pl-5 text-sm text-zinc-200">
                {state.data.steps.map((x: string, i: number) => <li key={i}>{x}</li>)}
              </ol>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="text-sm font-semibold">Safety notes</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-zinc-200">
              {state.data.safetyNotes.map((x: string, i: number) => <li key={i}>{x}</li>)}
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="text-sm font-semibold">Citations</div>
            <ul className="mt-2 space-y-2 text-sm">
              {state.data.citations.map((c: any, i: number) => (
                <li key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                  <div className="text-zinc-200">{c.title || c.url}</div>
                  <div className="mt-1 text-xs text-zinc-400">{c.domain}</div>
                  <a className="mt-2 inline-block text-xs text-zinc-300 underline" href={c.url} target="_blank">
                    Open source
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
