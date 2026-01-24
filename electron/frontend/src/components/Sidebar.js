import React, { useState } from 'react';
import { File, Plus, Search, X, Settings } from 'lucide-react';

function Sidebar({ files, onFileSelect, onCreateNote, currentFile, loading, onContextMenu, onOpenSettings }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter files based on search query
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <span>Acropad</span>
        </div>
        
        <button className="btn btn-primary" onClick={onCreateNote}>
          <Plus size={16} /> New Note
        </button>

        <div className="search-container">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            className="input search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            <span style={{ fontSize: '12px' }}>Loading files...</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="empty">
            <span style={{ fontSize: '12px' }}>
              {searchQuery ? 'No results' : 'No notes yet'}
            </span>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.path}
              className={`file-item ${currentFile?.path === file.path ? 'active' : ''}`}
              onClick={() => onFileSelect(file)}
              onContextMenu={(e) => onContextMenu(e, file)}
            >
              <File size={14} className="file-icon" />
              <span>{file.name}</span>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button className="btn-icon" onClick={onOpenSettings} aria-label="Settings">
          <Settings size={18} />
        </button>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          v1.0.0
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
