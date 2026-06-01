# KnowledgeDiscovery

KnowledgeDiscovery is a Windows-first local desktop app built with Tauri, React, TypeScript, Vite, and Tailwind CSS.

Current phase: **Phase 3 - Local vault creation**

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

- Add a native folder picker for choosing a vault parent location.
- Add a Rust `create_vault` command.
- Create the `KnowledgeDiscoveryVault` folder structure on disk.
- Display vault path and creation state in the desktop shell.
- Do not initialize SQLite, import sources, chunk files, search content, extract claims, link evidence, or run AI workflows yet.
