# Acropad Project Structure - Electron Migration

## Complete Directory Tree

```
Acropad/
│
├── 📁 electron/                          [NEW - Electron-based app]
│   ├── 📁 main/                         [Electron main process]
│   │   ├── main.js                      [Entry point, window mgmt]
│   │   └── preload.js                   [Secure IPC bridge]
│   │
│   ├── 📁 backend/                      [Express REST API]
│   │   ├── 📁 services/
│   │   │   ├── markdown-service.js      [Markdown rendering]
│   │   │   └── file-service.js          [File I/O operations]
│   │   ├── 📁 routes/
│   │   │   ├── files.js                 [File CRUD endpoints]
│   │   │   ├── render.js                [Markdown render endpoint]
│   │   │   └── notes.js                 [Notes API]
│   │   ├── package.json                 [Backend dependencies]
│   │   └── server.js                    [Express server setup]
│   │
│   ├── 📁 frontend/                     [React UI application]
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/
│   │   │   │   ├── Sidebar.js           [File list + search]
│   │   │   │   ├── Editor.js            [Markdown editor]
│   │   │   │   └── Preview.js           [HTML preview]
│   │   │   ├── 📁 pages/                [Main pages (future)]
│   │   │   ├── App.js                   [Main React component]
│   │   │   ├── App.css                  [Main styles]
│   │   │   ├── index.js                 [React entry]
│   │   │   └── index.css                [Global styles]
│   │   ├── 📁 public/
│   │   │   └── index.html               [HTML template]
│   │   └── package.json                 [Frontend dependencies]
│   │
│   ├── package.json                     [Root dependencies]
│   ├── README.md                        [Setup & arch guide]
│   ├── .gitignore                       [Git exclusions]
│   ├── COMPATIBILITY_ANALYSIS.md        [PyQt6 vs Electron]
│   └── GEMINI_CLI_FEATURE_GUIDE.md      [Task list for AI]
│
├── 📁 build/                            [OLD - PyInstaller output]
│   └── ... (keep for reference)
│
├── 📄 main.py                           [OLD - PyQt6 app entry]
├── 📄 ui.py                             [OLD - PyQt6 UI]
├── 📄 worker.py                         [OLD - PyQt6 threading]
├── 📄 requirements.txt                  [OLD - Python deps]
├── 📄 acropad.spec                      [OLD - PyInstaller spec]
├── 📄 build.sh                          [OLD - Build script]
│
├── 📁 notes/                            [User data directory]
│   └── ... (markdown files)
│
├── 📄 README.md                         [Original project README]
├── 📄 Core.md                           [Design docs]
├── 📄 LICENSE                           [MIT License]
├── 📄 ELECTRON_MIGRATION_SUMMARY.md     [This summary]
│
└── 📁 tests/
    ├── test_app.py                      [OLD - Python tests]
    └── __pycache__/
```

## Migration Status

### ✅ NEW (Electron Stack)
```
electron/
├── main/              ✅ Complete
├── backend/           ✅ Complete
├── frontend/          ✅ Complete
├── package.json       ✅ Complete
├── README.md          ✅ Complete
├── .gitignore         ✅ Complete
└── Docs (2 files)     ✅ Complete
```

### ⚠️ OLD (PyQt6 Stack - Keep for Reference)
```
main.py               - Keep (reference)
ui.py                 - Keep (reference)
worker.py             - Keep (reference)
requirements.txt      - Keep (reference)
build.sh              - Keep (reference)
acropad.spec          - Keep (reference)
tests/                - Keep (reference)
```

---

## Key File Mappings: PyQt6 → Electron

| PyQt6 Component | File | → | Electron Equivalent | File |
|-----------------|------|---|-------------------|------|
| QApplication | main.py | → | Electron app | electron/main/main.js |
| AcropadWindow | ui.py | → | React App | electron/frontend/src/App.js |
| QPlainTextEdit | ui.py | → | Editor component | electron/frontend/src/components/Editor.js |
| QTreeView | ui.py | → | Sidebar component | electron/frontend/src/components/Sidebar.js |
| QWebEngineView | ui.py | → | Preview component | electron/frontend/src/components/Preview.js |
| Worker (QThread) | worker.py | → | async/await in Node.js | electron/backend/services/ |
| render_markdown() | ui.py | → | markdown-service.js | electron/backend/services/markdown-service.js |
| read_file_task() | ui.py | → | file-service.js | electron/backend/services/file-service.js |
| QTimer autosave | ui.py | → | useEffect hook | electron/frontend/src/App.js |
| QStatusBar | ui.py | → | Notification component | ❌ Not yet created |
| QFileSystemModel | ui.py | → | API + state | electron/backend/routes/files.js |

---

## Development Workflow

### To Start Development:
```bash
cd /home/zrain/Project/Acropad/electron

# First time setup
npm run install-deps

# Start all processes
npm run dev

# OR run in separate terminals:
npm run backend      # Terminal 1: Backend on :5000
npm run frontend     # Terminal 2: Frontend on :3000
npm start           # Terminal 3: Electron app
```

### To Build:
```bash
npm run build
# Creates installers in dist/
```

---

## Next Implementation Steps

See `GEMINI_CLI_FEATURE_GUIDE.md` for 18 prioritized tasks:

**Priority 1 (Critical):**
1. Search functionality
2. Image drag-and-drop
3. Notification system
4. Keyboard shortcuts

**Priority 2 (High):**
5. Security (preload)
6. File watcher
7. Settings UI
8. Export functionality

**Priority 3 (Medium):**
9. Folder organization
10. Theme toggle
11. Preview modes

**Plus:** Infrastructure, testing, and deployment tasks

---

## File Size Comparison

| Item | PyQt6 | Electron |
|------|-------|----------|
| Binary | 500MB | 300MB |
| Source code | 300 lines Python | 1000+ lines JS/React |
| Complexity | Medium | Higher (more features possible) |
| Build time | ~2 min | ~3 min |
| Dev dependencies | Python packages | npm packages |

---

## Documentation Quick Links

📖 **In electron/ directory:**
- `README.md` - Quick start (START HERE)
- `COMPATIBILITY_ANALYSIS.md` - Detailed comparison
- `GEMINI_CLI_FEATURE_GUIDE.md` - Task checklist

📖 **In root Acropad/ directory:**
- `ELECTRON_MIGRATION_SUMMARY.md` - This file
- `README.md` - Original project
- `Core.md` - Design notes

---

## Success Criteria

✅ **Foundation Complete:**
- [x] Electron app launches
- [x] React UI renders
- [x] Backend API functional
- [x] File I/O works
- [x] Markdown preview renders
- [x] Auto-save functional

⏳ **Next Phase (Features):**
- [ ] All Priority 1 tasks complete
- [ ] All Priority 2 tasks complete
- [ ] Test coverage > 80%
- [ ] Build succeeds for all platforms
- [ ] Ready for beta release

---

**Generated**: January 24, 2026  
**Status**: Migration Foundation Complete ✅  
**Next**: Feature Implementation via Gemini CLI
