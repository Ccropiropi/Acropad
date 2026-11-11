# Acropad Electron Version

This is the Electron-based rewrite of Acropad, replacing the PyQt6 desktop application with a modern web-based stack.

## Architecture

```
electron/
├── main/                    # Electron main process
│   ├── main.js             # App entry, window creation, IPC
│   └── preload.js          # Secure context bridge
├── backend/                 # Node.js Express server
│   ├── server.js           # Express app setup
│   ├── services/           # Business logic
│   │   ├── markdown-service.js
│   │   └── file-service.js
│   └── routes/             # API endpoints
│       ├── files.js
│       ├── render.js
│       └── notes.js
└── frontend/               # React application
    ├── src/
    │   ├── App.js
    │   ├── components/
    │   │   ├── Sidebar.js
    │   │   ├── Editor.js
    │   │   └── Preview.js
    │   └── index.js
    └── public/
        └── index.html
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd electron
npm run install-deps
```

This will install dependencies for:
- Root package (Electron, build tools)
- Backend (`electron/backend/`)
- Frontend (`electron/frontend/`)

### Development

```bash
# Start in development mode (runs backend + frontend dev server)
npm run dev

# Or run separately in different terminals:
# Terminal 1
npm run backend

# Terminal 2
npm run frontend

# Terminal 3 (launch Electron app)
npm start
```

### Building

```bash
npm run build
```

This will:
1. Build React frontend to `frontend/build/`
2. Package with electron-builder
3. Create installers in `dist/`

## API Endpoints

### File Operations
- `POST /api/files/read` - Read file content
- `POST /api/files/write` - Write file content
- `GET /api/files/list/:basePath` - List files in directory
- `POST /api/files/create` - Create new file
- `DELETE /api/files/delete` - Delete file

### Markdown Rendering
- `POST /api/render` - Render markdown to HTML

## Documentation

- [COMPATIBILITY_ANALYSIS.md](./COMPATIBILITY_ANALYSIS.md) - PyQt6 vs Electron comparison
- [GEMINI_CLI_FEATURE_GUIDE.md](./GEMINI_CLI_FEATURE_GUIDE.md) - Tasks for AI code generation

## Key Features

✅ **Implemented**:
- Split-view editor + preview
- Markdown rendering with LaTeX support
- File browser sidebar
- Auto-save (2s interval)
- Dark theme
- Create/read/write notes

⚠️ **In Progress**:
- Search functionality
- Image upload
- Notifications
- Keyboard shortcuts

❌ **Not Yet Started**:
- Export (PDF, HTML)
- Settings UI
- File watcher
- Folder organization

## Migration Notes

See [COMPATIBILITY_ANALYSIS.md](./COMPATIBILITY_ANALYSIS.md) for:
- What's compatible from PyQt6
- What needs refactoring
- Known issues
- Next steps

## Performance

- **Binary Size**: ~300MB (vs ~500MB PyQt6)
- **Startup Time**: ~2s (Electron + backend initialization)
- **Memory Usage**: ~150-200MB at idle
- **Render**: Real-time preview with 300ms debounce

## Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Troubleshooting

### Backend won't start
```bash
cd backend
npm install
node server.js
```

### React won't start
```bash
cd frontend
npm install
npm start
```

### Electron won't connect to backend
- Ensure backend is running on port 5000
- Check `electron/main/main.js` for correct API base URL
- Look at Electron console for network errors

## License

MIT - Same as original Acropad project
