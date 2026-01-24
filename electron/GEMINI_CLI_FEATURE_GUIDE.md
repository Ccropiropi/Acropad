# Acropad Electron: Gemini CLI Feature Implementation Guide

This document outlines specific features and improvements that should be handled by Gemini CLI (or another automated AI code generator) to complete the migration from PyQt6 to Electron.

---

## 🎯 PRIORITY 1: CRITICAL (Must Have)

### Task 1.1: Implement Search Functionality
**File**: `electron/frontend/src/components/Sidebar.js`
**Status**: COMPLETED ✅
**Description**: Add live search filtering to file list

**Requirements**:
- Filter files by name as user types
- Case-insensitive search
- Support partial matches
- Clear search on "X" button click
- Show "No results" message

**Acceptance Criteria**:
- [x] Search input captures user query
- [x] File list updates in real-time
- [x] Handles empty state gracefully
- [x] Keyboard: Enter/Escape support

**Code Location**: `electron/frontend/src/components/Sidebar.js` - Replace placeholder search bar logic

**Implementation Notes**:
```javascript
// Add state for search query
// Filter files array based on query
// Update file list display
```

---

### Task 1.2: Add Image Upload & Drag-Drop Support
**File**: `electron/frontend/src/components/Editor.js`
**Status**: COMPLETED ✅
**Description**: Allow users to paste/drag images into editor

**Requirements**:
- Drag-and-drop image files onto editor
- Paste images from clipboard
- Convert images to base64 or save to assets folder
- Insert markdown syntax: `![alt](path)`
- Show upload progress

**Acceptance Criteria**:
- [x] Drag-drop events handled
- [x] Image saved/encoded
- [x] Markdown inserted at cursor
- [x] Works with common formats (PNG, JPG, GIF, WebP)
- [x] Error handling for invalid files

**Code Location**: `electron/frontend/src/components/Editor.js` - Add drop zone and paste listener

**Implementation Notes**:
- Use DataTransfer API for drag-drop
- Convert to base64 using FileReader
- Could alternatively save to `notes/.assets/` folder
- Need backend endpoint for image handling

---

### Task 1.3: Implement Notification System
**File**: New file: `electron/frontend/src/components/Notification.js` + `electron/frontend/src/hooks/useNotification.js`
**Status**: COMPLETED ✅
**Description**: Replace status bar with toast notifications

**Requirements**:
- Toast notifications for: saved, error, created, loading
- Auto-dismiss after 3-5 seconds
- Multiple notifications can stack
- Position: bottom-right corner
- Dismissible by click

**Acceptance Criteria**:
- [x] Notification component created
- [x] Custom hook: `useNotification()`
- [x] Success/error/info/warning types
- [x] Auto-dismiss with timeout
- [x] Accessible (ARIA labels)

**Code Location**: Create `electron/frontend/src/components/Notification.js`

**Implementation Notes**:
```javascript
// Create custom hook that manages toast queue
// Integrate with App.js
// Call from file operations handlers
```

---

### Task 1.4: Implement Keyboard Shortcuts
**File**: New file: `electron/frontend/src/hooks/useKeyboardShortcuts.js`
**Status**: COMPLETED ✅
**Description**: Add standard editor keyboard shortcuts

**Required Shortcuts**:
- `Ctrl+S` / `Cmd+S`: Save current file
- `Ctrl+N` / `Cmd+N`: Create new note
- `Ctrl+Shift+L`: Focus file list
- `Ctrl+E`: Focus editor
- `Ctrl+P`: Focus preview
- `Ctrl+/`: Comment line/selection
- `Tab`: Insert 2 spaces (or tab)
- `Shift+Tab`: Remove indentation

**Acceptance Criteria**:
- [x] All shortcuts respond correctly
- [x] Prevents browser defaults where appropriate
- [x] Works across components
- [x] Can be customized in settings (future)
- [x] Cross-platform (Windows/Mac/Linux)

**Code Location**: Create `electron/frontend/src/hooks/useKeyboardShortcuts.js`

**Implementation Notes**:
- Use `useEffect` and `keydown` event listener
- Store keymap in config object
- Handle platform differences (Ctrl vs Cmd)

---

## 🎯 PRIORITY 2: HIGH (Should Have)

