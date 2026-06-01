const sidebarItems = [
  { label: "Evidence", active: true },
  { label: "Claims", active: false },
  { label: "Sources", active: false },
  { label: "Analysis", active: false },
];

const workspaceCards = [
  {
    title: "Evidence Intake",
    meta: "Source-grounded queue",
    tone: "border-l-teal-600",
  },
  {
    title: "Claim Review",
    meta: "Reasoning workspace",
    tone: "border-l-amber-600",
  },
  {
    title: "Contradiction Watch",
    meta: "Signals and gaps",
    tone: "border-l-rose-600",
  },
];

const evidenceRows = [
  { label: "Source", value: "No item selected" },
  { label: "Confidence", value: "Pending" },
  { label: "Links", value: "0" },
];

function App() {
  return (
    <div className="flex h-screen min-h-[620px] flex-col overflow-hidden bg-[#eef1ed] text-[#1f2624]">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[#cbd3cd] bg-[#fbfcf9] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded bg-[#1f4d46] text-sm font-semibold text-white">
            KD
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-5">
              KnowledgeDiscovery
            </h1>
            <p className="truncate text-xs text-[#68746d]">
              Local evidence workspace
            </p>
          </div>
        </div>

        <div className="mx-auto hidden w-full max-w-xl items-center rounded border border-[#cbd3cd] bg-[#f5f7f3] px-3 py-1.5 text-sm text-[#68746d] md:flex">
          Command search
          <span className="ml-auto rounded border border-[#cbd3cd] bg-white px-1.5 py-0.5 text-[11px] text-[#7b867f]">
            Phase 2
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className="rounded border border-[#d8c8a6] bg-[#fff7e5] px-2.5 py-1 text-xs font-medium text-[#74531a]">
            Prototype
          </span>
          <span className="rounded border border-[#cbd3cd] bg-white px-2.5 py-1 text-xs text-[#5f6b65]">
            Windows
          </span>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)_320px] bg-[#dde3dd]">
        <aside className="min-h-0 border-r border-[#c2cbc4] bg-[#f6f8f4]">
          <div className="border-b border-[#d5ddd7] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#748079]">
              Workspace
            </p>
            <p className="mt-1 text-sm font-medium text-[#26312e]">
              KnowledgeDiscoveryVault
            </p>
          </div>

          <nav className="space-y-1 p-3" aria-label="Primary">
            {sidebarItems.map((item) => (
              <div
                key={item.label}
                className={`rounded px-3 py-2 text-sm font-medium ${
                  item.active
                    ? "bg-[#1f4d46] text-white"
                    : "text-[#4d5a54] hover:bg-[#e7ece7]"
                }`}
              >
                {item.label}
              </div>
            ))}
          </nav>

          <div className="mx-3 mt-4 rounded border border-[#d5ddd7] bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#748079]">
              Phase
            </p>
            <p className="mt-2 text-sm font-medium text-[#26312e]">
              Desktop shell
            </p>
          </div>
        </aside>

        <main className="min-h-0 overflow-auto bg-[#eef1ed] p-5">
          <section className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#68746d]">
                Center Workspace
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#1c2723]">
                Evidence Engine Shell
              </h2>
            </div>
            <div className="rounded border border-[#cbd3cd] bg-white px-3 py-2 text-right">
              <p className="text-xs text-[#68746d]">State</p>
              <p className="text-sm font-semibold text-[#1f4d46]">Ready</p>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            {workspaceCards.map((card) => (
              <article
                key={card.title}
                className={`min-h-32 rounded border border-[#cbd3cd] border-l-4 ${card.tone} bg-white p-4 shadow-sm`}
              >
                <p className="text-sm font-semibold text-[#26312e]">
                  {card.title}
                </p>
                <p className="mt-2 text-sm text-[#68746d]">{card.meta}</p>
              </article>
            ))}
          </section>

          <section className="mt-5 rounded border border-[#cbd3cd] bg-white">
            <div className="border-b border-[#d5ddd7] px-4 py-3">
              <h3 className="text-sm font-semibold text-[#26312e]">
                Working Surface
              </h3>
            </div>
            <div className="grid min-h-72 place-items-center p-8 text-center">
              <div>
                <p className="text-lg font-semibold text-[#26312e]">
                  No workspace item selected
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#68746d]">
                  Source context, claims, and analysis will share this surface.
                </p>
              </div>
            </div>
          </section>
        </main>

        <aside className="min-h-0 border-l border-[#c2cbc4] bg-[#fbfcf9]">
          <div className="border-b border-[#d5ddd7] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#68746d]">
              Right Evidence Panel
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#26312e]">
              Evidence Detail
            </h2>
          </div>

          <div className="space-y-3 p-4">
            {evidenceRows.map((row) => (
              <div
                key={row.label}
                className="rounded border border-[#d5ddd7] bg-white p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[#748079]">
                  {row.label}
                </p>
                <p className="mt-1 text-sm font-medium text-[#26312e]">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <footer className="flex h-8 shrink-0 items-center justify-between border-t border-[#c2cbc4] bg-[#26312e] px-4 text-xs text-[#dce4dd]">
        <span>Phase 2</span>
        <span>Tauri + React + TypeScript + Vite + Tailwind CSS</span>
        <span>com.knowledgediscovery.app</span>
      </footer>
    </div>
  );
}

export default App;
