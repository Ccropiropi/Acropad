# Acropad Advanced - Architecture & Setup Guide

**A High-Performance Obsidian Clone Built with Flutter + Rust**

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Build Environment](#build-environment)
6. [How It Works](#how-it-works)
7. [Development Workflow](#development-workflow)

---

## Project Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────┐
│         Flutter UI Layer (Dart)              │
│  ┌────────────────────────────────────────┐ │
│  │  UI Components (Sidebar, Editor, Tabs) │ │
│  └────────────────────────────────────────┘ │
│               ↓                              │
│  ┌────────────────────────────────────────┐ │
│  │  BLoC State Management                 │ │
│  │  (EditorBloc, VaultBloc)               │ │
│  └────────────────────────────────────────┘ │
│               ↓                              │
│  ┌────────────────────────────────────────┐ │
│  │  Native Bridge (FFI / flutter_ffi)     │ │
│  └────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────↓──────────┐
        │  Native Layer (Rust)  │
        │                      │
        │ ┌─────────────────┐ │
        │ │ FileHandler     │ │
        │ │ - Read File     │ │
        │ │ - Write File    │ │
        │ │ - Get Metadata  │ │
        │ └─────────────────┘ │
        │                      │
        │ ┌─────────────────┐ │
        │ │ VaultIndexer    │ │
        │ │ - Scan Dir      │ │
        │ │ - Search Files  │ │
        │ │ - Index Docs    │ │
        │ └─────────────────┘ │
        │                      │
        └──────────┬───────────┘
                   │
        ┌──────────↓──────────┐
        │   File System        │
        │   (OS Level I/O)     │
        └─────────────────────┘
```

### Key Design Principles

1. **Separation of Concerns**
   - UI Layer: Pure Flutter widgets
   - State Management: BLoC pattern
   - Business Logic: Rust backend
   - Native Bridge: FFI for communication

2. **Non-Blocking I/O**
   - File operations run on native threads
   - UI stays responsive always
   - Async/await in Dart, async/await in Rust

3. **Performance**
   - Buffered I/O for large files
   - Parallel directory scanning with Rayon
   - Efficient string searching with Regex

4. **Cross-Platform**
   - Same Dart code on Windows, Linux, macOS
   - Native layer compiled separately per platform
   - Abstracted FFI bridge

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI** | Flutter (Dart) | Cross-platform UI framework |
| **State** | BLoC 8.1+ | Predictable state management |
| **Native Bridge** | flutter_rust_bridge OR FFI | Dart ↔ Rust communication |
| **Backend** | Rust 2021 | High-performance file operations |
| **Async** | Tokio | Rust async runtime |
| **Parsing** | Walkdir, Regex | File scanning & searching |

---

## Project Structure

```
Acropad/
├── advanced/                          # Flutter + Rust version
│
├── flutter/                           # Flutter app
│   ├── lib/
│   │   ├── main.dart                 # Entry point
│   │   │
│   │   ├── bloc/
│   │   │   ├── editor_bloc.dart      # Editor state
│   │   │   ├── editor_event.dart
│   │   │   ├── editor_state.dart
│   │   │   ├── vault_bloc.dart       # Vault state
│   │   │   ├── vault_event.dart
│   │   │   └── vault_state.dart
│   │   │
│   │   ├── models/
│   │   │   ├── file_model.dart       # File data model
│   │   │   └── vault_model.dart      # Vault data model
│   │   │
│   │   ├── ui/
│   │   │   ├── screens/
│   │   │   │   └── main_screen.dart  # Main UI
│   │   │   └── widgets/
│   │   │       ├── sidebar.dart      # File browser
│   │   │       └── editor_pane.dart  # Text editor
│   │   │
│   │   └── services/
│   │       └── native_bridge.dart    # Rust FFI bindings
│   │
│   ├── pubspec.yaml                 # Dependencies
│   ├── windows/                      # Windows build config
│   ├── macos/                        # macOS build config
│   └── linux/                        # Linux build config
│
└── native/                           # Rust backend
    ├── Cargo.toml                    # Rust dependencies
    ├── src/
    │   ├── lib.rs                    # Main library (FFI exports)
    │   └── file_handler.rs           # File I/O module
    │
    ├── target/                       # Build output (auto-generated)
    └── build.rs                      # Build configuration (optional)
```

---

## Setup Instructions

### Prerequisites

**For Windows, Linux, and macOS:**

- **Flutter SDK** (3.13+) - [Download](https://flutter.dev/docs/get-started/install)
- **Rust** (1.70+) - [Install](https://rustup.rs)
- **Cargo** (comes with Rust)
- **VS Code** with extensions:
  - Flutter
  - Rust-analyzer
  - CodeLLDB (for debugging)

### Step 1: Install Flutter

```bash
# Download and unzip Flutter
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_v3.13.0-stable.tar.xz
tar xf flutter_linux_v3.13.0-stable.tar.xz

# Add Flutter to PATH
export PATH="$PATH:$PWD/flutter/bin"

# Verify installation
flutter doctor
```

### Step 2: Install Rust

```bash
# Install Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Source the Rust environment
source "$HOME/.cargo/env"

# Verify installation
rustc --version
cargo --version
```

### Step 3: Clone/Navigate to Acropad

```bash
cd /path/to/Acropad/advanced
```

### Step 4: Install Flutter Dependencies

```bash
flutter pub get
```

### Step 5: Build Native Rust Library

```bash
cd native
cargo build --release
cd ..
```

### Step 6: Run the App

#### **Linux**
```bash
flutter run -d linux
```

#### **macOS**
```bash
flutter run -d macos
```

#### **Windows**
```bash
flutter run -d windows
```

---

## Build Environment

### Linux Setup (Ubuntu/Debian)

```bash
# Install build essentials
sudo apt-get update
sudo apt-get install -y build-essential libssl-dev pkg-config

# Install Flutter dependencies
sudo apt-get install -y libgtk-3-dev libx11-dev libxext-dev libxrender-dev

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Test setup
rustc --version
flutter doctor
```

### macOS Setup

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install Flutter
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PWD/flutter/bin:$PATH"

# Test setup
rustc --version
flutter doctor
```

### Windows Setup

1. **Install Rust**
   - Download from https://rustup.rs
   - Run the installer and follow defaults

2. **Install Visual Studio Build Tools**
   - Download from https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Install "Desktop development with C++"

3. **Install Flutter**
   - Download from https://flutter.dev/docs/get-started/install/windows
   - Extract and add to PATH

4. **Verify in PowerShell**
   ```powershell
   rustc --version
   flutter doctor
   ```

---

## How It Works

### Communication Flow

#### **Reading a File (Non-Blocking)**

```
User clicks file in sidebar
    ↓
Flutter: OpenFileEvent triggered
    ↓
EditorBloc receives event
    ↓
Dart calls NativeBridge.readFile(path)
    ↓
FFI calls Rust: read_file_efficient()
    ↓
Rust: FileHandler::read_file() with BufReader
    ↓
Returns file contents to Dart
    ↓
UpdateFileContentEvent updates state
    ↓
UI rebuilds with file content
```

### BLoC Architecture

**EditorBloc** manages:
- Current open file
- File modifications
- Save state
- Unsaved changes warning

**VaultBloc** manages:
- Current vault path
- File list in vault
- Vault metadata

### State Flow Example

```dart
// User types in editor
editor.onChanged(newText) 
  → EditorBloc.add(UpdateFileContentEvent(newText))
  → state.currentFile = file.copyWith(
      content: newText, 
      isModified: true
    )
  → UI rebuilds showing "Modified"
  → Auto-save timer triggers
  → EditorBloc.add(SaveFileEvent())
  → Calls Rust write_file_efficient()
  → state.currentFile = file.copyWith(isModified: false)
  → UI shows "Saved"
```

### File I/O Optimization

**Rust Side (Efficient)**
```rust
// Read file with buffering
let file = File::open(path)?;
let mut reader = BufReader::new(file);  // Buffered!
let mut contents = String::new();
reader.read_to_string(&mut contents)?;
```

**Benefits:**
- ✓ Non-blocking (runs on separate thread)
- ✓ Buffered I/O (faster for large files)
- ✓ Memory efficient
- ✓ Handles encoding properly

---

## Development Workflow

### 1. **Making UI Changes**

```dart
// File: lib/ui/widgets/editor_pane.dart
// Modify Flutter widgets directly
// Hot reload automatically applies changes
```

### 2. **Adding New BLoC Events**

```dart
// File: lib/bloc/editor_event.dart
class MyNewEvent extends EditorEvent {
  // ...
}

// File: lib/bloc/editor_bloc.dart
on<MyNewEvent>(_onMyNewEvent);

Future<void> _onMyNewEvent(
  MyNewEvent event,
  Emitter<EditorState> emit,
) async {
  // Handle event
}
```

### 3. **Modifying Native Code**

```bash
# Edit native/src/lib.rs or native/src/file_handler.rs
# Rebuild native library
cd native
cargo build --release
cd ..

# Flutter app automatically uses new library
flutter run -d linux
```

### 4. **Debugging**

**Dart/Flutter:**
```bash
# Enable debug mode
flutter run -d linux -v

# Use VS Code debugger with breakpoints
```

**Rust:**
```bash
# Debug Rust code
cd native
cargo build --verbose
cargo test
```

### 5. **Testing**

**Flutter Tests:**
```bash
flutter test
```

**Rust Tests:**
```bash
cd native
cargo test
```

---

## Performance Considerations

### Optimization Tips

1. **Large Files:** Use streaming in Rust instead of loading all at once
2. **Search:** Parallel searching with Rayon
3. **Directory Scanning:** Lazy loading of file lists
4. **UI:** Use `const` widgets where possible
5. **Memory:** Stream file contents for indexing

### Memory Usage

- Typical file operations: < 10MB RAM overhead
- Large files (100MB+): Stream via Rust
- Vault with 10k files: ~50MB index

---

## Troubleshooting

### "Cannot find libacropad_native.so"
```bash
cd native && cargo build --release && cd ..
```

### "Flutter version mismatch"
```bash
flutter upgrade
flutter pub get
```

### "Rust toolchain not found"
```bash
rustup update
```

### "macOS code signing issue"
```bash
cd macos
pod repo update
cd ..
flutter clean
flutter pub get
flutter run -d macos
```

---

## Next Steps

1. **Implement File Picker** - Add `file_picker` package
2. **Add Auto-Save** - Set up periodic save timer
3. **Syntax Highlighting** - Integrate `code_text_field`
4. **Search Implementation** - Wire BLoC to Rust search
5. **Plugin Architecture** - Design plugin loader system

---

## Resources

- [Flutter Documentation](https://flutter.dev/docs)
- [BLoC Pattern](https://bloclibrary.dev)
- [Rust FFI Guide](https://docs.rust-embedded.org/book/c-language-bindings.html)
- [flutter_rust_bridge](https://cjycode.com/flutter_rust_bridge/)
- [Obsidian Architecture](https://obsidian.md)

---

**Built with ❤️ for cross-platform performance**
