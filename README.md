# Acropad

Acropad is a lightweight, local-first markdown note-taking desktop application built with Flutter and Rust.

## Status

**Beta** — The Flutter + Rust architecture (`advanced/`) is the active codebase under development. Legacy implementations (PyQt6, Electron, and CustomTkinter) are preserved in `archive/`.

## Tested Platforms

- **Linux (x86_64)**: Verified (Rust native tests passing; desktop harness operational).
- **Windows & macOS**: Active Flutter desktop harnesses require platform runner configuration; legacy PyQt6 binaries build via CI.

## Downloads

Pre-built binaries for releases are available on the [GitHub Releases](https://github.com/Ccropiropi/Acropad/releases) page:
- **Linux**: `acropad-linux-x86_64`
- **Windows**: `acropad-windows-x86_64.exe`
- **macOS**: `acropad-macos-app.zip` / `acropad-macos-x86_64`

SHA-256 checksums are published alongside each release artifact for integrity verification.

## Features

The following capabilities are implemented and operational in the active Flutter + Rust desktop client:
- **Local Vault Management**: Select and open any local filesystem folder as a notes vault via native platform directory pickers.
- **Fast Filesystem Traversal**: Recursive discovery of `.md` and `.txt` files executed by a native Rust backend (`walkdir`), automatically filtering hidden VCS and system folders (`.git`, `.obsidian`).
- **In-Vault Search**: Content substring search across notes handled directly in the native Rust engine.
- **Raw Markdown Editor**: Clean monospace editor pane with configurable font sizes and theme styling.
- **Automatic Persistence**: Debounced auto-save writing note changes directly back to disk.
- **Collapsible Navigation**: Responsive, animated sidebar displaying discovered vault notes.

## Known Issues

The project is currently in active beta development. Known limitations include:
- **No WYSIWYG or Live Markdown Preview in Flutter Client**: The active Flutter interface functions as a raw text editor. HTML preview rendering is currently only available in the legacy PyQt6 edition (`archive/pyqt6/`).
- **No Wikilinks or Graph Navigation**: Internal link extraction (`[[note]]`) and backlinks indexing from earlier prototypes have not yet been ported to the Flutter client.
- **Single Active Document**: The multi-tab interface is currently a single-active-document placeholder.
- **Platform Runners**: The Linux desktop runner is fully configured; Windows and macOS runner scaffolding under `advanced/` requires additional platform-specific harness setup.
- **System Build Dependencies**: Compiling on Linux requires host development libraries (`clang`, `cmake`, `libgtk-3-dev`, `ninja-build`, `pkg-config`).

## Build from Source

### 1. Active Edition (Flutter + Rust)

#### Prerequisites
- Flutter SDK (>= 3.0.0)
- Rust toolchain (cargo, rustc >= 1.75.0)
- `flutter_rust_bridge_codegen` (`cargo install flutter_rust_bridge_codegen --version 2.11.1`)
- Linux packages (Debian/Ubuntu): `sudo apt install clang cmake ninja-build pkg-config libgtk-3-dev`
- Linux packages (Arch Linux): `sudo pacman -S clang cmake ninja pkgconf gtk3`

#### Run in Development
```bash
cd advanced
flutter pub get
flutter run -d linux
```

#### Build Release Package
```bash
cd advanced
flutter build linux --release
```

#### Run Native Rust Unit Tests
```bash
cargo test --manifest-path advanced/native/Cargo.toml
```

---

### 2. Archived PyQt6 Edition

The legacy PyQt6 version includes split-view markdown preview, Catppuccin syntax highlighting, and a quick file switcher dialog.

#### Prerequisites
- Python 3.10+
- `pip`

#### Run Locally
```bash
cd archive/pyqt6
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

#### Build Standalone Executable (PyInstaller)
```bash
cd archive/pyqt6
source venv/bin/activate
pip install pyinstaller
pyinstaller --noconfirm --onefile --windowed --clean --name "acropad" --collect-all "markdown" main.py
```

## Architecture Evolution

| Generation | Technology Stack | Location | Status | Key Characteristics |
| :--- | :--- | :--- | :--- | :--- |
| **v0.1** | Python + CustomTkinter | `archive/python-customtkinter/` | Archived | Single-file proof-of-concept desktop note editor. |
| **v1.0** | Python + PyQt6 | `archive/pyqt6/` | Archived | Desktop application with custom syntax highlighting and PyInstaller packaging. |
| **v2.0** | Electron + React + TypeScript | `archive/electron-v1/` | Archived | Web-based prototype with backlinks indexing and Express file services. |
| **v2.2+** | Flutter + Rust (`flutter_rust_bridge`)| `advanced/` | **Active** | Local-first desktop app pairing Flutter UI with native Rust filesystem operations. |

## Documentation

Comprehensive project documentation is available in `docs/`:
- [Architecture & Design](docs/architecture.md)
- [Design System](docs/DESIGN.md)
- [Developer & Build Guides](docs/guides.md)
- [Archived Editions Guide](docs/archive-editions.md)

## License

Acropad is licensed under the [Apache License, Version 2.0](LICENSE).
