# KnowledgeDiscovery

KnowledgeDiscovery is a Windows-first local desktop app built with Tauri, React, TypeScript, Vite, and Tailwind CSS.

Current phase: **Phase 6 - Markdown and text fact import**

## Phase 1 Scope

- Create the base Tauri desktop application.
- Render a clean KnowledgeDiscovery landing screen.
- Use the package/app identifier `com.knowledgediscovery.app`.
- Do not implement evidence storage, notes, SQLite, Tailwind, or Rust backend features yet.

## Commands

```powershell
pnpm install
pnpm tauri dev
```

## Phase 2 Scope

- Add Tailwind CSS through the Vite plugin.
- Replace the landing screen with the first real desktop application shell.
- Include a top command bar, left sidebar, center workspace, right evidence panel, and bottom status bar.
- Do not implement SQLite, evidence persistence, note-taking, or Rust backend commands yet.

## Phase 3 Scope

- Add manual parent-folder path entry for choosing a vault parent location.
- Add a Rust `create_vault` command.
- Create the `KnowledgeDiscoveryVault` folder structure on disk.
- Display vault path and creation state in the desktop shell.
- Do not initialize SQLite, import sources, chunk files, search content, extract claims, link evidence, or run AI workflows yet.

## Phase 4 Scope

- Initialize the internal SQLite app database at `KnowledgeDiscoveryVault/knowledgediscovery.sqlite`.
- Add Phase 4 schema bookkeeping tables only.
- Display the app DB path and creation state in the desktop shell.
- Do not import sources, chunk files, search content, extract claims, link evidence, or run AI workflows yet.

## Phase 5 Scope

- Add a read-only vault explorer and file tree.
- Display folders and files under `KnowledgeDiscoveryVault`.
- Do not read file contents.
- Do not import files into SQLite.
- Do not chunk files, search content, create source records, extract claims, link evidence, or run AI workflows yet.

## Phase 6 Scope

- Import `.md` and `.txt` files by manually entered file path.
- Copy imported files into the Facts area under `01_Facts/markdown` or `01_Facts/text`.
- Create `sources` records in SQLite.
- Read imported file content and split it into chunks.
- Store chunks in the `chunks` table.
- Do not add FTS search, semantic search, claims, evidence links, or AI workflows yet.
