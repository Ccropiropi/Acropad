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

    for entry in WalkDir::new(search_path)
        .into_iter()
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
    let search_path = Path::new(&vault_path);
    let query_lower = query.to_lowercase();

    for entry in WalkDir::new(search_path)
        .into_iter()
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
}
