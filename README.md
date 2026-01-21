# Acropad

**Acropad** is a lightweight, local-first Markdown editor optimized for scientific writing and personal knowledge management. Built with Python and PyQt6, it offers a seamless cross-platform experience with native performance.

## Core Features

- **Split-View Editing:** Real-time Markdown editing with instant preview.
- **Scientific Writing:** Full LaTeX support ($$ E = mc^2 $$) via MathJax.
- **Local-First:** All notes are stored as plain text `.md` files on your machine.
- **Images:** Drag-and-drop or paste images directly into your notes.
- **Dark Mode:** Easy-on-the-eyes interface inspired by modern IDEs.
- **Portable:** Runs as a single self-contained binary on Linux (and other platforms).

## Installation

### Downloads
We automatically build Acropad for **Windows, macOS, and Linux**. 
Go to the [Actions Tab](https://github.com/Ccropiropi/Acropad/actions) (click the latest run -> "Artifacts") or check the [Releases Page](https://github.com/Ccropiropi/Acropad/releases) for the latest binaries.

### Manual Build (Linux)
If you prefer to build from source:
```bash
# Clone and setup
git clone https://github.com/Ccropiropi/Acropad.git
cd Acropad
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run
python src/main.py

# Build Binary
./build.sh
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