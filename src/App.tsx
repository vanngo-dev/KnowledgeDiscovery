import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

type VaultCreationResult = {
  vault_path: string;
  created: boolean;
  directories_created: number;
  files_created: number;
};

const sidebarItems = [
  { label: "Vault", active: true },
  { label: "Evidence", active: false },
  { label: "Claims", active: false },
  { label: "Sources", active: false },
  { label: "Analysis", active: false },
];

const vaultStructure = [
  "00_Inbox",
  "01_Facts",
  "02_Observations_Hypotheses",
  "03_Analysis_Intelligence",
  "04_Metadata",
];

const metadataFiles = [
  "domains.md",
  "ontology.md",
  "scoring_rules.md",
  "classification_rules.md",
];

function App() {
  const [basePath, setBasePath] = useState("");
  const [vaultState, setVaultState] = useState<VaultCreationResult | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState(
    "Choose a location to create the local vault.",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function createVault() {
    setErrorMessage("");
    setIsCreating(true);

    try {
      const result = await invoke<VaultCreationResult>("create_vault", {
        basePath,
      });

      setVaultState(result);
      setStatusMessage(
        result.created
          ? "Vault created successfully."
          : "Vault already existed; missing folders and files were checked.",
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  }

  const canCreate = basePath.trim().length > 0 && !isCreating;

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
              Local vault workspace
            </p>
          </div>
        </div>

        <div className="mx-auto hidden w-full max-w-xl items-center rounded border border-[#cbd3cd] bg-[#f5f7f3] px-3 py-1.5 text-sm text-[#68746d] md:flex">
          {vaultState?.vault_path ?? "No vault created"}
          <span className="ml-auto rounded border border-[#cbd3cd] bg-white px-1.5 py-0.5 text-[11px] text-[#7b867f]">
            Phase 3
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className="rounded border border-[#c5ddcb] bg-[#eefbf1] px-2.5 py-1 text-xs font-medium text-[#27633a]">
            Vault setup
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
            <p className="mt-1 truncate text-sm font-medium text-[#26312e]">
              {vaultState ? "KnowledgeDiscoveryVault" : "No vault"}
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
              Vault creation
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
                Create Local Vault
              </h2>
            </div>
            <div className="rounded border border-[#cbd3cd] bg-white px-3 py-2 text-right">
              <p className="text-xs text-[#68746d]">State</p>
              <p className="text-sm font-semibold text-[#1f4d46]">
                {vaultState ? "Vault ready" : "Setup"}
              </p>
            </div>
          </section>

          <section className="rounded border border-[#cbd3cd] bg-white">
            <div className="border-b border-[#d5ddd7] px-4 py-3">
              <h3 className="text-sm font-semibold text-[#26312e]">
                Vault Location
              </h3>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-[#748079]"
                  htmlFor="base-path"
                >
                  Parent folder
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="base-path"
                    className="min-w-0 flex-1 rounded border border-[#cbd3cd] bg-[#fbfcf9] px-3 py-2 text-sm text-[#26312e] outline-none focus:border-[#1f4d46]"
                    onChange={(event) => {
                      setBasePath(event.target.value);
                      setStatusMessage("Location entered.");
                    }}
                    placeholder="Paste a parent folder path"
                    value={basePath}
                  />
                  <button
                    className="shrink-0 rounded bg-[#1f4d46] px-3 py-2 text-sm font-semibold text-white hover:bg-[#183d38] disabled:cursor-not-allowed disabled:bg-[#94aaa3]"
                    disabled={!canCreate}
                    onClick={createVault}
                    type="button"
                  >
                    {isCreating ? "Creating" : "Create vault"}
                  </button>
                </div>
              </div>

              {errorMessage ? (
                <p className="rounded border border-[#efc5c5] bg-[#fff4f4] px-3 py-2 text-sm text-[#8c2e2e]">
                  {errorMessage}
                </p>
              ) : null}

              <p className="rounded border border-[#d5ddd7] bg-[#f6f8f4] px-3 py-2 text-sm text-[#4d5a54]">
                {statusMessage}
              </p>
            </div>
          </section>

          <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <article className="rounded border border-[#cbd3cd] bg-white">
              <div className="border-b border-[#d5ddd7] px-4 py-3">
                <h3 className="text-sm font-semibold text-[#26312e]">
                  Folder Structure
                </h3>
              </div>
              <div className="grid gap-2 p-4 sm:grid-cols-2">
                {vaultStructure.map((folder) => (
                  <div
                    className="rounded border border-[#d5ddd7] bg-[#fbfcf9] px-3 py-2 text-sm font-medium text-[#26312e]"
                    key={folder}
                  >
                    {folder}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded border border-[#cbd3cd] bg-white">
              <div className="border-b border-[#d5ddd7] px-4 py-3">
                <h3 className="text-sm font-semibold text-[#26312e]">
                  Metadata Files
                </h3>
              </div>
              <div className="space-y-2 p-4">
                {metadataFiles.map((file) => (
                  <div
                    className="rounded border border-[#d5ddd7] bg-[#fbfcf9] px-3 py-2 text-sm text-[#4d5a54]"
                    key={file}
                  >
                    {file}
                  </div>
                ))}
              </div>
            </article>
          </section>
        </main>

        <aside className="min-h-0 border-l border-[#c2cbc4] bg-[#fbfcf9]">
          <div className="border-b border-[#d5ddd7] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#68746d]">
              Right Evidence Panel
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#26312e]">
              Vault State
            </h2>
          </div>

          <div className="space-y-3 p-4">
            <StateRow label="Vault" value="KnowledgeDiscoveryVault" />
            <StateRow
              label="Path"
              value={vaultState?.vault_path ?? "Not created"}
            />
            <StateRow
              label="Created"
              value={
                vaultState
                  ? vaultState.created
                    ? "New vault"
                    : "Existing vault"
                  : "Pending"
              }
            />
            <StateRow
              label="Folders added"
              value={vaultState ? String(vaultState.directories_created) : "0"}
            />
            <StateRow
              label="Files added"
              value={vaultState ? String(vaultState.files_created) : "0"}
            />
          </div>
        </aside>
      </div>

      <footer className="flex h-8 shrink-0 items-center justify-between border-t border-[#c2cbc4] bg-[#26312e] px-4 text-xs text-[#dce4dd]">
        <span>Phase 3</span>
        <span>Tauri + React + TypeScript + Vite + Tailwind CSS + Rust vault command</span>
        <span>com.knowledgediscovery.app</span>
      </footer>
    </div>
  );
}

function StateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#d5ddd7] bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#748079]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-[#26312e]">
        {value}
      </p>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while creating the vault.";
}

export default App;
