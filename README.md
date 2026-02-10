# Acropad 📝

**Acropad** is a versatile, local-first note-taking application inspired by Obsidian. It is designed to be fast, private, and flexible. This repository hosts two distinct implementations of the concept, catering to different development needs and performance requirements.

1.  **Acropad (Python Edition):** A lightweight, accessible desktop application built with CustomTkinter.
2.  **Acropad Advanced (Flutter + Rust):** A high-performance, cross-platform architecture leveraging Flutter for a pixel-perfect UI and Rust for safe, blazing-fast file operations.

---

## 🐍 Python Edition

A clean, dark-mode minimalist editor designed for simplicity and ease of modification.

### Key Features
*   **Modern UI:** Sleek dark theme using `CustomTkinter`.
*   **Vault System:** Open any folder as a workspace.
*   **Auto-Save:** Changes are saved automatically in the background.
*   **Markdown Support:** Edit `.md` and `.txt` files seamlessly.

### Quick Start

**Prerequisites:** Python 3.8+

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Launch the App:**
    ```bash
    python acropad.py
    ```

---

## ⚡ Advanced Edition (Flutter + Rust)

Engineered for scalability and performance. This version demonstrates a production-grade architecture using the **Flutter Rust Bridge (FRB)** to offload heavy I/O tasks to a native Rust backend.

### Architecture
*   **Frontend:** Flutter (Dart) using the **BLoC** pattern for predictable state management.
*   **Backend:** Rust crate handling file system operations, directory scanning, and text processing.
*   **Communication:** `flutter_rust_bridge` v2 provides type-safe, zero-copy communication between Dart and Rust.

### Prerequisites
*   [Flutter SDK](https://flutter.dev/docs/get-started/install)
*   [Rust Toolchain](https://www.rust-lang.org/tools/install)
*   **Codegen Tool:**
    ```bash
    cargo install flutter_rust_bridge_codegen
    ```

### Build & Run

1.  **Navigate to the project:**
    ```bash
    cd advanced
    ```

2.  **Install Dart dependencies:**
    ```bash
    flutter pub get
    ```

3.  **Generate Rust Bindings:**
    This step compiles the Rust code and generates the Dart glue code.
    ```bash
    # Ensure ~/.cargo/bin is in your PATH
    flutter_rust_bridge_codegen generate
    ```

4.  **Run (Linux Desktop):**
    ```bash
    flutter run -d linux
    ```

---

## 📂 Project Structure

```
Acropad/
├── acropad.py              # Python implementation entry point
├── requirements.txt        # Python dependencies
├── README.md               # Project documentation
└── advanced/               # Flutter + Rust Project Root
    ├── lib/                # Flutter UI & Business Logic
    │   ├── bloc/           # State management (Vault/Editor)
    │   ├── ui/             # Screens & Widgets
    │   └── src/rust/       # Generated Dart-Rust bindings
    ├── native/             # Rust Crate (Backend Logic)
    │   └── src/api.rs      # Exposed Rust functions
    ├── linux/              # Linux-specific runner configuration
    └── pubspec.yaml        # Dart dependencies
```

Still a beta product..

---

### License

This project is open-source and available under the MIT License.
