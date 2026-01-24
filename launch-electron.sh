#!/bin/bash

# Acropad Electron Launcher Script
# Runs the new Electron-based Acropad

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ELECTRON_DIR="$PROJECT_DIR/electron"
cd "$ELECTRON_DIR"

echo "================================================"
echo "🚀 Launching Acropad (Electron Version)"
echo "================================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not found. Installing..."
    npm run install-deps
fi

# Create notes directory if it doesn't exist
mkdir -p "$PROJECT_DIR/notes"

# Get session type for logging
SESSION_TYPE="${XDG_SESSION_TYPE:-unknown}"
echo "📍 Session Type: $SESSION_TYPE"
echo "🖥️  Desktop: ${XDG_CURRENT_DESKTOP:-unknown}"
echo "⚙️  Node: $(node --version)"
echo "📦 npm: $(npm --version)"
echo ""

echo "✨ Starting Electron app..."
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""

# Run electron with dev servers
npm run dev
