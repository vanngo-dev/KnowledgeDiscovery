# Architecture

## Phase 1

KnowledgeDiscovery currently uses a minimal Tauri shell around a Vite React application.

- Frontend: React + TypeScript in `src/`.
- Desktop shell: Tauri configuration and Rust entry point in `src-tauri/`.
- Dev server: Vite on `http://localhost:1420`.
- App identifier: `com.knowledgediscovery.app`.

No persistence, SQLite layer, evidence graph, or backend command surface exists in Phase 1.

## Phase 2

Tailwind CSS is integrated with Vite through `@tailwindcss/vite`.

The React app now renders the first desktop shell:

- Top command bar.
- Left sidebar.
- Center workspace.
- Right evidence panel.
- Bottom status bar.

The shell is static. No Phase 3 data workflows, SQLite persistence, or Rust command handlers have been added.

## Phase 3

Phase 3 introduces the first Rust backend command.

- Frontend folder selection is manual path entry to avoid native dialog build scripts blocked by Windows Application Control.
- Rust command: `create_vault`.
- Rust plugin: `tauri-plugin-opener`.
- Capability: `opener:default` for the main window.

The command creates `KnowledgeDiscoveryVault` inside the entered parent folder and ensures the required folder and metadata-file structure exists. The command is intentionally limited to filesystem folder/file creation. It does not create a SQLite database, import source files, index content, or perform evidence analysis.

## Phase 4

Phase 4 initializes the internal SQLite app database inside the local vault.

- SQLite path: `KnowledgeDiscoveryVault/knowledgediscovery.sqlite`.
- Rust dependency: `rusqlite` with bundled SQLite for Windows portability.
- Rust command: `create_vault` now also initializes the app DB.
- Schema version: `1`.

The Phase 4 schema is intentionally limited to app metadata and migration bookkeeping. It does not import source files, chunk content, create FTS search, extract claims, link evidence, run AI workflows, or create graph data.
