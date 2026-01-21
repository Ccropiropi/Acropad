#!/bin/bash
set -e

echo "Building Acropad for Linux..."

# Ensure we are in the venv
source venv/bin/activate

# Clean previous builds
rm -rf build dist

# Build Single File Executable
# --noconsole: Don't show terminal (remove this if you want to see logs in terminal for debugging)
# --name: Output binary name
# --add-data: Include any non-code assets if we had them
# --clean: Clean cache
pyinstaller --noconfirm --onefile --windowed --clean \
    --name "acropad" \
    --hidden-import "PyQt6.QtWebEngineCore" \
    --collect-all "markdown" \
    main.py

echo "Build complete. Binary is in dist/acropad"
chmod +x dist/acropad
