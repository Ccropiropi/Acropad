# Acropad

**Acropad** is a lightweight, local-first Markdown editor optimized for scientific writing and personal knowledge management.

**Now available in two versions:**
- 🐍 **PyQt6** (Original) - Python/Qt-based desktop app
- ⚛️ **Electron** (New) - Node.js/React-based modern web UI

Both versions are fully functional and tested on Hyprland (Wayland) and all platforms.

## Core Features

- **Split-View Editing:** Real-time Markdown editing with instant preview.
- **Scientific Writing:** Full LaTeX support ($$ E = mc^2 $$) via MathJax.
- **Local-First:** All notes are stored as plain text `.md` files on your machine.
- **Images:** Drag-and-drop or paste images directly into your notes.
- **Dark Mode:** Easy-on-the-eyes interface inspired by modern IDEs.
- **Portable:** Runs as a single self-contained binary on Linux (and other platforms).

## Quick Start

**Choose your preferred version and run:**

```bash
# Interactive launcher (recommended)
./launch.sh

# Or directly:
./launch-pyqt6.sh      # Python/Qt version
./launch-electron.sh   # Node.js/React version
```

**For complete setup and troubleshooting guide, see**: [DUAL-VERSION-GUIDE.md](./DUAL-VERSION-GUIDE.md)

## Installation

### From Source (Both Versions)
```bash
# Clone the repository
git clone https://github.com/Ccropiropi/Acropad.git
cd Acropad

# Run tests to verify everything works
./test-both.sh

# Launch your preferred version
./launch.sh
```

### PyQt6 Version Only
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

### Electron Version Only
```bash
cd electron
npm run install-deps
npm run dev
```

## Usage

- **Sidebar:** Browse your notes in the `notes/` directory.
- **New Note:** Click the **"+ New Note"** button to create a note instantly.
- **Editor:** Write standard Markdown.
- **Preview:** See changes instantly.
- **Math:** Use `$` for inline math and `$$` for block math.

## Troubleshooting

- **White Screen on Linux (Wayland):**
  If you use Hyprland or another Wayland compositor and see a blank window, try running with XCB compatibility:
  ```bash
  QT_QPA_PLATFORM=xcb ./acropad
  ```

## License
MIT License. See [LICENSE](LICENSE) for details.