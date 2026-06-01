# Data Model

No application data model is implemented in Phase 1.

Reserved future names:

- Vault: `KnowledgeDiscoveryVault`
- SQLite database: `knowledgediscovery.sqlite`

## Phase 3 Vault Structure

Phase 3 creates the local vault folder structure only. No database schema exists yet.

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
