import React, { FC, useCallback } from 'react';
import { Search, Plus, Settings, X } from 'lucide-react';
import { Note } from '../types';

interface NoteListPanelProps {
  notes: Note[];
  currentNote: Note | null;
  searchQuery: string;
  loading: boolean;
  onNoteSelect: (note: Note) => void;
  onCreateNote: () => void;
  onSearchChange: (query: string) => void;
  onOpenSettings: () => void;
  onContextMenu?: (e: React.MouseEvent, note: Note) => void;
}

export const NoteListPanel: FC<NoteListPanelProps> = ({
  notes,
  currentNote,
  searchQuery,
  loading,
  onNoteSelect,
  onCreateNote,
  onSearchChange,
  onOpenSettings,
  onContextMenu,
}) => {
  const filteredNotes = notes.filter(note =>
    note.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClearSearch = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <h1>Acropad</h1>
        </div>

        <button className="btn btn-primary" onClick={onCreateNote}>
          <Plus size={16} />
          <span>New Note</span>
        </button>

        <div className="search-container">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search notes..."
            className="input search-bar"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search notes"
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="file-list">
        {loading ? (
          <div className="loading">
            <span>Loading notes...</span>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="empty">
            <span>{searchQuery ? 'No results' : 'No notes yet'}</span>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.path}
              className={`file-item ${currentNote?.path === note.path ? 'active' : ''}`}
              onClick={() => onNoteSelect(note)}
              onContextMenu={(e) => onContextMenu?.(e, note)}
            >
              <span className="file-name">{note.name}</span>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button className="btn-icon" onClick={onOpenSettings} aria-label="Settings">
          <Settings size={18} />
        </button>
        <div className="version">v2.0.0</div>
      </div>
    </div>
  );
};
