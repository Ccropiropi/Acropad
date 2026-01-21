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

### Option 1: Download Binary (Linux)
Go to the [Releases](https://github.com/Ccropiropi/Acropad/releases) page and download the latest `acropad` executable.
```bash
chmod +x acropad
./acropad
```

### Option 2: Build from Source

**Prerequisites:**
- Python 3.10+
- `pip`

**Steps:**
1. Clone the repository:
   ```bash
   git clone https://github.com/Ccropiropi/Acropad.git
   cd Acropad
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   python src/main.py
   ```

4. (Optional) Build standalone binary:
   ```bash
   ./build.sh
   # Binary will be in dist/acropad
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