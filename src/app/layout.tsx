import "./globals.css";

export const metadata = {
  title: "SMRTCOOKS",
  description: "Verified-source cooking for dietary restrictions"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold tracking-tight">SMRTCOOKS</div>
              <div className="text-sm text-zinc-300">Everyone deserves a cookie.</div>
            </div>
            <nav className="flex gap-2">
              <a href="/" className="rounded-lg border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-900">Home</a>
              <a href="/admin" className="rounded-lg border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-900">Admin</a>
            </nav>
          </header>

          {children}

          <footer className="mt-14 border-t border-zinc-900 pt-6 text-xs text-zinc-400">
            Verified-source assistant. Citations required. Not a replacement for medical advice.
          </footer>
        </div>
      </body>
    </html>
  );
}
