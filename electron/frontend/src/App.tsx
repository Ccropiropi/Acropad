import React, { useState, useEffect, useCallback, useMemo, ReactElement, Suspense } from 'react';
import './App.css';

import { Note } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NoteListPanel } from './components/NoteListPanel';
import { Backlinks } from './components/Backlinks';
import { QuickSwitcher } from './components/QuickSwitcher';
import { NotificationProvider, useNotification } from './hooks/useNotification';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { noteService } from './services/noteService';
import { linkService } from './services/linkService';

// Lazy load existing JS components  
const Editor = React.lazy(() => import('./components/Editor'));
const Preview = React.lazy(() => import('./components/Preview'));
const Notification = React.lazy(() => import('./components/Notification'));
const ContextMenu = React.lazy(() => import('./components/ContextMenu'));
const SettingsModal = React.lazy(() => import('./components/SettingsModal'));

function AppContent() {
  const { addNotification } = useNotification();

  // Core state
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [notesDir, setNotesDir] = useState<string | null>(null);

  // UI state
  const [contextMenu, setContextMenu] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Settings
  const [settings, setSettings] = useState({
    theme: 'dark' as 'dark' | 'light',
    fontSize: 14,
    fontFamily: 'system-ui',
  });

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Load Settings
  useEffect(() => {
    const saved = localStorage.getItem('acropad-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse settings:', err);
      }
    }
  }, []);

  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        const dir = await (window as any).api?.getNotesDir?.() || `${process.env.HOME}/notes`;
        setNotesDir(dir);
        await loadNotes(dir);
      } catch (err) {
        console.error('Initialization error:', err);
        addNotification('Failed to initialize app', 'error');
      }
    };
    init();
  }, [addNotification]);

  // Load notes
  const loadNotes = useCallback(
    async (dir: string) => {
      try {
        setLoading(true);
        const fileList = await noteService.listFiles(dir);
        setNotes(fileList.map(f => ({ ...f, id: f.name.replace('.md', '') })));
      } catch (err) {
        console.error('Load notes error:', err);
        addNotification('Failed to load notes', 'error');
      } finally {
        setLoading(false);
      }
    },
    [addNotification]
  );

  // Select note
  const handleSelectNote = useCallback(
    async (note: Note) => {
      try {
        setLoading(true);
        const content = await noteService.readFile(note.path);
        setCurrentNote(note);
        setContent(content);
        
        // Extract metadata
        const links = linkService.extractLinks(content);
        const tags = linkService.extractTags(content);
        
        // Render preview
        const html = await noteService.renderMarkdown(content);
        setPreviewHtml(html);
      } catch (err) {
        console.error('Select note error:', err);
        addNotification(`Failed to open ${note.name}`, 'error');
      } finally {
        setLoading(false);
      }
    },
    [addNotification]
  );

  // Update content
  const handleContentChange = useCallback(async (newContent: string) => {
    setContent(newContent);
    try {
      const html = await noteService.renderMarkdown(newContent);
      setPreviewHtml(html);
    } catch (err) {
      console.error('Render error:', err);
    }
  }, []);

  // Save note
  const handleSave = useCallback(
    async (showToast = false) => {
      if (!currentNote || !notesDir) return;
      try {
        await noteService.writeFile(currentNote.path, content);
        if (showToast) {
          addNotification('Saved', 'success', 2000);
        }
      } catch (err) {
        console.error('Save error:', err);
        addNotification('Failed to save', 'error');
      }
    },
    [currentNote, content, notesDir, addNotification]
  );

  // Create note
  const handleCreateNote = useCallback(async () => {
    if (!notesDir) return;
    try {
      const newNote = await noteService.createFile(notesDir);
      await handleSelectNote(newNote);
      await loadNotes(notesDir);
      addNotification('New note created', 'success');
    } catch (err) {
      console.error('Create error:', err);
      addNotification('Failed to create note', 'error');
    }
  }, [notesDir, handleSelectNote, loadNotes, addNotification]);

  // Delete note
  const handleDeleteNote = useCallback(
    async (note: Note) => {
      if (!window.confirm(`Delete "${note.name}"?`)) return;
      if (!notesDir) return;

      try {
        await noteService.deleteFile(note.path);
        if (currentNote?.path === note.path) {
          setCurrentNote(null);
          setContent('');
          setPreviewHtml('');
        }
        await loadNotes(notesDir);
        addNotification('Deleted', 'success');
      } catch (err) {
        console.error('Delete error:', err);
        addNotification('Failed to delete', 'error');
      }
    },
    [currentNote, notesDir, loadNotes, addNotification]
  );

  // Update settings
  const handleUpdateSettings = useCallback((key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('acropad-settings', JSON.stringify(newSettings));
  }, [settings]);

  // Context menu
  const handleContextMenu = (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      options: [
        { label: 'Delete', icon: 'delete', danger: true, action: () => handleDeleteNote(note) },
      ],
    });
  };

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentNote && content) {
        handleSave(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentNote, content, handleSave]);

  // Keyboard shortcuts
  const keyMap = useMemo(
    () => ({
      'Ctrl+S': () => handleSave(true),
      'Ctrl+N': () => handleCreateNote(),
      'Ctrl+K': () => setShowQuickSwitcher(true),
      'Escape': () => {
        setShowQuickSwitcher(false);
        setContextMenu(null);
      },
    }),
    [handleSave, handleCreateNote]
  );

  useKeyboardShortcuts(keyMap);

  return (
    <div className="app">
      <div className="container">
        <NoteListPanel
          notes={notes}
          currentNote={currentNote}
          searchQuery={searchQuery}
          loading={loading}
          onNoteSelect={handleSelectNote}
          onCreateNote={handleCreateNote}
          onSearchChange={setSearchQuery}
          onOpenSettings={() => setShowSettings(true)}
          onContextMenu={handleContextMenu}
        />

        <div className="editor-preview-container">
          <Suspense fallback={<div style={{ padding: '20px', color: 'var(--text-muted)' }}>Loading...</div>}>
            <Editor
              content={content}
              onContentChange={handleContentChange}
              fileName={currentNote?.name}
              fontSize={settings.fontSize}
              onContextMenu={(e: any) => e}
            />
            <Preview html={previewHtml} />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <Backlinks
            currentNote={currentNote}
            allNotes={notes}
            onNoteClick={handleSelectNote}
          />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <Notification />
        
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            options={contextMenu.options}
            onClose={() => setContextMenu(null)}
          />
        )}

        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        <QuickSwitcher
          notes={notes}
          isOpen={showQuickSwitcher}
          onClose={() => setShowQuickSwitcher(false)}
          onSelectNote={handleSelectNote}
        />
      </Suspense>
    </div>
  );
}

