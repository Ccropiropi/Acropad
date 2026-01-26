import '../src/rust/api.dart' as api;

/// Native Bridge for Rust-Flutter communication.
/// 
/// Adapts the generated Rust API to the application's service layer.
class NativeBridge {
  /// Read file contents efficiently from native layer
  static Future<String> readFile(String filePath) async {
    return await api.readFile(path: filePath);
  }

  /// Write file contents from native layer
  static Future<void> writeFile(String filePath, String content) async {
    await api.saveFile(path: filePath, content: content);
  }

  /// Scan directory for files
  static Future<List<String>> scanDirectory(String dirPath) async {
    return await api.scanVault(path: dirPath);
  }

  /// Search files for text pattern
  static Future<List<String>> searchFiles(
    String dirPath,
    String pattern,
  ) async {
    return await api.searchVault(vaultPath: dirPath, query: pattern);
  }
}