#!/bin/bash

# Acropad PyQt6 Launcher Script
# Runs the original PyQt6-based Acropad

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "================================================"
echo "🚀 Launching Acropad (PyQt6 Version)"
echo "================================================"
echo ""

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    python3 -m venv --system-site-packages venv
fi

# Activate venv
source venv/bin/activate

# Install/update dependencies
echo "📦 Checking dependencies..."
pip install -q -r requirements.txt

# Create notes directory if it doesn't exist
mkdir -p notes

# Get session type for logging
SESSION_TYPE="${XDG_SESSION_TYPE:-unknown}"
echo "📍 Session Type: $SESSION_TYPE"
echo "🖥️  Desktop: ${XDG_CURRENT_DESKTOP:-unknown}"
echo "🐍 Python: $(python3 --version)"
echo ""

# Run the app
echo "✨ Starting Acropad..."
echo "   (Logs will be written to acropad.log)"
echo ""

python3 main.py
