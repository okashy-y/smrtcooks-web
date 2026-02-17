"use client";

import { useMemo, useState } from "react";
import { z } from "zod";

const DocSchema = z.object({
  id: z.string().min(1),
  domain: z.string().min(1),
  url: z.string().url(),
  title: z.string().min(1),
  text: z.string().min(20)
});

const BundleSchema = z.object({
  version: z.number(),
  updated_at: z.string(),
  docs: z.array(DocSchema)
});

type Bundle = z.infer<typeof BundleSchema>;

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AdminPage() {
  const [raw, setRaw] = useState<string>(`{
  "version": 1,
  "updated_at": "${todayISO()}",
  "docs": [
    {
      "id": "who-home",
      "domain": "www.who.int",
      "url": "https://www.who.int/",
      "title": "World Health Organization",
      "text": "Replace this placeholder with verified source text you are allowed to store."
    }
  ]
}`);
  const [status, setStatus] = useState<string>("");

  const parsed = useMemo(() => {
    try {
      const j = JSON.parse(raw);
      const p = BundleSchema.safeParse(j);
      if (!p.success) return { ok: false as const, err: p.error.message };
      return { ok: true as const, bundle: p.data as Bundle };
    } catch (e) {
      return { ok: false as const, err: e instanceof Error ? e.message : "Invalid JSON" };
    }
  }, [raw]);

  function download() {
    if (!parsed.ok) {
      setStatus(parsed.err);
      return;
    }
    const blob = new Blob([JSON.stringify(parsed.bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "verified_docs.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus("Downloaded verified_docs.json. Upload it to public/data/ in GitHub, replacing the old file.");
  }

  return (
    <main className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="text-xl font-semibold">Admin (Static Dataset Editor)</div>
        <div className="mt-2 text-sm text-zinc-300">
          Edit the verified dataset JSON, then download it. This app will only answer using what you ship in that file.
        </div>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300">
          Rule: Do not include anything you cannot legally store. Use citations as URLs, and store only the necessary text.
        </div>

        <div className="mt-4">
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={18}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-zinc-500"
          />
          <div className="mt-2 text-xs text-zinc-400">
            {parsed.ok ? `Valid JSON. Docs: ${parsed.bundle.docs.length}` : `Invalid: ${parsed.err}`}
          </div>
        </div>

        <button
          onClick={download}
          className="mt-3 rounded-xl bg-zinc-100 px-5 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
        >
          Download verified_docs.json
        </button>

        {status && <div className="mt-3 text-xs text-zinc-400">{status}</div>}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="text-sm font-semibold">How to publish the update (no terminal)</div>
        <ol className="mt-2 list-decimal pl-5 text-sm text-zinc-200 space-y-1">
          <li>Download the file from the button above.</li>
          <li>Open your GitHub repo in the browser.</li>
          <li>Go to public/data/ and upload the new verified_docs.json, replacing the old one.</li>
          <li>Commit the change.</li>
          <li>Redeploy your static site host, or wait for auto deploy.</li>
        </ol>
      </div>
    </main>
  );
}
