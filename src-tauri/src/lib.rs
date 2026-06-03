use rusqlite::{params, Connection};
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

const VAULT_NAME: &str = "KnowledgeDiscoveryVault";
const APP_DATABASE_NAME: &str = "knowledgediscovery.sqlite";
const APP_DATABASE_SCHEMA_VERSION: i64 = 1;

const VAULT_DIRECTORIES: &[&str] = &[
    "00_Inbox",
    "01_Facts",
    "01_Facts/markdown",
    "01_Facts/text",
    "01_Facts/csv",
    "01_Facts/sqlite_sources",
    "01_Facts/imported_sources",
    "02_Observations_Hypotheses",
    "02_Observations_Hypotheses/observations",
    "02_Observations_Hypotheses/hypotheses",
    "02_Observations_Hypotheses/thoughts",
    "02_Observations_Hypotheses/questions",
    "03_Analysis_Intelligence",
    "03_Analysis_Intelligence/summaries",
    "03_Analysis_Intelligence/contradictions",
    "03_Analysis_Intelligence/patterns",
    "03_Analysis_Intelligence/changed_conclusions",
    "03_Analysis_Intelligence/emergence_reports",
    "03_Analysis_Intelligence/research_recommendations",
    "04_Metadata",
];

const METADATA_FILES: &[(&str, &str)] = &[
    (
        "04_Metadata/domains.md",
        "# Domains\n\nDefine knowledge domains for this vault in a later phase.\n",
    ),
    (
        "04_Metadata/ontology.md",
        "# Ontology\n\nDefine entity and relationship vocabulary for this vault in a later phase.\n",
    ),
    (
        "04_Metadata/scoring_rules.md",
        "# Scoring Rules\n\nDefine evidence scoring rules for this vault in a later phase.\n",
    ),
    (
        "04_Metadata/classification_rules.md",
        "# Classification Rules\n\nDefine classification rules for this vault in a later phase.\n",
    ),
];

#[derive(Serialize)]
struct VaultCreationResult {
    vault_path: String,
    database_path: String,
    created: bool,
    database_created: bool,
    directories_created: usize,
    files_created: usize,
}

#[tauri::command]
fn create_vault(base_path: String) -> Result<VaultCreationResult, String> {
    let trimmed_path = base_path.trim();

    if trimmed_path.is_empty() {
        return Err("Choose a location before creating the vault.".to_string());
    }

    let base_path = PathBuf::from(trimmed_path);

    if !base_path.exists() {
        return Err("The selected location does not exist.".to_string());
    }

    if !base_path.is_dir() {
        return Err("The selected location must be a folder.".to_string());
    }

    let vault_path = base_path.join(VAULT_NAME);
    let created = !vault_path.exists();

    if vault_path.exists() && !vault_path.is_dir() {
        return Err("A file named KnowledgeDiscoveryVault already exists there.".to_string());
    }

    let mut directories_created = 0;
    let mut files_created = 0;

    if create_dir_if_missing(&vault_path)? {
        directories_created += 1;
    }

    for directory in VAULT_DIRECTORIES {
        if create_dir_if_missing(&vault_path.join(directory))? {
            directories_created += 1;
        }
    }

    for (file_path, contents) in METADATA_FILES {
        let full_path = vault_path.join(file_path);

        if !full_path.exists() {
            fs::write(&full_path, contents)
                .map_err(|error| format!("Failed to create {}: {error}", file_path))?;
            files_created += 1;
        }
    }

    let database_path = vault_path.join(APP_DATABASE_NAME);
    let database_created = !database_path.exists();
    initialize_app_database(&database_path)?;

    Ok(VaultCreationResult {
        vault_path: vault_path.to_string_lossy().to_string(),
        database_path: database_path.to_string_lossy().to_string(),
        created,
        database_created,
        directories_created,
        files_created,
    })
}

fn create_dir_if_missing(path: &Path) -> Result<bool, String> {
    if path.exists() {
        if path.is_dir() {
            return Ok(false);
        }

        return Err(format!(
            "Cannot create folder because a file already exists at {}.",
            path.to_string_lossy()
        ));
    }

    fs::create_dir_all(path)
        .map_err(|error| format!("Failed to create {}: {error}", path.to_string_lossy()))?;

    Ok(true)
}

fn initialize_app_database(database_path: &Path) -> Result<(), String> {
    let connection = Connection::open(database_path).map_err(|error| {
        format!(
            "Failed to open SQLite app database at {}: {error}",
            database_path.to_string_lossy()
        )
    })?;

    connection
        .execute_batch(
            "
            PRAGMA foreign_keys = ON;
            PRAGMA user_version = 1;

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
            ",
        )
        .map_err(|error| format!("Failed to initialize SQLite app schema: {error}"))?;

    connection
        .execute(
            "
            INSERT OR IGNORE INTO schema_migrations (version, name)
            VALUES (?1, ?2);
            ",
            params![APP_DATABASE_SCHEMA_VERSION, "phase_4_app_database"],
        )
        .map_err(|error| format!("Failed to record SQLite schema migration: {error}"))?;

    let metadata = [
        ("app_name", "KnowledgeDiscovery"),
        ("vault_name", VAULT_NAME),
        ("schema_version", "1"),
    ];

    for (key, value) in metadata {
        connection
            .execute(
                "
                INSERT INTO app_metadata (key, value, updated_at)
                VALUES (?1, ?2, CURRENT_TIMESTAMP)
                ON CONFLICT(key) DO UPDATE SET
                    value = excluded.value,
                    updated_at = CURRENT_TIMESTAMP;
                ",
                params![key, value],
            )
            .map_err(|error| format!("Failed to write SQLite app metadata: {error}"))?;
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![create_vault])
        .run(tauri::generate_context!())
        .expect("error while running KnowledgeDiscovery");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn initializes_phase_4_app_database() {
        let database_path = test_database_path();

        if let Some(parent) = database_path.parent() {
            fs::create_dir_all(parent).expect("create test database directory");
        }

        initialize_app_database(&database_path).expect("initialize app database");

        let connection = Connection::open(&database_path).expect("open initialized database");
        let user_version: i64 = connection
            .query_row("PRAGMA user_version;", [], |row| row.get(0))
            .expect("read user_version");
        let app_name: String = connection
            .query_row(
                "SELECT value FROM app_metadata WHERE key = 'app_name';",
                [],
                |row| row.get(0),
            )
            .expect("read app_name metadata");
        let migration_count: i64 = connection
            .query_row(
                "SELECT COUNT(*) FROM schema_migrations WHERE version = 1;",
                [],
                |row| row.get(0),
            )
            .expect("read schema migration count");

        assert_eq!(user_version, APP_DATABASE_SCHEMA_VERSION);
        assert_eq!(app_name, "KnowledgeDiscovery");
        assert_eq!(migration_count, 1);

        drop(connection);
        fs::remove_file(&database_path).expect("remove test database");
    }

    fn test_database_path() -> PathBuf {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock before unix epoch")
            .as_nanos();

        let base_path = std::env::var_os("CARGO_TARGET_TMPDIR")
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from("target").join("test-databases"));

        base_path.join(format!("knowledgediscovery-test-{timestamp}.sqlite"))
    }
}
