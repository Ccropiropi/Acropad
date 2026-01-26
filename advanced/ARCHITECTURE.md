# Acropad Advanced - Complete Architecture Documentation

## Executive Summary

**Acropad Advanced** is a production-grade, cross-platform note-taking application combining:
- **Dart + Flutter** for pixel-perfect UI across Windows, Linux, macOS
- **Rust** backend for high-performance file I/O, indexing, and search
- **BLoC Pattern** for predictable, testable state management
- **FFI Bridge** for native interoperability

This document serves as the architectural blueprint for developers and architects.

---

## 1. System Architecture Overview

### 1.1 Layered Architecture

```
┌─────────────────────────────────────────────────┐
│         PRESENTATION LAYER (Flutter)            │
│  - Widgets: MainScreen, Sidebar, EditorPane     │
│  - Responsive Layout with animations            │
│  - Theme: VS Code/Obsidian dark mode            │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────↓────────────────────────────┐
│       STATE MANAGEMENT LAYER (BLoC)             │
│  - EditorBloc: File operations                  │
│  - VaultBloc: Vault management                  │
│  - Event-driven architecture                    │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────↓────────────────────────────┐
│       SERVICE LAYER (Native Bridge)             │
│  - FFI to Rust                                  │
│  - Async operations                            │
│  - Memory management                           │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────↓────────────────────────────┐
│       NATIVE LAYER (Rust)                       │
│  - FileHandler: I/O operations                  │
│  - VaultIndexer: Directory scanning             │
│  - TextSearcher: Pattern matching               │
│  - Zero-copy operations                        │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────↓────────────────────────────┐
│       FILE SYSTEM (OS Level)                    │
│  - Disk I/O                                    │
│  - Directory traversal                         │
│  - File metadata                               │
└─────────────────────────────────────────────────┘
```

### 1.2 Component Interaction Diagram

```
User Input (UI)
    ↓
Widget → Event
    ↓
BLoC processes Event → emits State
    ↓
NativeBridge called (if I/O needed)
    ↓
FFI → Rust (async on separate thread)
    ↓
FileSystem operations
    ↓
Result returned to BLoC
    ↓
BLoC emits new State
    ↓
UI rebuilds via State listener
    ↓
User sees result
```

---

## 2. Frontend Architecture (Flutter/Dart)

### 2.1 Project Structure

```
lib/
├── main.dart
│   └── AcropadApp (root widget, theme setup)
│
├── bloc/
│   ├── editor_bloc.dart
│   │   └── Manages: current file, modifications, saving
│   ├── editor_event.dart
│   │   └── Events: OpenFile, UpdateContent, Save, Close
│   ├── editor_state.dart
│   │   └── State: currentFile, isLoading, isSaving, error
│   ├── vault_bloc.dart
│   │   └── Manages: vault selection, file list
│   ├── vault_event.dart
│   │   └── Events: OpenVault, CloseVault, RefreshVault
│   └── vault_state.dart
│       └── State: currentVault, isLoading, fileCount
│
├── models/
│   ├── file_model.dart
│   │   └── FileModel: id, name, path, content, isModified
│   └── vault_model.dart
│       └── VaultModel: name, path, fileList, fileCount
│
├── ui/
│   ├── screens/
│   │   └── main_screen.dart
│   │       ├── Scaffold with sidebar + editor
│   │       ├── Top toolbar
│   │       └── Status indicators
│   │
│   └── widgets/
│       ├── sidebar.dart
│       │   ├── Vault selector
│       │   ├── File browser
│       │   ├── Search box
│       │   └── File tree
│       │
│       └── editor_pane.dart
│           ├── Tabbed interface
│           ├── Text editor
│           ├── Syntax highlighting (future)
│           └── Auto-save indicator
│
└── services/
    └── native_bridge.dart
        ├── readFile()
        ├── writeFile()
        ├── scanDirectory()
        └── searchFiles()
```

### 2.2 BLoC Pattern Implementation

#### EditorBloc (Example)

