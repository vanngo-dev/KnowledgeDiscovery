use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

const VAULT_NAME: &str = "KnowledgeDiscoveryVault";

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
    created: bool,
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

    Ok(VaultCreationResult {
        vault_path: vault_path.to_string_lossy().to_string(),
        created,
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![create_vault])
        .run(tauri::generate_context!())
        .expect("error while running KnowledgeDiscovery");
}
