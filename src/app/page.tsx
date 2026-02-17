export default function HomePage() {
  return (
    <main className="space-y-8">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-7">
        <h1 className="text-3xl font-semibold tracking-tight">Cravings, safely.</h1>
        <p className="mt-2 text-zinc-300">
          This version runs fully in your browser and only uses the verified dataset shipped with the site.
          If we cannot cite it, we do not answer.
        </p>

        <form action="/search" className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            name="q"
            placeholder="Try: lactose free pancakes"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-zinc-500"
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-white"
          >
            Search
          </button>
        </form>

        <div className="mt-4 text-xs text-zinc-400">
          Admin can update the verified dataset from /admin and re-upload the JSON file into the repo.
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="text-sm font-semibold">No backend</div>
          <div className="mt-2 text-sm text-zinc-300">
            Works even when platforms and databases are blocked. Everything is static files.
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="text-sm font-semibold">Citations always</div>
          <div className="mt-2 text-sm text-zinc-300">
            Answers show the exact URLs used from the verified dataset.
          </div>
        </div>
      </section>
    </main>
  );
}