### Task 2.1: Fix Preload Security Issues
**File**: `electron/main/preload.js`
**Status**: PARTIALLY IMPLEMENTED
**Description**: Secure IPC communication with context isolation

**Requirements**:
- Validate all IPC calls from frontend
- Rate limiting on file operations
- Error sanitization (don't expose full paths)
- Signature verification for sensitive calls
- Audit logging for file operations

**Acceptance Criteria**:
- [x] All IPC calls validated
- [x] No sensitive data in error messages
- [x] Rate limiting implemented
- [x] Audit log in app directory
- [x] Security headers in Electron config

**Code Location**: `electron/main/preload.js` and `electron/main/main.js`

---

### Task 2.2: Implement File Watcher
**File**: New file: `electron/backend/services/watcher-service.js`
**Status**: PARTIALLY IMPLEMENTED (chokidar installed)
**Description**: Watch for external file changes and notify frontend

**Requirements**:
- Monitor notes directory for changes
- Detect new/modified/deleted files
- Emit events to frontend via IPC
- Handle file conflicts gracefully
- Debounce rapid file changes

**Acceptance Criteria**:
- [x] Watcher starts on app launch
- [x] Real-time file list updates
- [x] Conflict detection (external vs local edits)
- [x] Proper cleanup on app exit
- [x] No memory leaks

**Code Location**: Create `electron/backend/services/watcher-service.js` + integrate in `server.js`

---

### Task 2.3: Create Settings/Preferences UI
**File**: New file: `electron/frontend/src/pages/Settings.js`
**Status**: NOT IMPLEMENTED
**Description**: UI for user preferences

**Settings to Support**:
- Editor font size (8-24pt)
- Auto-save interval (500ms - 10s)
- Theme selection (if multiple themes added)
- Line wrapping toggle
- Syntax highlighting toggle (future)
- Default note location

**Acceptance Criteria**:
- [x] Settings page component created
- [x] All settings saved to localStorage
- [x] Settings applied immediately
- [x] Reset to defaults option
- [x] Settings persist across sessions

**Code Location**: Create `electron/frontend/src/pages/Settings.js` and add route in App.js

---

### Task 2.4: Add Export Functionality
**File**: New file: `electron/backend/routes/export.js` + `electron/backend/services/export-service.js`
**Status**: NOT IMPLEMENTED
**Description**: Export notes to multiple formats

**Export Formats**:
- HTML (styled)
- PDF (via headless-chrome or similar)
- Markdown (as-is)
- Plain text (strip markdown)

**Acceptance Criteria**:
- [x] Export endpoints created
- [x] Works with LaTeX formulas
- [x] Preserves formatting
- [x] Dialog to choose format
- [x] Error handling for large files

**Code Location**: Create backend export routes

---

## 🎯 PRIORITY 3: MEDIUM (Nice to Have)

### Task 3.1: Add Folder Organization
**Status**: NOT IMPLEMENTED
**Description**: Support nested folders in notes directory

**Requirements**:
- Breadcrumb navigation
- Create folder button
- Move files between folders
- Folder icons in file tree

---

### Task 3.2: Implement Dark/Light Theme Toggle
**Status**: NOT IMPLEMENTED
**Description**: Add theme switching capability

**Requirements**:
- Store theme preference
- CSS variables for easy switching
- System theme detection
- Smooth transitions

---

### Task 3.3: Add Markdown Preview Settings
**Status**: NOT IMPLEMENTED
**Description**: Allow preview-only mode, editor-only mode

**Requirements**:
- Toggle visibility of panels
- Save layout preference
- Responsive layout adjustments

---

## 🛠️ INFRASTRUCTURE TASKS

### Task I.1: Fix electron-is-dev Import
**File**: `electron/main/main.js`
**Status**: ERROR - Missing import
**Issue**: `require('electron-is-dev')` will fail - need to add package
**Fix**: Add `electron-is-dev` to main package.json dependencies

```bash
npm install electron-is-dev
```

---

### Task I.2: Create .env Configuration
**File**: New file: `electron/backend/.env` and `electron/.env`
**Status**: NOT IMPLEMENTED
**Description**: Environment variables for backend and Electron

**Variables Needed**:
- `NODE_ENV` (development/production)
- `API_PORT` (backend port, default 5000)
- `NOTES_DIR` (custom notes directory)
- `LOG_LEVEL` (debug/info/warn/error)

---

### Task I.3: Add Proper Error Handling
**Status**: PARTIAL
**Description**: Comprehensive error handling across app

**Areas to improve**:
- Backend error responses with proper HTTP codes
- Frontend error boundary component
- Fallback UI for errors
- Detailed logging for debugging

---

### Task I.4: Create App Installer Script
**File**: New file: `electron/build.sh`
**Status**: NOT IMPLEMENTED
**Description**: One-command build and package script

**Script should**:
- Clean old builds
- Install dependencies
- Build React frontend
- Package with electron-builder
- Create installers for Windows/Mac/Linux

---

## 📊 TESTING TASKS

### Task T.1: Add Frontend Component Tests
**Status**: NOT IMPLEMENTED
**Files**: `electron/frontend/src/**/*.test.js`
**Description**: Jest + React Testing Library tests

**Test Coverage**:
- Sidebar: file list, search, new note button
- Editor: content input, keyboard shortcuts
- Preview: markdown rendering

---

### Task T.2: Add Backend API Tests
**Status**: NOT IMPLEMENTED
**Files**: `electron/backend/__tests__/`
**Description**: Jest + Supertest tests

**Test Coverage**:
- File operations (CRUD)
- Markdown rendering
- Error handling
- Edge cases (large files, invalid paths)

---

## 🚀 DEPLOYMENT TASKS

### Task D.1: Create GitHub Actions Workflow
**Status**: NOT IMPLEMENTED
**File**: `.github/workflows/build.yml`
**Description**: Auto-build and release on tag push

**Workflow should**:
- Build for Windows, macOS, Linux
- Run tests
- Generate installers
- Create GitHub release
- Upload artifacts

---

## 📋 SUMMARY TABLE

| Task | Priority | Component | Status | Est. Time |
|------|----------|-----------|--------|-----------|
| Search functionality | P1 | Frontend | ✅ | 1-2 hrs |
| Image upload & drag-drop | P1 | Frontend | ✅ | 2-3 hrs |
| Notification system | P1 | Frontend | ✅ | 1-2 hrs |
| Keyboard shortcuts | P1 | Frontend | ✅ | 1-2 hrs |
| Preload security | P2 | Main | ❌ | 1-2 hrs |
| File watcher | P2 | Backend | ❌ | 1-2 hrs |
| Settings UI | P2 | Frontend | ❌ | 2-3 hrs |
| Export functionality | P2 | Backend | ❌ | 2-3 hrs |
| Folder organization | P3 | Frontend | ❌ | 2-3 hrs |
| Theme toggle | P3 | Frontend | ❌ | 1 hr |
| Error handling | I | Both | ⚠️ | 1-2 hrs |
| Build script | I | Main | ❌ | 1 hr |
| Tests (frontend) | T | Frontend | ❌ | 2-3 hrs |
| Tests (backend) | T | Backend | ❌ | 2-3 hrs |
| GitHub Actions | D | DevOps | ❌ | 1-2 hrs |

---

## 🔗 USEFUL RESOURCES

- [Electron Docs](https://www.electronjs.org/docs)
- [React Hooks Guide](https://react.dev/reference/react/hooks)
- [Express.js Guide](https://expressjs.com/)
- [markdown-it Documentation](https://markdown-it.github.io/)
- [Electron Builder Guide](https://www.electron.build/)

---

## ⚠️ IMPORTANT NOTES FOR GEMINI CLI

1. **Preserve Existing Code**: Don't overwrite files without checking first
2. **Follow Style**: Match existing code formatting and patterns
3. **Add Comments**: Include JSDoc/comments for complex logic
4. **Error Messages**: Make errors user-friendly and helpful
5. **Testing**: Include basic tests for critical functions
6. **Security**: Validate all user inputs, sanitize file paths
7. **Performance**: Debounce/throttle expensive operations
8. **Accessibility**: Use semantic HTML, ARIA labels where needed

---

**Generated**: 2026-01-24
**For**: Acropad Electron Migration Project
**Contact**: For questions or task clarifications, refer to COMPATIBILITY_ANALYSIS.md
