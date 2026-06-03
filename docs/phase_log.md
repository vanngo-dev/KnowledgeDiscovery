# Phase Log

## Phase 1 - Base Desktop Scaffold

Status: Implementation complete; native verification blocked by Windows Application Control.

Scope:

- Tauri + React + TypeScript + Vite scaffold.
- App/product name: `KnowledgeDiscovery`.
- Package/repository name: `knowledge-discovery`.
- App identifier: `com.knowledgediscovery.app`.
- Landing screen only.

Explicitly deferred:

- SQLite database setup.
- Evidence engine data model.
- Note-taking features.
- Tailwind styling.
- Rust backend commands beyond the minimal Tauri shell.

Verification:

- `npm run build` passes.
- `npm run tauri -- info` detects Windows, WebView2, MSVC, Rust, Node, npm, Tauri, React, and Vite.
- `npm run tauri -- build --debug` starts correctly but Windows Application Control blocks Cargo-generated build script executables with OS error `4551`.

## Phase 2 - Desktop Layout Shell

Status: Implementation complete.

Scope:

- Added Tailwind CSS using the Vite plugin.
- Replaced the Phase 1 landing screen with a desktop app shell.
- Added the required layout regions:
  - Top Command Bar
  - Left Sidebar
  - Center Workspace
  - Right Evidence Panel
  - Bottom Status Bar

Explicitly deferred:

- SQLite database setup.
- Evidence persistence and source ingestion.
- Note-taking features.
- Rust backend commands beyond the minimal Tauri shell.

Verification:

- `npm run build` passes.
- Vite dev server responds at `http://127.0.0.1:1420`.
- Native Tauri build verification remains blocked by the Windows Application Control policy recorded in Phase 1.

## Phase 3 - Local Vault Creation

Status: Implementation complete.

Scope:

- Added manual parent-folder path entry after Windows Application Control blocked the Tauri dialog plugin build script.
- Added the Rust `create_vault` command.
- Created the required `KnowledgeDiscoveryVault` folder structure.
- Created the required metadata files:
  - `domains.md`
  - `ontology.md`
  - `scoring_rules.md`
  - `classification_rules.md`
- Displayed vault state in the desktop shell.

Explicitly deferred:

- SQLite database initialization.
- Database migrations.
- Source import.
- Markdown/text chunking.
- FTS search.
- AI features.
- Claim extraction.
- Evidence linking.
- Re-evaluation queue.
- Graph visualization.

Verification:

- `pnpm run build` passes.
- `cargo tree --manifest-path src-tauri\Cargo.toml -i tauri-plugin-dialog` confirms no `tauri-plugin-dialog` package remains.
- Removed `tauri-plugin-dialog` from npm, pnpm, and Cargo dependencies so its blocked build script is no longer compiled.
- `cargo check --manifest-path src-tauri\Cargo.toml` now gets past the removed dialog dependency, then Windows Application Control blocks a Cargo-generated `erased-serde` build script with OS error `4551`.

## Phase 4 - SQLite App DB Initialization

Status: Implementation complete.

Scope:

- Added `rusqlite` with bundled SQLite for Windows-portable database initialization.
- Initialized the internal app DB at `KnowledgeDiscoveryVault/knowledgediscovery.sqlite`.
- Added schema version `1` bookkeeping tables:
  - `schema_migrations`
  - `app_metadata`
- Seeded app metadata for app name, vault name, and schema version.
- Displayed the app DB path and creation state in the desktop shell.

Explicitly deferred:

- Source import.
- Markdown/text chunking.
- FTS search.
- AI features.
- Claim extraction.
- Evidence linking.
- Re-evaluation queue.
- Graph visualization.

Verification:

- `cargo update --manifest-path src-tauri\Cargo.toml` refreshed `Cargo.lock` with `rusqlite`.
- `pnpm run build` passes.
- `cargo check --manifest-path src-tauri\Cargo.toml` passes.
- `cargo test --manifest-path src-tauri\Cargo.toml` passes.
- `pnpm tauri build --debug` passes and builds `src-tauri\target\debug\knowledge-discovery.exe`.

## Phase 5 - Vault Explorer and File Tree

Status: Implementation complete.

Scope:

- Added the read-only Rust `list_vault_tree` command.
- Displayed the local `KnowledgeDiscoveryVault` folder/file tree in the desktop UI.
- Added a `Refresh Tree` control for re-reading the folder structure.
- Added selected tree item state in the right panel.
- Sorted folders before files, with names sorted alphabetically inside each group.

Explicitly deferred:

- File content reads.
- File import into SQLite.
- Source records.
- Markdown/text chunking.
- FTS search.
- AI features.
- Claim extraction.
- Evidence linking.
- Re-evaluation queue.
- Graph visualization.

Verification:

- `pnpm run build` passes.
- `cargo test --manifest-path src-tauri\Cargo.toml` passes.
- `pnpm tauri build --debug` passes and builds `src-tauri\target\debug\knowledge-discovery.exe`.

## Phase 6 - Markdown And Text Fact Import

Status: Implementation complete.

Scope:

- Added the Rust `import_fact_file` command.
- Limited imports to `.md` and `.txt`.
- Copied imported files into the Facts area:
  - `.md` files go to `01_Facts/markdown`.
  - `.txt` files go to `01_Facts/text`.
- Added SQLite schema version `2`.
- Added `sources` and `chunks` tables.
- Read imported UTF-8 file content and split it into chunks.
- Stored one `sources` row and one `chunks` row per chunk.
- Displayed imported source name, vault-relative path, and chunk count in the UI.

Explicitly deferred:

- FTS search.
- Semantic search.
- Claim extraction.
- Evidence linking.
- Re-evaluation queue.
- Graph visualization.
- AI workflows.

Verification:

- `cargo test --manifest-path src-tauri\Cargo.toml` passes.
- `pnpm run build` passes.
- `pnpm tauri build --debug` passes and builds `src-tauri\target\debug\knowledge-discovery.exe`.
