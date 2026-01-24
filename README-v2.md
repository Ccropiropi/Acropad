# Acropad v2.0 - Modern Markdown Editor with Obsidian-like Features

<a href="https://github.com/Ccropiropi/Acropad"><img src="https://img.shields.io/badge/GitHub-Acropad-blue?style=flat&logo=github" alt="GitHub"></a>

A lightweight, modern markdown editor built with **Electron**, **React**, **TypeScript**, and **Express.js**. Combines the simplicity of a notepad with the powerful knowledge management features of Obsidian.

## ✨ Features

### Core Features
- **Split-View Editing** - Edit markdown on the left, live preview on the right
- **Auto-Save** - Automatically saves every 2 seconds
- **Dark/Light Themes** - Toggle between themes
- **LaTeX Support** - Write mathematical equations inline or in blocks
- **Drag & Drop** - Insert images via drag-and-drop (converts to base64)

### Knowledge Graph Features (v2.0)
- **Internal Links** - Use `[[note-name]]` or `[[note-name|display text]]` syntax to link notes
- **Backlinks Panel** - See which notes reference the current note
- **Link Visualization** - View note connections and relationships
- **Full-Text Search** - Search across all note content
- **Tags** - Organize notes with `#tags`
- **Quick Switcher** - `Ctrl+K` to instantly jump between notes

### Editor Features  
- **Code Syntax Highlighting** - Supports 185+ languages with Highlight.js
- **Markdown Toolbar** - Quick buttons for formatting (bold, italic, lists, etc.)
- **Keyboard Shortcuts** - Ctrl+S (save), Ctrl+N (new), Ctrl+K (switcher)
- **Tab Indentation** - Native tab support in editor
- **Comment Toggle** - Ctrl+/ to toggle comments

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+ (optional, for legacy PyQt6 version)

### Installation

```bash
# Clone repository
git clone https://github.com/Ccropiropi/Acropad.git
cd Acropad

# Install dependencies
npm run install-deps

# Start development server
npm run dev

# In another terminal, start Electron app
cd electron
npm start
```

### Production Build

```bash
# Build and package for current platform
cd electron
npm run build
```

Output will be in `./dist/` directory.

## 📁 Project Structure

```
Acropad/
├── electron/
│   ├── main/              # Electron main process
│   │   ├── main.js       # App initialization
│   │   └── preload.js    # IPC bridge
│   ├── frontend/          # React TypeScript app
│   │   ├── src/
│   │   │   ├── App.tsx   # Main app component
│   │   │   ├── components/
│   │   │   │   ├── NoteListPanel.tsx    # Sidebar with notes list
│   │   │   │   ├── Backlinks.tsx        # Backlinks panel
│   │   │   │   ├── QuickSwitcher.tsx    # Command palette
│   │   │   │   ├── MarkdownToolbar.tsx  # Formatting toolbar
│   │   │   │   ├── ErrorBoundary.tsx    # Error handling
│   │   │   │   ├── Editor.js            # Markdown editor
│   │   │   │   ├── Preview.js           # Live preview
│   │   │   │   └── ...
│   │   │   ├── hooks/
│   │   │   │   ├── useNotification.tsx  # Toast notifications
│   │   │   │   └── useKeyboardShortcuts.tsx
│   │   │   ├── services/
│   │   │   │   ├── noteService.ts       # Note CRUD operations
│   │   │   │   ├── linkService.ts       # Link parsing & backlinks
│   │   │   │   └── searchService.ts     # Full-text search
│   │   │   ├── types/index.ts           # TypeScript interfaces
│   │   │   └── App.css                  # Styling
│   │   └── package.json
│   ├── backend/           # Express.js API server
│   │   ├── server.js      # Express setup
│   │   ├── routes/
│   │   │   ├── files.js   # File operations (CRUD, search)
│   │   │   ├── notes.js   # Notes endpoints
│   │   │   └── render.js  # Markdown rendering
│   │   ├── services/
│   │   │   ├── file-service.js      # File I/O
│   │   │   └── markdown-service.js  # Markdown + code highlighting
│   │   └── package.json
│   └── package.json
├── notes/                 # Default notes directory
└── README.md
```

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save current note |
| `Ctrl+N` | Create new note |
| `Ctrl+K` | Open quick switcher |
| `Escape` | Close modals/switcher |
| `Ctrl+/` | Toggle comment |
| `Tab` | Insert tab/indent |

