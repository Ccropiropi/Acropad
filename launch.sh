#!/bin/bash

# Acropad Launcher Menu - Choose between PyQt6 and Electron versions

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

clear
echo "╔════════════════════════════════════════════════╗"
echo "║         🎯 Acropad - Version Selector          ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "Which version would you like to launch?"
echo ""
echo "1) PyQt6 (Original - Python/Qt-based)"
echo "2) Electron (New - Node.js/React-based)"
echo "3) Run Both (Side-by-side) - Open new terminals"
echo "4) Exit"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Launching PyQt6 version..."
        bash "$PROJECT_DIR/launch-pyqt6.sh"
        ;;
    2)
        echo ""
        echo "Launching Electron version..."
        bash "$PROJECT_DIR/launch-electron.sh"
        ;;
    3)
        echo ""
        echo "🔄 Starting both versions..."
        echo "   PyQt6 will open in this terminal"
        echo "   Electron will open in a new terminal"
        echo ""
        
        # Check if we have necessary tools
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash "$PROJECT_DIR/launch-electron.sh" &
        elif command -v xterm &> /dev/null; then
            xterm -e bash "$PROJECT_DIR/launch-electron.sh" &
        else
            echo "⚠️  Please manually run in another terminal:"
            echo "   bash $PROJECT_DIR/launch-electron.sh"
            echo ""
        fi
        
        bash "$PROJECT_DIR/launch-pyqt6.sh"
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please try again."
        exit 1
        ;;
esac
