import React, { useRef } from 'react';
import { FileText, ChevronRight } from 'lucide-react';

function Editor({ content, onContentChange, fileName, fontSize, onContextMenu }) {
  const textareaRef = useRef(null);

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = 
      content.substring(0, start) + 
      text + 
      content.substring(end);
    
    onContentChange(newContent);
    
    // Restore cursor position after render (approximate)
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        const lineStart = content.lastIndexOf('\n', start - 1) + 1;
        const lineContent = content.substring(lineStart);
        
        if (lineContent.startsWith('  ')) {
          const newContent = content.substring(0, lineStart) + content.substring(lineStart + 2);
          onContentChange(newContent);
          setTimeout(() => {
            textarea.selectionStart = Math.max(lineStart, start - 2);
            textarea.selectionEnd = Math.max(lineStart, end - 2);
          }, 0);
        }
      } else {
        const spaces = '  ';
        const newContent = content.substring(0, start) + spaces + content.substring(end);
        onContentChange(newContent);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selection = content.substring(start, end);
      
      let newText;
      if (selection.startsWith('<!-- ') && selection.endsWith(' -->')) {
        newText = selection.substring(5, selection.length - 4);
      } else {
        newText = `<!-- ${selection} -->`;
      }
      
      const newContent = content.substring(0, start) + newText + content.substring(end);
      onContentChange(newContent);
      setTimeout(() => {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + newText.length;
      }, 0);
    }
  };

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      const markdown = `![${file.name}](${base64})`;
      insertAtCursor(markdown);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        handleImageFile(file);
        break;
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-breadcrumb">
          <FileText size={14} />
          <span>Notes</span>
          <ChevronRight size={14} />
          <span className="editor-filename">{fileName || 'Untitled'}</span>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        className="editor"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onContextMenu={onContextMenu}
        placeholder="Start writing... (Drag & Drop images supported)"
        style={{ fontSize: `${fontSize || 14}px` }}
      />
    </div>
  );
}

export default Editor;