```
EVENT FLOW:
  OpenFileEvent(path)
      ↓
  EditorBloc._onOpenFile()
      ↓
  NativeBridge.readFile(path) [async]
      ↓
  EditorState(currentFile, isLoading=false)
      ↓
  EditorPane rebuilds with content

MODIFICATION FLOW:
  User types text
      ↓
  UpdateFileContentEvent(newText)
      ↓
  EditorBloc._onUpdateFileContent()
      ↓
  EditorState(isModified=true)
      ↓
  UI shows "Modified" indicator
      ↓
  After 5 seconds: SaveFileEvent()
      ↓
  NativeBridge.writeFile(path, content) [async]
      ↓
  EditorState(isModified=false, isSaving=false)
      ↓
  UI shows "Saved" ✓
```

### 2.3 State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│  Widget Layer (MainScreen, Sidebar, EditorPane)        │
│  - Listens to BLoC states                              │
│  - Triggers events via context.read<Bloc>().add()     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  BLoC Layer (EditorBloc, VaultBloc)                    │
│  - Receives events (OpenFile, UpdateContent, Save)    │
│  - Calls services (NativeBridge)                      │
│  - Emits states (with new data)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  Service Layer (NativeBridge)                          │
│  - Abstracts FFI calls                                │
│  - Error handling                                     │
│  - Type conversion                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
             [Rust Backend]
```

---

## 3. Backend Architecture (Rust)

### 3.1 Native Layer Structure

```
native/
├── Cargo.toml
│   └── Dependencies: tokio, walkdir, regex, serde
│
├── src/
│   ├── lib.rs
│   │   ├── acropad_init()
│   │   ├── scan_directory()
│   │   ├── search_files()
│   │   └── FFI entry points
│   │
│   └── file_handler.rs
│       ├── FileHandler struct
│       ├── read_file() [buffered I/O]
│       ├── write_file() [buffered I/O]
│       ├── get_file_metadata()
│       ├── read_file_efficient() [FFI]
│       ├── write_file_efficient() [FFI]
│       └── free_string() [memory management]
```

### 3.2 Key Rust Modules

#### **file_handler.rs**

Handles all file I/O operations:

```rust
pub struct FileHandler;

impl FileHandler {
    // Read file with BufReader (efficient for large files)
    pub fn read_file(file_path: &str) -> Result<String>
    
    // Write file with BufWriter (batched writes)
    pub fn write_file(file_path: &str, contents: &str) -> Result<()>
    
    // Get file metadata
    pub fn get_file_metadata(file_path: &str) -> Result<FileMetadata>
}

// FFI entry points (C calling convention)
#[no_mangle]
pub extern "C" fn read_file_efficient(...) -> *mut u8

#[no_mangle]
pub extern "C" fn write_file_efficient(...) -> i32
```

**Key Features:**
- ✓ Buffered I/O (BufReader/BufWriter)
- ✓ Proper error handling (Result<T>)
- ✓ UTF-8 encoding support
- ✓ Memory safety (Rust guarantees)

#### **lib.rs**

Main library with FFI exports:

```rust
// Directory scanning (returns JSON)
#[no_mangle]
pub extern "C" fn scan_directory(path, len) -> *mut u8

// File search (parallelized with Rayon)
#[no_mangle]
pub extern "C" fn search_files(dir_path, pattern) -> *mut u8

// Initialize native layer
#[no_mangle]
pub extern "C" fn acropad_init()
```

### 3.3 Performance Optimizations

| Optimization | Implementation | Benefit |
|---|---|---|
| **Buffered I/O** | BufReader (64KB buffer) | 10-50x faster for large files |
| **Parallel Scanning** | Rayon (multi-threaded) | Linear scaling with cores |
| **Regex Compilation** | Cache regex patterns | Avoid recompilation per search |
| **Memory Efficiency** | Zero-copy where possible | Lower memory footprint |
| **Async Operations** | Tokio runtime | Non-blocking file ops |

---

## 4. Communication Protocol (Dart ↔ Rust)

### 4.1 FFI Bridge

```
Dart Layer          Native Bridge              Rust Layer
─────────           ──────────────              ──────────