export default function App(): ReactElement {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { addNotification } = useNotification();

  // Core state
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [notesDir, setNotesDir] = useState<string | null>(null);

  // UI state
  const [contextMenu, setContextMenu] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Settings
  const [settings, setSettings] = useState({
    theme: 'dark' as 'dark' | 'light',
    fontSize: 14,
    fontFamily: 'system-ui',
  });

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Load Settings
  useEffect(() => {
    const saved = localStorage.getItem('acropad-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse settings:', err);
      }
    }
  }, []);

  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        const dir = await window.api?.getNotesDir?.() || `${process.env.HOME}/notes`;
        setNotesDir(dir);
        await loadNotes(dir);
      } catch (err) {
        console.error('Initialization error:', err);
        addNotification('Failed to initialize app', 'error');
      }
    };
    init();
  }, [addNotification]);

  // Load notes
  const loadNotes = useCallback(
    async (dir: string) => {
      try {
        setLoading(true);
        const fileList = await noteService.listFiles(dir);
        setNotes(fileList.map(f => ({ ...f, id: f.name.replace('.md', '') })));
      } catch (err) {
        console.error('Load notes error:', err);
        addNotification('Failed to load notes', 'error');
      } finally {
        setLoading(false);
      }
    },
    [addNotification]
  );

  // Select note
  const handleSelectNote = useCallback(
    async (note: Note) => {
      try {
        setLoading(true);
        const content = await noteService.readFile(note.path);
        setCurrentNote(note);
        setContent(content);
        
        // Extract metadata
        const links = linkService.extractLinks(content);
        const tags = linkService.extractTags(content);
        
        // Render preview
        const html = await noteService.renderMarkdown(content);
        setPreviewHtml(html);
      } catch (err) {
        console.error('Select note error:', err);
        addNotification(`Failed to open ${note.name}`, 'error');
      } finally {
        setLoading(false);
      }
    },
    [addNotification]
  );

  // Update content
  const handleContentChange = useCallback(async (newContent: string) => {
    setContent(newContent);
    try {
      const html = await noteService.renderMarkdown(newContent);
      setPreviewHtml(html);
    } catch (err) {
      console.error('Render error:', err);
    }
  }, []);

  // Save note
  const handleSave = useCallback(
    async (showToast = false) => {
      if (!currentNote || !notesDir) return;
      try {
        await noteService.writeFile(currentNote.path, content);
        if (showToast) {
          addNotification('Saved', 'success', 2000);
        }
      } catch (err) {
        console.error('Save error:', err);
        addNotification('Failed to save', 'error');
      }
    },
    [currentNote, content, notesDir, addNotification]
  );

  // Create note
  const handleCreateNote = useCallback(async () => {
    if (!notesDir) return;
    try {
      const newNote = await noteService.createFile(notesDir);
      await handleSelectNote(newNote);
      await loadNotes(notesDir);
      addNotification('New note created', 'success');
    } catch (err) {
      console.error('Create error:', err);
      addNotification('Failed to create note', 'error');
    }
  }, [notesDir, handleSelectNote, loadNotes, addNotification]);

  // Delete note
  const handleDeleteNote = useCallback(
    async (note: Note) => {
      if (!window.confirm(`Delete "${note.name}"?`)) return;
      if (!notesDir) return;

      try {
        await noteService.deleteFile(note.path);
        if (currentNote?.path === note.path) {
          setCurrentNote(null);
          setContent('');
          setPreviewHtml('');
        }
        await loadNotes(notesDir);
        addNotification('Deleted', 'success');
      } catch (err) {
        console.error('Delete error:', err);
        addNotification('Failed to delete', 'error');
      }
    },
    [currentNote, notesDir, loadNotes, addNotification]
  );

  // Update settings
  const handleUpdateSettings = useCallback((key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('acropad-settings', JSON.stringify(newSettings));
  }, [settings]);

  // Context menu
  const handleContextMenu = (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      options: [
        { label: 'Delete', icon: 'delete', danger: true, action: () => handleDeleteNote(note) },
      ],
    });
  };

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentNote && content) {
        handleSave(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentNote, content, handleSave]);

  // Keyboard shortcuts
  const keyMap = useMemo(
    () => ({
      'Ctrl+S': () => handleSave(true),
      'Ctrl+N': () => handleCreateNote(),
      'Ctrl+K': () => setShowQuickSwitcher(true),
      'Escape': () => {
        setShowQuickSwitcher(false);
        setContextMenu(null);
      },
    }),
    [handleSave, handleCreateNote]
  );

  useKeyboardShortcuts(keyMap);

  return (
    <div className="app">
      <div className="container">
        <NoteListPanel
          notes={notes}
          currentNote={currentNote}
          searchQuery={searchQuery}
          loading={loading}
          onNoteSelect={handleSelectNote}
          onCreateNote={handleCreateNote}
          onSearchChange={setSearchQuery}
          onOpenSettings={() => setShowSettings(true)}
          onContextMenu={handleContextMenu}
        />

        <div className="editor-preview-container">
          <React.Suspense fallback={<div>Loading...</div>}>
            <Editor
              content={content}
              onContentChange={handleContentChange}
              fileName={currentNote?.name}
              fontSize={settings.fontSize}
              onContextMenu={(e: any) => e}
            />
            <Preview html={previewHtml} />
          </React.Suspense>
        </div>

        <React.Suspense fallback={null}>
          <Backlinks
            currentNote={currentNote}
            allNotes={notes}
            onNoteClick={handleSelectNote}
          />
        </React.Suspense>
      </div>

      <React.Suspense fallback={null}>
        <Notification />
        
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            options={contextMenu.options}
            onClose={() => setContextMenu(null)}
          />
        )}

        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        <QuickSwitcher
          notes={notes}
          isOpen={showQuickSwitcher}
          onClose={() => setShowQuickSwitcher(false)}
          onSelectNote={handleSelectNote}
        />
      </React.Suspense>
    </div>
  );
}

export default function App(): ReactElement {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ErrorBoundary>
  );
}
