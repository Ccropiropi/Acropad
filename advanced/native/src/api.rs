use anyhow::Result;
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

// No 'extern "C"' or pointers needed. 
// flutter_rust_bridge handles the conversion.

pub fn greet() -> String {
    "Hello from Rust! Acropad Native Layer is active.".to_string()
}

/// Scan a directory for markdown and text files
pub fn scan_vault(path: String) -> Result<Vec<String>> {
    let mut files = Vec::new();
    let search_path = Path::new(&path);

    if !search_path.exists() {
        return Ok(files);
    }

    // Filter hidden directories but not the root directory itself
    let is_hidden_entry = |e: &walkdir::DirEntry| {
        let p = e.path();
        if p == search_path {
            return false; // Don't filter root
        }
        p.file_name()
            .and_then(|n| n.to_str())
            .map(|s| s.starts_with('.'))
            .unwrap_or(false)
    };

    for entry in WalkDir::new(search_path)
        .into_iter()
        .filter_entry(|e| !is_hidden_entry(e))
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_file())
    {
        let file_path = entry.path();
        if let Some(ext) = file_path.extension() {
            let ext_str = ext.to_string_lossy().to_lowercase();
            if ext_str == "md" || ext_str == "txt" {
                if let Ok(relative) = file_path.strip_prefix(search_path) {
                    files.push(relative.to_string_lossy().to_string());
                }
            }
        }
    }
    
    // Sort for consistent UI
    files.sort();
    Ok(files)
}

/// Read file content efficiently
pub fn read_file(path: String) -> Result<String> {
    let content = fs::read_to_string(path)?;
    Ok(content)
}

/// Save file content
pub fn save_file(path: String, content: String) -> Result<()> {
    fs::write(path, content)?;
    Ok(())
}

/// Search for text in files
pub fn search_vault(vault_path: String, query: String) -> Result<Vec<String>> {
    let mut results = Vec::new();
    
    // Early return for empty query
    if query.trim().is_empty() {
        return Ok(results);
    }

    let search_path = Path::new(&vault_path);
    let query_lower = query.to_lowercase();

    // Filter hidden directories but not the root directory itself
    let is_hidden_entry = |e: &walkdir::DirEntry| {
        let p = e.path();
        if p == search_path {
            return false; // Don't filter root
        }
        p.file_name()
            .and_then(|n| n.to_str())
            .map(|s| s.starts_with('.'))
            .unwrap_or(false)
    };

    for entry in WalkDir::new(search_path)
        .into_iter()
        .filter_entry(|e| !is_hidden_entry(e))
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_file())
    {
        let path = entry.path();
        // Check extension
        if let Some(ext) = path.extension() {
            let ext_str = ext.to_string_lossy().to_lowercase();
            if ext_str == "md" || ext_str == "txt" {
                // Read and check content
                if let Ok(content) = fs::read_to_string(path) {
                    if content.to_lowercase().contains(&query_lower) {
                        if let Ok(relative) = path.strip_prefix(search_path) {
                            results.push(relative.to_string_lossy().to_string());
                        }
                    }
                }
            }
        }
    }
    
    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn test_greet() {
        assert!(greet().contains("Hello from Rust"));
    }

    #[test]
    fn test_file_ops() -> Result<()> {
        let dir = tempdir()?;
        let file_path = dir.path().join("test.md");
        let path_str = file_path.to_string_lossy().to_string();
        let content = "# Test Content";

        // Save
        save_file(path_str.clone(), content.to_string())?;
        
        // Read
        let read = read_file(path_str)?;
        assert_eq!(read, content);

        // Scan
        let files = scan_vault(dir.path().to_string_lossy().to_string())?;
        assert_eq!(files.len(), 1);
        assert_eq!(files[0], "test.md");

        Ok(())
    }

    #[test]
    fn test_scan_vault_skips_hidden_dirs() -> Result<()> {
        let dir = tempdir()?;
        let vault_path = dir.path().to_string_lossy().to_string();

        // Create a visible file
        fs::write(dir.path().join("visible.md"), "content")?;
        
        // Create hidden directory with file
        let hidden_dir = dir.path().join(".git");
        fs::create_dir(&hidden_dir)?;
        fs::write(hidden_dir.join("config"), "git config")?;
        
        // Create .obsidian hidden directory with file
        let obsidian_dir = dir.path().join(".obsidian");
        fs::create_dir(&obsidian_dir)?;
        fs::write(obsidian_dir.join("workspace.json"), "{}")?;

        // Create nested hidden directory
        let nested_hidden = dir.path().join("folder").join(".hidden");
        fs::create_dir_all(&nested_hidden)?;
        fs::write(nested_hidden.join("secret.txt"), "secret")?;

        // Create visible nested file
        let visible_nested = dir.path().join("folder").join("visible.md");
        fs::create_dir_all(visible_nested.parent().unwrap())?;
        fs::write(&visible_nested, "visible")?;

        let files = scan_vault(vault_path)?;
        
        // Should only find visible files, not hidden ones
        assert_eq!(files.len(), 2);
        assert!(files.contains(&"visible.md".to_string()));
        assert!(files.contains(&"folder/visible.md".to_string()));
        assert!(!files.iter().any(|f| f.contains(".git")));
        assert!(!files.iter().any(|f| f.contains(".obsidian")));
        assert!(!files.iter().any(|f| f.contains(".hidden")));

        Ok(())
    }

    #[test]
    fn test_search_vault_empty_query_returns_empty() -> Result<()> {
        let dir = tempdir()?;
        let vault_path = dir.path().to_string_lossy().to_string();
        
        fs::write(dir.path().join("test.md"), "content")?;

        // Empty string query
        let results = search_vault(vault_path.clone(), "".to_string())?;
        assert_eq!(results.len(), 0);

        // Whitespace-only query
        let results = search_vault(vault_path.clone(), "   ".to_string())?;
        assert_eq!(results.len(), 0);

        // Tab/newline query
        let results = search_vault(vault_path, "\t\n".to_string())?;
        assert_eq!(results.len(), 0);

        Ok(())
    }

    #[test]
    fn test_search_vault_skips_hidden_dirs() -> Result<()> {
        let dir = tempdir()?;
        let vault_path = dir.path().to_string_lossy().to_string();

        // Create visible file with searchable content
        fs::write(dir.path().join("visible.md"), "searchable content")?;
        
        // Create hidden directory with file containing searchable content
        let hidden_dir = dir.path().join(".git");
        fs::create_dir(&hidden_dir)?;
        fs::write(hidden_dir.join("config"), "searchable content")?;

        let results = search_vault(vault_path, "searchable".to_string())?;
        
        // Should only find visible file, not hidden ones
        assert_eq!(results.len(), 1);
        assert_eq!(results[0], "visible.md");

        Ok(())
    }
}