String filePath
    │               
    ├─→ .toUtf8()  (convert to bytes)
    │                   │
    │                   ├─→ C-compatible pointer
    │                   │
    │                   └─→ read_file_efficient()
    │
    │               ←─── bytes pointer
    │
    ├─ Dart converts to String
    │
    └─→ UpdateFileContentEvent()
```

### 4.2 Data Serialization

**Dart to Rust:**
```
Dart String → UTF-8 bytes → C pointer → Rust &str
```

**Rust to Dart:**
```
Rust Vec<u8> → malloc() → C pointer → Dart String.fromUtf8()
```

### 4.3 Error Handling

```
Dart tries to call Rust function
    ↓
If Success: Return data pointer
    ↓
If Error: Return null pointer
    ↓
Dart checks for null and handles gracefully
    ↓
BLoC emits error state
    ↓
UI displays error to user
```

---

## 5. Data Flow Examples

### Example 1: Opening a File

```
User clicks "notes.md" in sidebar
    ↓ (UI event)
MainScreen → Sidebar.onTap
    ↓
context.read<EditorBloc>().add(
  OpenFileEvent(
    filePath: '/vault/notes.md',
    fileName: 'notes.md',
    fileExtension: 'md'
  )
)
    ↓ (Event to BLoC)
EditorBloc._onOpenFile()
    ↓
emit(state.copyWith(isLoading: true))
    ↓
NativeBridge.readFile('/vault/notes.md')
    ↓ (FFI call)
Rust: read_file_efficient()
    ↓
FileHandler::read_file()
    ↓
File::open() → BufReader → read_to_string()
    ↓ (I/O from disk)
Return String back through FFI
    ↓ (Back to Dart)
EditorBloc receives content string
    ↓
emit(EditorState(
  currentFile: FileModel(..., content: string),
  isLoading: false
))
    ↓ (New state)
EditorPane listens to state change
    ↓
BlocBuilder rebuilds with new content
    ↓
TextField updated with file content
    ↓
User sees file content in editor ✓
```

### Example 2: Searching Files

```
User types "TODO" in search box
    ↓
SearchEvent triggered (debounced)
    ↓
VaultBloc receives event
    ↓
NativeBridge.searchFiles(vaultPath, "TODO")
    ↓ (FFI call)
Rust: search_files(dir_path, pattern)
    ↓
scan_vault_directory() → file list
    ↓
For each .md/.txt file:
  ├─ read_file()
  ├─ if content.contains("TODO"):
  │   └─ add to results
  └─ (parallelized with Rayon)
    ↓ (Multi-threaded scan)
Serialize results to JSON
    ↓
Return JSON bytes through FFI
    ↓ (Back to Dart)
VaultBloc parses JSON → List<String>
    ↓
emit(VaultState(searchResults: [...]))
    ↓
Sidebar rebuilds showing search results
    ↓
User sees filtered file list ✓
```

---

## 6. Scaling & Performance Considerations

### 6.1 Expected Performance

| Operation | File Size | Time | Notes |
|---|---|---|---|
| **Read** | 1 MB | ~1ms | Buffered I/O |
| **Write** | 1 MB | ~2ms | Buffered I/O |
| **Scan** | 10k files | ~50ms | Parallelized |
| **Search** | 10k files, 1MB avg | ~200ms | Full-text search |

### 6.2 Memory Usage

```
Idle State:        ~50 MB (Dart VM + Rust runtime)
One File Open:     +file_size MB (in-memory)
Search Index:      ~5% of total file size
Vault with 100k files: ~100 MB index
```

### 6.3 Scaling Strategies

1. **Large Vaults (>100k files)**
   - Implement lazy loading
   - Cache frequently accessed files
   - Use incremental search

2. **Large Files (>100MB)**
   - Stream file operations
   - Chunk-based processing
   - Memory-mapped I/O

3. **Many Concurrent Operations**
   - Tokio task pool in Rust
   - Limiting concurrent FFI calls
   - Queue-based processing

---

## 7. Extension Points (Plugin Architecture)

### 7.1 Plugin Model

```
Plugins/
├── markdown-preview/
│   ├── plugin.dart      (Dart interface)
│   ├── native/          (optional Rust)
│   └── manifest.yaml
│
├── syntax-highlighter/
├── file-explorer/
└── search-enhanced/
```

### 7.2 Plugin Interface (Future)

```dart
abstract class AcropadPlugin {
  String get id;
  String get version;
  
