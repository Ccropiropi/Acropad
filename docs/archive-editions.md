# Archived Editions Reference

This document provides execution and inspection instructions for historical Acropad implementations preserved under `archive/`.

## 1. PyQt6 Native Desktop Edition (`archive/pyqt6/`)

### 1.1 Overview
Version 1.0 desktop application built with Python 3 and PyQt6. Features Catppuccin Mocha syntax highlighting, dual-pane raw/rendered markdown view via native `QTextBrowser`, and a quick switcher dialog.

### 1.2 Prerequisites
- Python 3.10+
- `pip`

### 1.3 Running Locally
```bash
cd archive/pyqt6
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```
Or use the launcher script:
```bash
cd archive/pyqt6
./launch-pyqt6.sh
```

### 1.4 Running Tests
```bash
cd archive/pyqt6
source venv/bin/activate
python3 -m unittest discover tests -v
```

### 1.5 Compiling Standalone Executable (PyInstaller)
```bash
cd archive/pyqt6
source venv/bin/activate
pip install pyinstaller
pyinstaller --noconfirm --onefile --windowed --clean \
  --name "acropad" \
  --collect-all "markdown" \
  main.py
```

---

## 2. Electron Edition (`archive/electron-v1/`)

### 2.1 Overview
Version 2.0 web-desktop prototype combining an Electron wrapper, Express.js backend services, and a React + TypeScript frontend.

### 2.2 Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2.3 Running Locally
```bash
cd archive/electron-v1
npm install
npm run dev
```
Or execute the standalone launcher:
```bash
cd archive/electron-v1
./launch-electron.sh
```

---

## 3. Python CustomTkinter Edition (`archive/python-customtkinter/`)

### 3.1 Overview
Version 0.1 single-file proof-of-concept desktop text editor using CustomTkinter.

### 3.2 Prerequisites
- Python 3.9+
- `customtkinter`

### 3.3 Running Locally
```bash
cd archive/python-customtkinter
python3 -m venv venv
source venv/bin/activate
pip install customtkinter
python3 acropad.py
```
