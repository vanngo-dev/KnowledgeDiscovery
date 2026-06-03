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
