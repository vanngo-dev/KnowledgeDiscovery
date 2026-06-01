# Architecture

## Phase 1

KnowledgeDiscovery currently uses a minimal Tauri shell around a Vite React application.

- Frontend: React + TypeScript in `src/`.
- Desktop shell: Tauri configuration and Rust entry point in `src-tauri/`.
- Dev server: Vite on `http://localhost:1420`.
- App identifier: `com.knowledgediscovery.app`.

No persistence, SQLite layer, evidence graph, or backend command surface exists in Phase 1.
