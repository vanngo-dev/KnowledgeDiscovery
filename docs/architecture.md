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