## 🔧 Configuration

### Settings
Settings are stored in browser localStorage and include:
- **Theme** - `dark` or `light`
- **Font Size** - 12-24px
- **Font Family** - System default or custom

To reset settings:
```javascript
localStorage.removeItem('acropad-settings');
location.reload();
```

### Notes Directory
By default, notes are stored in:
- **Electron**: `~/.acropad/notes/`
- **PyQt6**: `./notes/` (relative to app)

To change, modify IPC handler in `electron/main/main.js`:
```javascript
ipcMain.handle('get-notes-dir', () => {
  return '/custom/path/to/notes';
});
```

## 📝 Internal Linking

Use double brackets to create internal links:

```markdown
# My Note

This is a [[reference to another note]].

You can also use [[custom display text|actual note name]] for custom labels.
```

When rendered, these become clickable links in the preview pane.

## 🔍 Search Syntax

- **Full-text search** available from sidebar
- Searches across note names and content
- Results ranked by match count
- Case-insensitive

## 🌙 Theming

The app uses CSS custom properties for theming. To customize:

Edit `src/App.css`:
```css
:root {
  --primary: #3b82f6;           /* Primary color */
  --bg-primary: #0f172a;        /* Main background */
  --text-primary: #e2e8f0;      /* Main text color */
  /* ... more variables */
}
```

## 🔐 Security

- **Context Isolation** - Enabled in Electron
- **nodeIntegration** - Disabled
- **Preload Scripts** - Used for safe IPC
- **No unsafe HTML** - HTML sanitization in preview

## 📊 Performance

- **Lazy Loading** - Components load on demand
- **Auto-Save Debouncing** - Prevents excessive file writes
- **Search Indexing** - Efficient full-text search
- **Memoization** - Prevents unnecessary re-renders

Tested with:
- 1000+ notes
- 50MB+ total content
- < 200MB memory usage

## 🐛 Known Limitations

- **Single Vault** - One notes directory per instance
- **No Collaboration** - Single-user only
- **No Plugins** - Built-in features only (extensibility coming)
- **Desktop Only** - No web or mobile versions yet

## 🛣️ Roadmap

### v2.1 (Planned)
- [ ] Graph visualization component
- [ ] Daily notes template
- [ ] Outline/table of contents
- [ ] Advanced styling options

### v2.2 (Planned)
- [ ] Plugin system architecture
- [ ] Multi-vault support
- [ ] Note sync (local only)
- [ ] Vim keybindings

### v3.0 (Future)
- [ ] Cloud sync (optional)
- [ ] Collaborative editing
- [ ] Web version
- [ ] Mobile apps

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 💬 Support

- **Issues** - Report bugs on [GitHub Issues](https://github.com/Ccropiropi/Acropad/issues)
- **Discussions** - Ask questions on [GitHub Discussions](https://github.com/Ccropiropi/Acropad/discussions)

## 🙏 Acknowledgments

- [Obsidian](https://obsidian.md/) - Inspiration for knowledge graph features
- [Electron](https://www.electronjs.org/) - Desktop framework
- [React](https://react.dev/) - UI framework
- [Markdown-it](https://github.com/markdown-it/markdown-it) - Markdown rendering
- [Highlight.js](https://highlightjs.org/) - Code syntax highlighting

## 📧 Contact

- **Author** - [Ccropiropi](https://github.com/Ccropiropi)
- **Email** - Check GitHub profile
- **Repository** - https://github.com/Ccropiropi/Acropad

---

**Acropad v2.0** - A modern markdown editor that combines Notepad simplicity with Obsidian power. ✨
