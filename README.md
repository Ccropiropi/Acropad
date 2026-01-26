# Acropad

Acropad is a modern note-taking application inspired by Obsidian. This repository contains two versions of the application:

1.  **Python Version:** A simplified, beginner-friendly desktop app.
2.  **Advanced Version:** A high-performance, cross-platform app using Flutter and Rust.

## 1. Python Version (Beginner-Friendly)

A pure Python implementation using `CustomTkinter` for a modern dark-mode UI.

### Features
- Dark mode UI
- Vault (Folder) support
- Markdown/Text file editing
- Auto-save

### Quick Start
1.  **Install Requirements:**
    ```bash
    pip install -r requirements.txt
    ```
2.  **Run the App:**
    ```bash
    python acropad.py
    ```

---

## 2. Advanced Version (Flutter + Rust)

A professional-grade implementation designed for high performance and scalability.
- **Frontend:** Flutter (Dart)
- **Backend:** Rust (via `flutter_rust_bridge`)

### Prerequisites
- **Flutter SDK:** [Install Flutter](https://docs.flutter.dev/get-started/install)
- **Rust Toolchain:** [Install Rust](https://www.rust-lang.org/tools/install)
- **Flutter Rust Bridge Codegen:**
    ```bash
    cargo install flutter_rust_bridge_codegen
    ```

### Setup & Run
1.  **Navigate to the advanced directory:**
    ```bash
    cd advanced
    ```

2.  **Install Dart dependencies:**
    ```bash
    flutter pub get
    ```

3.  **Generate Rust Bindings:**
    This step connects the Dart frontend to the Rust backend.
    ```bash
    flutter_rust_bridge_codegen generate
    ```

4.  **Run the App:**
    ```bash
    flutter run
    ```

### Architecture
- **`lib/`**: Flutter UI code (BLoC pattern).
- **`native/`**: Rust code for file I/O and performance-critical tasks.
- **`native/src/api.rs`**: Defines the Rust functions exposed to Flutter.