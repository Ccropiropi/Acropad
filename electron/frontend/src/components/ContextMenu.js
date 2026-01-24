import React, { useEffect, useRef } from 'react';
import { Trash2, Edit2, Copy, Scissors, Clipboard, FileText } from 'lucide-react';

function ContextMenu({ x, y, options, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position if it goes off screen
  const style = {
    top: y,
    left: x,
  };

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'rename': return <Edit2 size={14} />;
      case 'delete': return <Trash2 size={14} />;
      case 'copy': return <Copy size={14} />;
      case 'cut': return <Scissors size={14} />;
      case 'paste': return <Clipboard size={14} />;
      default: return <FileText size={14} />;
    }
  };

  return (
    <div className="context-menu" style={style} ref={menuRef}>
      {options.map((option, index) => (
        option.divider ? (
          <div key={index} className="context-menu-divider" />
        ) : (
          <div 
            key={index} 
            className={`context-menu-item ${option.danger ? 'danger' : ''}`}
            onClick={() => {
              option.action();
              onClose();
            }}
          >
            {getIcon(option.icon)}
            <span>{option.label}</span>
          </div>
        )
      ))}
    </div>
  );
}

export default ContextMenu;
