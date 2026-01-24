import React from 'react';
import { X, Monitor, Type } from 'lucide-react';

function SettingsModal({ onClose, settings, onUpdateSettings }) {
  if (!settings) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Settings</div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          {/* Theme Section */}
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Monitor size={16} /> Theme
              </span>
            </label>
            <select 
              className="input"
              value={settings.theme} 
              onChange={(e) => onUpdateSettings('theme', e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>

          {/* Font Size Section */}
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Type size={16} /> Editor Font Size
              </span>
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="range" 
                min="12" 
                max="24" 
                step="1"
                value={settings.fontSize || 14} 
                onChange={(e) => onUpdateSettings('fontSize', parseInt(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ minWidth: '30px', textAlign: 'center' }}>
                {settings.fontSize || 14}px
              </span>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
