import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './App.css';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Notification from './components/Notification';
import ContextMenu from './components/ContextMenu';
import SettingsModal from './components/SettingsModal';
import { useNotification } from './hooks/useNotification';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const { addNotification } = useNotification();
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [content, setContent] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [notesDir, setNotesDir] = useState(null);
  
  // UI States
  const [contextMenu, setContextMenu] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'dark',
    fontSize: 14
  });

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Load Settings from LocalStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('acropad-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Update Settings
  const handleUpdateSettings = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('acropad-settings', JSON.stringify(newSettings));
  };

  // Initialize notes directory
  useEffect(() => {
    const initDir = async () => {
      try {
        const dir = await window.api.getNotesDir();
        setNotesDir(dir);
        loadFiles(dir);
      } catch (err) {
        console.error('Failed to get notes directory:', err);
        addNotification('Failed to access notes directory', 'error');
      }
    };
    initDir();
  }, [addNotification]);

  // Load files from directory
  const loadFiles = useCallback(async (dir) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/files/list/${encodeURIComponent(dir)}`);
      setFiles(response.data.files || []);
    } catch (err) {
      console.error('Failed to load files:', err);
      addNotification('Failed to load file list', 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Read file
  const handleFileSelect = useCallback(async (file) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/files/read`, { path: file.path });
      setCurrentFile(file);
      setContent(response.data.content);
    } catch (err) {
      console.error('Failed to read file:', err);
      addNotification(`Failed to open ${file.name}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Update preview
  const handleContentChange = useCallback(async (newContent) => {
    setContent(newContent);
    try {
      const response = await axios.post(`${API_BASE}/render`, { content: newContent });
      setPreviewHtml(response.data.html);
    } catch (err) {
      console.error('Failed to render markdown:', err);
    }
  }, []);

  // Save file
  const handleSave = useCallback(async (showToast = false) => {
    if (!currentFile) return;
    try {
      await axios.post(`${API_BASE}/files/write`, {
        path: currentFile.path,
        content: content
      });
      if (showToast) {
        addNotification('File saved successfully', 'success', 2000);
      }
    } catch (err) {
      console.error('Failed to save file:', err);
      addNotification('Failed to save file', 'error');
    }
  }, [currentFile, content, addNotification]);

  // Create new note
  const handleCreateNote = useCallback(async () => {
    try {
      const response = await axios.post(`${API_BASE}/files/create`, {
        basePath: notesDir,
        filename: null
      });
      setCurrentFile({ name: response.data.filename, path: response.data.path });
      setContent('# New Note\n\nStart writing here...');
      setPreviewHtml('');
      loadFiles(notesDir);
      addNotification('New note created', 'success');
    } catch (err) {
      console.error('Failed to create note:', err);
      addNotification('Failed to create note', 'error');
    }
  }, [notesDir, loadFiles, addNotification]);

  // Delete file
  const handleDeleteFile = async (file) => {
    if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      try {
        await axios.delete(`${API_BASE}/files/delete`, { data: { path: file.path } });
        loadFiles(notesDir);
        if (currentFile?.path === file.path) {
          setCurrentFile(null);
          setContent('');
          setPreviewHtml('');
        }
        addNotification('File deleted', 'success');
      } catch (err) {
        console.error('Failed to delete file:', err);
        addNotification('Failed to delete file', 'error');
      }
    }
  };

  // Context Menu Handlers
  const handleContextMenu = (event, file) => {
    event.preventDefault();
    if (file) {
      // Sidebar item context menu
      setContextMenu({
        x: event.pageX,
        y: event.pageY,
        options: [
          { label: 'Rename (Coming Soon)', icon: 'rename', action: () => alert('Rename not implemented yet') },
          { divider: true },
          { label: 'Delete', icon: 'delete', danger: true, action: () => handleDeleteFile(file) }
        ]
      });
    } else {
      // Editor context menu
      setContextMenu({
        x: event.pageX,
        y: event.pageY,
        options: [
          { label: 'Cut', icon: 'cut', action: () => document.execCommand('cut') },
          { label: 'Copy', icon: 'copy', action: () => document.execCommand('copy') },
          { label: 'Paste', icon: 'paste', action: () => navigator.clipboard.readText().then(t => document.execCommand('insertText', false, t)) }
        ]
      });
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentFile && content) {
        handleSave(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentFile, content, handleSave]);

  // Keyboard Shortcuts
  const keyMap = useMemo(() => ({
    'Ctrl+S': () => handleSave(true),
    'Ctrl+N': () => handleCreateNote(),
  }), [handleSave, handleCreateNote]);

  useKeyboardShortcuts(keyMap);

  return (
    <div className="app">
      <div className="container">
        <Sidebar
          files={files}
          onFileSelect={handleFileSelect}
          onCreateNote={handleCreateNote}
          currentFile={currentFile}
          loading={loading}
          onContextMenu={handleContextMenu}
          onOpenSettings={() => setShowSettings(true)}
        />
        <div className="editor-preview">
          <Editor
            content={content}
            onContentChange={handleContentChange}
            fileName={currentFile?.name}
            fontSize={settings.fontSize}
            onContextMenu={(e) => handleContextMenu(e, null)}
          />
          <Preview html={previewHtml} />
        </div>
      </div>
      
      <Notification />
      
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={contextMenu.options}
          onClose={handleCloseContextMenu}
        />
      )}

      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      )}
    </div>
  );
}

export default App;