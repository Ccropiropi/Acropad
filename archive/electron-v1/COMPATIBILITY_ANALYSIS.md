# Acropad: PyQt6 → Electron Migration Analysis

## 1. COMPATIBLE FEATURES (Direct Port)

### ✅ Core Functionality
- **Markdown Rendering**: Using `markdown-it` (Node.js) instead of Python's `markdown` library
  - Status: **FULLY COMPATIBLE** ✓
  - Replacement: `markdown-it` library with similar features
  - LaTeX/MathJax support: **PRESERVED** (using same CDN)

- **File Operations**: Read/Write/Create notes
  - Status: **FULLY COMPATIBLE** ✓
  - Replacement: `fs-extra` in Node.js backend
  - API endpoints handle same operations

- **Dark Theme**: UI styling and color scheme
  - Status: **FULLY COMPATIBLE** ✓
  - CSS directly ported from PyQt6 stylesheets
  - Same color palette: `#171717`, `#E5E5E5`, `#2563EB`, etc.

- **Auto-save**: 2-second interval autosave
  - Status: **FULLY COMPATIBLE** ✓
  - Implementation: React useEffect with setInterval

- **File Tree/Sidebar**: Browse notes by file
  - Status: **FULLY COMPATIBLE** ✓
  - Replacement: React component with Sidebar.js

- **Split View**: Editor + Preview pane
  - Status: **FULLY COMPATIBLE** ✓
  - CSS Flexbox layout instead of Qt Splitter

- **New Note Creation**: Quick note generation
  - Status: **FULLY COMPATIBLE** ✓
  - Replacement: Backend endpoint + React handler

---

## 2. FEATURES NEEDING REFACTORING

### ⚠️ Search Bar
- **Current (PyQt6)**: `QLineEdit` with placeholder
- **Status**: NOT IMPLEMENTED in React yet
- **Action**: Need to implement search filter logic
- **Gemini Task**: Implement live file search with regex support

### ⚠️ Image Handling
- **Current (PyQt6)**: "Drag-and-drop or paste images directly"
- **Status**: NOT IMPLEMENTED in Electron version
- **Action**: Need to add drag-and-drop event handlers in Editor component
- **Gemini Task**: Add image upload, base64 encoding, drag-and-drop support

### ⚠️ File Watching
- **Current (PyQt6)**: Implicit via file model refresh
- **Status**: PARTIALLY IMPLEMENTED (chokidar installed but not used)
- **Action**: Need to integrate chokidar for detecting external file changes
- **Gemini Task**: Implement file watcher with real-time sync

### ⚠️ Status Bar Messages
- **Current (PyQt6)**: `QStatusBar` with timed messages
- **Status**: REMOVED in React version
- **Action**: Need to add toast/notification component
- **Gemini Task**: Implement notification system for user feedback

### ⚠️ Thread Pool Optimization
- **Current (PyQt6)**: Explicit `QThreadPool` for file I/O
- **Status**: REPLACED by async/await in Node.js
- **Action**: Backend already handles async operations
- **Status**: ✓ BETTER than PyQt6 implementation

---

## 3. FEATURES NOT YET IMPLEMENTED

### ❌ File Search Functionality
- **Current**: Search bar placeholder exists
- **Needed**: Filter file list by name/content
- **Priority**: MEDIUM
- **Gemini Task**: Implement search with fuzzy matching

### ❌ File/Folder Organization
- **Current**: Flat file list in notes/ directory
- **Needed**: Folder nesting, tags, collections
- **Priority**: LOW (nice-to-have)
- **Gemini Task**: Add folder structure support

### ❌ Keyboard Shortcuts
- **Current (PyQt6)**: Standard OS shortcuts only
- **Needed**: Ctrl+S (save), Ctrl+N (new), Ctrl+/ (comment), etc.
- **Priority**: HIGH
- **Gemini Task**: Implement keyboard shortcut system

### ❌ Export Functionality
- **Current**: None
- **Needed**: Export to PDF, HTML, DOCX
- **Priority**: MEDIUM
- **Gemini Task**: Add export to multiple formats

### ❌ Settings/Preferences UI
- **Current (PyQt6)**: Hardcoded settings
- **Needed**: UI for font size, theme toggle, autosave interval
- **Priority**: MEDIUM
- **Gemini Task**: Create settings page component