  Future<void> initialize();
  void dispose();
  
  // Optional Rust backend
  String? get nativeLibraryPath;
}
```

---

## 8. Security Considerations

### 8.1 File Access

✓ **Sandboxed** - Only access files within vault directory
✓ **Permission Checks** - Verify read/write permissions
✓ **Path Validation** - Prevent directory traversal attacks

### 8.2 Data Privacy

✓ **No External Communication** - Offline-first design
✓ **Local Storage Only** - All files on user's machine
✓ **Encryption Ready** - Architecture supports encryption layer

### 8.3 Code Safety

✓ **Memory Safe** - Rust prevents buffer overflows
✓ **Type Safe** - Strong typing in both Dart and Rust
✓ **Error Handling** - Comprehensive error propagation

---

## 9. Testing Strategy

### 9.1 Unit Tests

**Dart:**
```dart
test('EditorBloc opens file correctly', () async {
  final bloc = EditorBloc();
  final file = FileModel(...);
  
  bloc.add(OpenFileEvent(...));
  
  await expectLater(
    bloc.stream,
    emits(EditorState(currentFile: file))
  );
});
```

**Rust:**
```rust
#[test]
fn test_read_file() {
    let content = FileHandler::read_file("test.txt");
    assert!(content.is_ok());
}
```

### 9.2 Integration Tests

```dart
testWidgets('File opens and displays content', (tester) async {
  await tester.pumpWidget(const AcropadApp());
  
  // Verify UI elements present
  expect(find.byType(Sidebar), findsOneWidget);
  expect(find.byType(EditorPane), findsOneWidget);
});
```

### 9.3 Performance Tests

```rust
#[bench]
fn bench_read_file(b: &mut Bencher) {
    b.iter(|| FileHandler::read_file("1mb_file.txt"))
}
```

---

## 10. Deployment & Distribution

### 10.1 Build Commands

```bash
# Windows
flutter build windows --release

# macOS
flutter build macos --release

# Linux
flutter build linux --release

# Universal builds
flutter pub global activate flutter_distributor
flutter_distributor package --platform windows --targets exe
```

### 10.2 Distribution Formats

| Platform | Format | Size |
|---|---|---|
| Windows | .exe, .msi | ~150 MB |
| macOS | .dmg, .app | ~180 MB |
| Linux | .deb, .AppImage | ~140 MB |

### 10.3 Auto-Update

```dart
// Check for updates
final latestVersion = await checkForUpdates();
if (latestVersion > currentVersion) {
  showUpdateDialog();
}
```

---

## 11. Roadmap

### Phase 1 (Current)
- ✅ Basic file operations
- ✅ Vault management
- ✅ Cross-platform UI

### Phase 2
- ⏳ Syntax highlighting
- ⏳ Markdown preview
- ⏳ Search & replace

### Phase 3
- 🔲 Plugin system
- 🔲 Sync/backup
- 🔲 Collaboration (future)

---

## 12. Troubleshooting Guide

### Issue: "FFI library not found"
**Solution:**
```bash
cd native && cargo build --release && cd ..
flutter clean && flutter pub get
```

### Issue: "UI lag when opening large files"
**Solution:**
```
Ensure native layer is being used (debug output)
Check Rust optimization (release build)
Verify buffered I/O is working
```

### Issue: "Memory leak in FFI"
**Solution:**
```rust
// Always call free_string() after reading
free_string(ptr, len);
```

---

**Architecture designed for scale, performance, and maintainability** 🚀
