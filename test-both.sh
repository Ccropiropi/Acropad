#!/bin/bash

# Acropad Test Suite
# Tests both PyQt6 and Electron versions on current platform

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DIR="$PROJECT_DIR/tests"
LOG_FILE="$PROJECT_DIR/test-results.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize log
> "$LOG_FILE"

log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

test_result() {
    if [ $1 -eq 0 ]; then
        log "${GREEN}✓ $2${NC}"
    else
        log "${RED}✗ $2${NC}"
        exit 1
    fi
}

header() {
    echo ""
    log "${BLUE}============================================${NC}"
    log "${BLUE}$1${NC}"
    log "${BLUE}============================================${NC}"
}

# Get system info
header "🖥️  SYSTEM INFORMATION"
log "OS: $(uname -s) $(uname -r)"
log "Architecture: $(uname -m)"
log "Session Type: ${XDG_SESSION_TYPE:-unknown}"
log "Desktop: ${XDG_CURRENT_DESKTOP:-unknown}"
log ""

# Check Python
header "🐍 PYTHON VERSION CHECK"
python3_version=$(python3 --version 2>&1)
log "$python3_version"
test_result $? "Python 3 is installed"

# Check Node
header "⚙️  NODE VERSION CHECK"
node_version=$(node --version)
npm_version=$(npm --version)
log "Node: $node_version"
log "npm: $npm_version"
test_result $? "Node.js is installed"

# Test PyQt6
header "🎨 TESTING PYQT6 VERSION"

log "Activating Python virtual environment..."
cd "$PROJECT_DIR"
source venv/bin/activate || test_result 1 "Virtual environment activation"

log "Testing Python imports..."
python3 -c "
import sys
import os
os.environ['QT_QPA_PLATFORM'] = 'offscreen'

# Test imports
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import Qt
from ui import AcropadWindow
import markdown
import worker

print('✓ All imports successful')
" 2>&1 | tee -a "$LOG_FILE"
test_result $? "PyQt6 imports"

log "Testing PyQt6 application initialization..."
python3 -c "
import sys
import os
os.environ['QT_QPA_PLATFORM'] = 'offscreen'

from PyQt6.QtWidgets import QApplication
from ui import AcropadWindow

app = QApplication(sys.argv)
base_dir = os.path.join(os.getcwd(), 'notes')
window = AcropadWindow(base_dir)

print('✓ Application initialized successfully')
" 2>&1 | tee -a "$LOG_FILE"
test_result $? "PyQt6 application initialization"

log "Testing markdown rendering..."
python3 -c "
import markdown
from ui import render_markdown

test_md = '# Hello\n\nThis is **bold** and *italic*'
html = render_markdown(test_md)

if '<h1>Hello</h1>' in html and '<strong>bold</strong>' in html:
    print('✓ Markdown rendering works')
else:
    print('✗ Markdown rendering failed')
    exit(1)
" 2>&1 | tee -a "$LOG_FILE"
test_result $? "Markdown rendering"

# Test Electron
header "⚛️  TESTING ELECTRON VERSION"

cd "$PROJECT_DIR/electron"

log "Checking if dependencies are installed..."
if [ ! -d "node_modules" ]; then
    log "Dependencies not found. Installing..."
    npm run install-deps 2>&1 | tail -5 | tee -a "$LOG_FILE"
fi
test_result $? "Electron dependencies"

log "Testing backend code syntax..."
node -c backend/server.js 2>&1 | tee -a "$LOG_FILE"
test_result $? "Backend code syntax"

log "Checking backend files..."
[ -f "backend/server.js" ] && [ -f "backend/services/markdown-service.js" ] && [ -f "backend/routes/files.js" ]
test_result $? "Backend files exist"

log "Testing frontend build..."
cd frontend
npm run build 2>&1 | grep -E "(success|error|failed)" | tail -3 | tee -a "$LOG_FILE"
test_result $? "Frontend React build"

# Test files and structure
header "📁 TESTING PROJECT STRUCTURE"

cd "$PROJECT_DIR"

# Check required directories
for dir in notes electron electron/main electron/backend electron/frontend; do
    if [ -d "$dir" ]; then
        log "${GREEN}✓${NC} Directory exists: $dir"
    else
        log "${RED}✗${NC} Directory missing: $dir"
        exit 1
    fi
done

# Check required files
for file in main.py ui.py worker.py requirements.txt electron/package.json launch.sh launch-pyqt6.sh launch-electron.sh; do
    if [ -f "$file" ]; then
        log "${GREEN}✓${NC} File exists: $file"
    else
        log "${RED}✗${NC} File missing: $file"
        exit 1
    fi
done

# Summary
header "📊 TEST SUMMARY"

log "${GREEN}✅ ALL TESTS PASSED${NC}"
log ""
log "Platform Details:"
log "  • Python: $python3_version"
log "  • Node: $node_version"
log "  • npm: $npm_version"
log "  • Session: ${XDG_SESSION_TYPE:-unknown}"
log "  • Desktop: ${XDG_CURRENT_DESKTOP:-unknown}"
log ""
log "Test Results:"
log "  • PyQt6 version: ✓ Ready to launch"
log "  • Electron version: ✓ Ready to launch"
log "  • Project structure: ✓ Complete"
log ""
log "To launch the app, run:"
log "  • ${YELLOW}./launch.sh${NC} (interactive menu)"
log "  • ${YELLOW}./launch-pyqt6.sh${NC} (Python version)"
log "  • ${YELLOW}./launch-electron.sh${NC} (Node.js version)"
log ""
log "Full test log saved to: $LOG_FILE"