### ❌ Version Control Integration
- **Current**: None
- **Needed**: Git integration for note history
- **Priority**: LOW
- **Gemini Task**: Add simple git commit functionality

### ❌ Plugin/Extension System
- **Current**: None
- **Needed**: Allow custom markdown extensions
- **Priority**: LOW
- **Gemini Task**: Create plugin loader architecture

---

## 4. ARCHITECTURAL IMPROVEMENTS IN ELECTRON

### ✅ Better Separation of Concerns
- **PyQt6**: GUI + Logic mixed together in `ui.py`
- **Electron**: Clean separation into frontend (React) + backend (Node.js)
- **Benefit**: Easier testing, maintenance, and feature addition

### ✅ Cross-Platform Compatibility
- **PyQt6**: Works but occasional Wayland issues
- **Electron**: Native Chromium renderer (more consistent)
- **Benefit**: Better cross-platform reliability

### ✅ Web Technologies
- **PyQt6**: Python-specific, harder to find resources
- **Electron**: Uses web stack (HTML/CSS/JS), massive ecosystem
- **Benefit**: Easy hiring, community support, available libraries

### ✅ Hot Reload
- **PyQt6**: Full app restart needed for changes
- **Electron**: React dev server supports hot reload
- **Benefit**: Faster development iteration

### ✅ Async Operations
- **PyQt6**: Explicit thread pool management
- **Electron**: Native async/await in Node.js
- **Benefit**: Simpler, less error-prone code

---

## 5. DEPENDENCIES COMPARISON

### PyQt6 Stack (Current)
```
altgraph==0.17.5
Markdown==3.10
PyQt6==6.10.2
PyQt6-WebEngine==6.10.0
pyinstaller==6.18.0
```
**Total Size**: ~500MB+ binary (PyInstaller bundled)

### Electron Stack (Proposed)
```
Backend: express, markdown-it, chokidar, fs-extra
Frontend: react, react-dom, axios
Main: electron, electron-builder
```
**Total Size**: ~300MB binary (Electron with Chromium)
**Benefit**: 40% smaller footprint, more modular

---

## 6. MIGRATION CHECKLIST

### Phase 1: Foundation ✓ COMPLETE
- [x] Electron main process setup
- [x] Express backend server
- [x] React frontend structure
- [x] File I/O operations
- [x] Markdown rendering

### Phase 2: Core Features (IN PROGRESS)
- [ ] Search functionality
- [ ] Image drag-and-drop support
- [ ] File watcher integration
- [ ] Notification system

### Phase 3: Polish
- [ ] Keyboard shortcuts
- [ ] Settings UI
- [ ] Error handling improvements
- [ ] Performance optimization

### Phase 4: Advanced Features
- [ ] Export to PDF/HTML/DOCX
- [ ] Plugin system
- [ ] Version control integration
- [ ] Cloud sync (optional)

---

## 7. KNOWN ISSUES TO ADDRESS

### Issue #1: Preload.js Security
- **Current**: Exposes all window.api methods
- **Fix**: Implement context isolation, validate all IPC calls

### Issue #2: No File Watchers Running
- **Current**: chokidar installed but not integrated
- **Fix**: Implement in backend/services/watcher-service.js

### Issue #3: Search Bar Non-functional
- **Current**: Placeholder only
- **Fix**: Implement filter logic in Sidebar component

### Issue #4: Status Messages Missing
- **Current**: No toast notifications
- **Fix**: Add react-toastify or custom notification component

### Issue #5: Backend Not Started in Dev Mode
- **Current**: Requires manual `npm run backend`
- **Fix**: Use `concurrently` script (already in package.json)

---

## 8. CONFIGURATION RECOMMENDATIONS

### Frontend
- React 18.2.0 with hooks
- Axios for HTTP calls to backend
- CSS Modules or styled-components for styling (future improvement)

### Backend
- Express.js for REST API
- markdown-it for rendering
- chokidar for file watching
- fs-extra for robust file operations

### Electron
- electron-builder for packaging
- electron-is-dev for dev/prod detection
- Preload scripts for IPC security

---

## 9. NEXT STEPS FOR GEMINI CLI

See `GEMINI_CLI_FEATURE_GUIDE.md` for specific tasks to be completed.
