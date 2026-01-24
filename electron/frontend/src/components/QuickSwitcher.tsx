import React, { FC, useState, useEffect, useRef } from 'react';
import { Command, X } from 'lucide-react';
import { Note } from '../types';

interface QuickSwitcherProps {
  notes: Note[];
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (note: Note) => void;
}

export const QuickSwitcher: FC<QuickSwitcherProps> = ({
  notes,
  isOpen,
  onClose,
  onSelectNote,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? notes.filter(note =>
        note.name.toLowerCase().includes(query.toLowerCase())
      )
    : notes;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onSelectNote(filtered[selectedIndex]);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="quick-switcher-overlay" onClick={onClose}>
      <div className="quick-switcher" onClick={(e) => e.stopPropagation()}>
        <div className="quick-switcher-header">
          <Command size={18} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="quick-switcher-input"
          />
          <button onClick={onClose} className="quick-switcher-close">
            <X size={16} />
          </button>
        </div>

        <div className="quick-switcher-results">
          {filtered.length === 0 ? (
            <div className="quick-switcher-empty">No notes found</div>
          ) : (
            filtered.map((note, idx) => (
              <button
                key={note.path}
                className={`quick-switcher-item ${
                  idx === selectedIndex ? 'selected' : ''
                }`}
                onClick={() => {
                  onSelectNote(note);
                  onClose();
                }}
              >
                <span>{note.name}</span>
                <span className="path-hint">{note.path}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
