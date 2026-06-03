# Data Model

Reserved future names:

- Vault: `KnowledgeDiscoveryVault`
- SQLite database: `knowledgediscovery.sqlite`

## Phase 3 Vault Structure

Phase 3 creates the local vault folder structure only.

```text
KnowledgeDiscoveryVault/
├── 00_Inbox/
├── 01_Facts/
│   ├── markdown/
│   ├── text/
│   ├── csv/
│   ├── sqlite_sources/
│   └── imported_sources/
├── 02_Observations_Hypotheses/
│   ├── observations/
│   ├── hypotheses/
│   ├── thoughts/
│   └── questions/
├── 03_Analysis_Intelligence/
│   ├── summaries/
│   ├── contradictions/
│   ├── patterns/
│   ├── changed_conclusions/
│   ├── emergence_reports/
│   └── research_recommendations/
└── 04_Metadata/
    ├── domains.md
    ├── ontology.md
    ├── scoring_rules.md
    └── classification_rules.md
```

## Phase 4 App Database

Phase 4 creates the internal SQLite app database:

```text
KnowledgeDiscoveryVault/
└── knowledgediscovery.sqlite
```

Schema version `1` contains only app-level bookkeeping:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Initial metadata keys:

- `app_name`
- `vault_name`
- `schema_version`

Evidence storage, source ingestion, chunking, FTS search, claims, evidence links, AI workflows, and graph data remain deferred.

## Phase 5 Vault Tree

Phase 5 adds an in-memory, read-only view model for displaying the vault tree in the UI. It is not persisted in SQLite.

```text
VaultTreeEntry
├── name
├── path
├── relative_path
├── entry_type
└── children
```

`entry_type` is either `directory` or `file`.

The tree is generated from folder/file listing only. File contents are not read, and no database records are created.

## Phase 6 Sources And Chunks

Phase 6 upgrades the app database to schema version `2` and adds imported source storage for `.md` and `.txt` files.

```sql
CREATE TABLE IF NOT EXISTS sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_path TEXT NOT NULL,
    vault_path TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    extension TEXT NOT NULL,
    byte_length INTEGER NOT NULL,
    imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    char_start INTEGER NOT NULL,
    char_end INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
    UNIQUE (source_id, chunk_index)
);
```

Imported files are copied into:

- `.md`: `01_Facts/markdown`
- `.txt`: `01_Facts/text`

FTS search, semantic search, claims, evidence links, AI workflows, and graph data remain deferred.
