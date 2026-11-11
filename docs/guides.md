# Developer & Operational Guides

This document provides setup instructions, build workflows, testing procedures, keyboard shortcuts, and platform support matrices for Acropad.

## 1. Prerequisites

### 1.1 Development Toolchains
- **Flutter SDK**: Version >= 3.0.0 (Dart SDK >= 3.0.0)
- **Rust Toolchain**: `rustc` and `cargo` >= 1.75.0 (`stable`)
- **flutter_rust_bridge_codegen**: Version 2.11.1
  ```bash
  cargo install flutter_rust_bridge_codegen --version 2.11.1
  ```

### 1.2 System Dependencies (Linux Desktop)
- **Ubuntu / Debian**:
  ```bash
  sudo apt install clang cmake ninja-build pkg-config libgtk-3-dev
  ```
- **Arch Linux**:
  ```bash
  sudo pacman -S clang cmake ninja pkgconf gtk3
  ```
- **Fedora**:
  ```bash
  sudo dnf install clang cmake ninja-build pkgconf-pkg-config gtk3-devel
  ```

## 2. Development Workflows

### 2.1 Code Generation (FFI Bindings)
If you modify `advanced/native/src/api.rs`, regenerate Dart-Rust FFI bindings:
```bash
cd advanced
flutter_rust_bridge_codegen generate
```

### 2.2 Running in Development
To launch the Flutter desktop client with stateful hot reload:
```bash
cd advanced
flutter pub get
flutter run -d linux
```

### 2.3 Running Unit Tests

#### Native Rust Unit Tests
```bash
cargo test --manifest-path advanced/native/Cargo.toml --verbose
```

#### Flutter Widget & Unit Tests
```bash
cd advanced
flutter test
```

### 2.4 Building Production Release
To compile a standalone Linux desktop bundle:
```bash
cd advanced
flutter build linux --release
```
The compiled executable and required shared libraries will be placed under:
`advanced/build/linux/x64/release/bundle/`

## 3. Keyboard Shortcuts Reference

| Shortcut | Scope | Description |
| :--- | :--- | :--- |
| `Ctrl+S` / `Cmd+S` | Editor | Trigger debounced manual save of current note |
| `Ctrl+B` / `Cmd+B` | Global | Toggle sidebar navigation visibility |
| `Ctrl+P` / `Cmd+P` | Global | Open quick note switcher modal |
| `Escape` | Global | Dismiss search filter / modal and return focus to editor |
| `Enter` (non-composing) | Editor | Insert line break (respects active IME composition) |

## 4. Platform Support Matrix

| Platform | Target Architecture | Active Client Support (`advanced/`) | Archived Standalone (`archive/pyqt6/`) |
| :--- | :--- | :--- | :--- |
| **Linux** | x86_64 | **Supported & Verified** | Supported (PyInstaller executable) |
| **Linux** | AArch64 / ARM64 | Requires local build from source | Untested |
| **Windows**| x86_64 | Platform runner scaffolding pending | Supported (PyInstaller `.exe`) |
| **macOS**  | x86_64 / Apple Silicon | Platform runner scaffolding pending | Supported (`.app` bundle via CI) |

### System Requirements:
- RAM: Minimum 512 MB, Recommended 1 GB+
- Disk: ~100 MB for release installation
- Display: 1024x768 minimum resolution
