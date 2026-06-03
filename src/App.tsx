import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

type VaultCreationResult = {
  vault_path: string;
  database_path: string;
  created: boolean;
  database_created: boolean;
  directories_created: number;
  files_created: number;
};

type DatabaseHealthStatus = "Not checked" | "Checking" | "Healthy" | "Failed";
type VaultTreeStatus = "Not loaded" | "Loading" | "Loaded" | "Failed";

type VaultTreeEntry = {
  name: string;
  path: string;
  relative_path: string;
  entry_type: "directory" | "file";
  children: VaultTreeEntry[];
};

type FactImportResult = {
  source_id: number;
  original_path: string;
  vault_path: string;
  relative_path: string;
  file_name: string;
  extension: string;
  chunk_count: number;
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

const appDatabase = "knowledgediscovery.sqlite";

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
  const [databaseHealthStatus, setDatabaseHealthStatus] =
    useState<DatabaseHealthStatus>("Not checked");
  const [databaseHealthMessage, setDatabaseHealthMessage] = useState("");
  const [vaultTree, setVaultTree] = useState<VaultTreeEntry | null>(null);
  const [vaultTreeStatus, setVaultTreeStatus] =
    useState<VaultTreeStatus>("Not loaded");
  const [vaultTreeMessage, setVaultTreeMessage] = useState("");
  const [selectedTreePath, setSelectedTreePath] = useState("");
  const [sourceFilePath, setSourceFilePath] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importedSources, setImportedSources] = useState<FactImportResult[]>(
    [],
  );

  async function createVault() {
    setErrorMessage("");
    setIsCreating(true);
    setDatabaseHealthStatus("Not checked");
    setDatabaseHealthMessage("");
    setVaultTree(null);
    setVaultTreeStatus("Not loaded");
    setVaultTreeMessage("");
    setSelectedTreePath("");
    setImportMessage("");
    setImportedSources([]);

    try {
      const result = await invoke<VaultCreationResult>("create_vault", {
        basePath,
      });

      setVaultState(result);
      setStatusMessage(
        result.created
          ? "Vault and app database created successfully."
          : "Vault already existed; folders, files, and app database were checked.",
      );
      await loadVaultTree(result.vault_path);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  }

  async function importFactFile() {
    if (!vaultState) {
      return;
    }

    setErrorMessage("");
    setImportMessage("");
    setIsImporting(true);

    try {
      const result = await invoke<FactImportResult>("import_fact_file", {
        sourceFilePath,
        vaultPath: vaultState.vault_path,
      });

      setImportedSources((currentSources) => [result, ...currentSources]);
      setImportMessage(
        `Imported ${result.file_name} into Facts with ${result.chunk_count} chunk${result.chunk_count === 1 ? "" : "s"}.`,
      );
      setSourceFilePath("");
      await loadVaultTree(vaultState.vault_path);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsImporting(false);
    }
  }

  async function checkHealth() {
    if (!vaultState) {
      return;
    }

    setErrorMessage("");
    setDatabaseHealthStatus("Checking");
    setDatabaseHealthMessage("");

    try {
      const result = await checkDatabaseHealth(vaultState.vault_path);
      setDatabaseHealthStatus(isHealthResultHealthy(result) ? "Healthy" : "Failed");
      setDatabaseHealthMessage(getHealthMessage(result));
    } catch (error) {
      setDatabaseHealthStatus("Failed");
      setDatabaseHealthMessage(getErrorMessage(error));
    }
  }

  async function loadVaultTree(vaultPath = vaultState?.vault_path) {
    if (!vaultPath) {
      return;
    }

    setVaultTreeStatus("Loading");
    setVaultTreeMessage("");

    try {
      const tree = await listVaultTree(vaultPath);

      setVaultTree(tree);
      setVaultTreeStatus("Loaded");
      setVaultTreeMessage("Vault tree loaded.");
    } catch (error) {
      setVaultTree(null);
      setVaultTreeStatus("Failed");
      setVaultTreeMessage(getErrorMessage(error));
    }
  }

  const canCreate = basePath.trim().length > 0 && !isCreating;
  const canCheckDatabaseHealth =
    vaultState !== null && databaseHealthStatus !== "Checking";
  const canRefreshVaultTree =
    vaultState !== null && vaultTreeStatus !== "Loading";
  const canImportFactFile =
    vaultState !== null && sourceFilePath.trim().length > 0 && !isImporting;

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
            Phase 6
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
              Fact import
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
                Import Facts
              </h2>
            </div>
            <div className="rounded border border-[#cbd3cd] bg-white px-3 py-2 text-right">
              <p className="text-xs text-[#68746d]">State</p>
              <p className="text-sm font-semibold text-[#1f4d46]">
                {vaultTree ? "Tree loaded" : vaultState ? "Vault ready" : "Setup"}
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

          <section className="mt-5 rounded border border-[#cbd3cd] bg-white">
            <div className="border-b border-[#d5ddd7] px-4 py-3">
              <h3 className="text-sm font-semibold text-[#26312e]">
                Import Fact File
              </h3>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-[#748079]"
                  htmlFor="source-file-path"
                >
                  .md or .txt source path
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="source-file-path"
                    className="min-w-0 flex-1 rounded border border-[#cbd3cd] bg-[#fbfcf9] px-3 py-2 text-sm text-[#26312e] outline-none focus:border-[#1f4d46] disabled:cursor-not-allowed disabled:text-[#94aaa3]"
                    disabled={!vaultState || isImporting}
                    onChange={(event) => setSourceFilePath(event.target.value)}
                    placeholder="Paste a .md or .txt file path"
                    value={sourceFilePath}
                  />
                  <button
                    className="shrink-0 rounded bg-[#1f4d46] px-3 py-2 text-sm font-semibold text-white hover:bg-[#183d38] disabled:cursor-not-allowed disabled:bg-[#94aaa3]"
                    disabled={!canImportFactFile}
                    onClick={importFactFile}
                    type="button"
                  >
                    {isImporting ? "Importing" : "Import file"}
                  </button>
                </div>
              </div>

              {importMessage ? (
                <p className="rounded border border-[#c5ddcb] bg-[#eefbf1] px-3 py-2 text-sm text-[#27633a]">
                  {importMessage}
                </p>
              ) : null}

              <div className="rounded border border-[#d5ddd7] bg-[#f6f8f4]">
                <div className="border-b border-[#d5ddd7] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#748079]">
                  Imported sources
                </div>
                <div className="space-y-2 p-3">
                  {importedSources.length > 0 ? (
                    importedSources.map((source) => (
                      <div
                        className="rounded border border-[#d5ddd7] bg-white px-3 py-2"
                        key={source.source_id}
                      >
                        <div className="flex min-w-0 items-center justify-between gap-3">
                          <p className="min-w-0 truncate text-sm font-medium text-[#26312e]">
                            {source.file_name}
                          </p>
                          <span className="shrink-0 rounded border border-[#cbd3cd] bg-[#fbfcf9] px-2 py-0.5 text-xs text-[#4d5a54]">
                            {source.chunk_count} chunk
                            {source.chunk_count === 1 ? "" : "s"}
                          </span>
                        </div>
                        <p className="mt-1 break-words text-xs text-[#68746d]">
                          {source.relative_path}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#68746d]">
                      No Phase 6 files imported yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded border border-[#cbd3cd] bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-[#d5ddd7] px-4 py-3">
              <h3 className="text-sm font-semibold text-[#26312e]">
                Vault File Tree
              </h3>
              {vaultState ? (
                <button
                  className="shrink-0 rounded border border-[#b9c5bd] bg-white px-3 py-2 text-sm font-medium text-[#26312e] hover:bg-[#f1f4f0] disabled:cursor-not-allowed disabled:text-[#94aaa3]"
                  disabled={!canRefreshVaultTree}
                  onClick={() => loadVaultTree()}
                  type="button"
                >
                  {vaultTreeStatus === "Loading" ? "Loading Tree" : "Refresh Tree"}
                </button>
              ) : null}
            </div>
            <div className="min-h-64 p-4">
              {vaultTree ? (
                <div className="rounded border border-[#d5ddd7] bg-[#fbfcf9] p-2">
                  <VaultTree
                    entry={vaultTree}
                    onSelect={setSelectedTreePath}
                    selectedPath={selectedTreePath}
                  />
                </div>
              ) : (
                <div className="grid min-h-52 place-items-center rounded border border-dashed border-[#c2cbc4] bg-[#f6f8f4] px-4 text-center">
                  <p className="text-sm font-medium text-[#4d5a54]">
                    {vaultTreeStatus === "Loading"
                      ? "Loading vault tree."
                      : vaultTreeMessage || "Create a vault to load the file tree."}
                  </p>
                </div>
              )}
              {vaultTree && vaultTreeMessage ? (
                <p className="mt-3 rounded border border-[#d5ddd7] bg-[#f6f8f4] px-3 py-2 text-sm text-[#4d5a54]">
                  {vaultTreeMessage}
                </p>
              ) : null}
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

            <article className="rounded border border-[#cbd3cd] bg-white">
              <div className="border-b border-[#d5ddd7] px-4 py-3">
                <h3 className="text-sm font-semibold text-[#26312e]">
                  App Database
                </h3>
              </div>
              <div className="space-y-2 p-4">
                <div className="rounded border border-[#d5ddd7] bg-[#fbfcf9] px-3 py-2 text-sm font-medium text-[#26312e]">
                  {appDatabase}
                </div>
                <div className="rounded border border-[#d5ddd7] bg-[#fbfcf9] px-3 py-2 text-sm text-[#4d5a54]">
                  Schema version 1
                </div>
                {vaultState ? (
                  <button
                    className="w-full rounded bg-[#1f4d46] px-3 py-2 text-sm font-semibold text-white hover:bg-[#183d38] disabled:cursor-not-allowed disabled:bg-[#94aaa3]"
                    disabled={!canCheckDatabaseHealth}
                    onClick={checkHealth}
                    type="button"
                  >
                    {databaseHealthStatus === "Checking"
                      ? "Checking DB Health"
                      : "Check DB Health"}
                  </button>
                ) : null}
                {databaseHealthMessage ? (
                  <p
                    className={`rounded border px-3 py-2 text-sm ${
                      databaseHealthStatus === "Failed"
                        ? "border-[#efc5c5] bg-[#fff4f4] text-[#8c2e2e]"
                        : "border-[#c5ddcb] bg-[#eefbf1] text-[#27633a]"
                    }`}
                  >
                    {databaseHealthMessage}
                  </p>
                ) : null}
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
              label="App DB"
              value={vaultState?.database_path ?? "Not initialized"}
            />
            <StateRow
              label="DB created"
              value={
                vaultState
                  ? vaultState.database_created
                    ? "New database"
                    : "Existing database"
                  : "Pending"
              }
            />
            <StateRow label="DB health" value={databaseHealthStatus} />
            <StateRow label="Tree" value={vaultTreeStatus} />
            <StateRow
              label="Sources"
              value={String(importedSources.length)}
            />
            <StateRow
              label="Latest chunks"
              value={
                importedSources[0]
                  ? String(importedSources[0].chunk_count)
                  : "0"
              }
            />
            <StateRow
              label="Selected"
              value={selectedTreePath || "No tree item selected"}
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
        <span>Phase 6</span>
        <span>Tauri + React + TypeScript + Vite + Tailwind CSS + Rust vault command + SQLite app DB + source chunks</span>
        <span>com.knowledgediscovery.app</span>
      </footer>
    </div>
  );
}

async function checkDatabaseHealth(vaultPath: string) {
  return invoke<unknown>("check_database_health", { vaultPath });
}

async function listVaultTree(vaultPath: string) {
  return invoke<VaultTreeEntry>("list_vault_tree", { vaultPath });
}

function VaultTree({
  entry,
  onSelect,
  selectedPath,
  depth = 0,
}: {
  entry: VaultTreeEntry;
  onSelect: (path: string) => void;
  selectedPath: string;
  depth?: number;
}) {
  const isSelected = selectedPath === entry.path;

  return (
    <div>
      <button
        className={`flex h-8 w-full min-w-0 items-center gap-2 rounded px-2 text-left text-sm ${
          isSelected
            ? "bg-[#1f4d46] text-white"
            : "text-[#26312e] hover:bg-[#e7ece7]"
        }`}
        onClick={() => onSelect(entry.path)}
        style={{ paddingLeft: `${8 + depth * 18}px` }}
        title={entry.path}
        type="button"
      >
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
            isSelected
              ? "border-[#dce4dd] text-white"
              : "border-[#cbd3cd] text-[#68746d]"
          }`}
        >
          {entry.entry_type === "directory" ? "DIR" : "FILE"}
        </span>
        <span className="min-w-0 truncate">{entry.name}</span>
      </button>
      {entry.children.length > 0 ? (
        <div>
          {entry.children.map((child) => (
            <VaultTree
              depth={depth + 1}
              entry={child}
              key={child.path}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      ) : null}
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

function getHealthMessage(result: unknown) {
  if (typeof result === "string") {
    return result;
  }

  if (typeof result === "boolean") {
    return result ? "Database health check passed." : "Database health check failed.";
  }

  if (result && typeof result === "object") {
    const message = "message" in result ? result.message : undefined;

    if (typeof message === "string") {
      return message;
    }
  }

  return "Database health check passed.";
}

function isHealthResultHealthy(result: unknown) {
  if (typeof result === "boolean") {
    return result;
  }

  if (result && typeof result === "object") {
    const healthy = "healthy" in result ? result.healthy : undefined;
    const ok = "ok" in result ? result.ok : undefined;

    if (typeof healthy === "boolean") {
      return healthy;
    }

    if (typeof ok === "boolean") {
      return ok;
    }
  }

  return true;
}

export default App;
