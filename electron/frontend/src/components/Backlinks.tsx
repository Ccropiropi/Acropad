import React, { FC, useMemo } from 'react';
import { Link, ArrowRight } from 'lucide-react';
import { Note } from '../types';
import { linkService } from '../services/linkService';

interface BacklinksProps {
  currentNote: Note | null;
  allNotes: Note[];
  onNoteClick: (note: Note) => void;
}

export const Backlinks: FC<BacklinksProps> = ({ currentNote, allNotes, onNoteClick }) => {
  const backlinks = useMemo(() => {
    if (!currentNote) return [];
    return linkService.findBacklinks(currentNote.name.replace('.md', ''), allNotes);
  }, [currentNote, allNotes]);

  if (!currentNote) {
    return (
      <div className="panel backlinks-panel">
        <div className="panel-header">
          <Link size={16} />
          <h3>Backlinks</h3>
        </div>
        <div className="panel-empty">Select a note to see backlinks</div>
      </div>
    );
  }

  return (
    <div className="panel backlinks-panel">
      <div className="panel-header">
        <Link size={16} />
        <h3>Backlinks ({backlinks.length})</h3>
      </div>

      {backlinks.length === 0 ? (
        <div className="panel-empty">No notes link to this note</div>
      ) : (
        <div className="backlinks-list">
          {backlinks.map(note => (
            <button
              key={note.path}
              className="backlink-item"
              onClick={() => onNoteClick(note)}
              title={note.path}
            >
              <ArrowRight size={12} />
              <span>{note.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
