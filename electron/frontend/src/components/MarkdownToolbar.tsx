import React, { FC, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  LinkIcon,
} from 'lucide-react';

interface MarkdownToolbarProps {
  onInsert: (before: string, after: string, newline?: boolean) => void;
  onLink: () => void;
}

export const MarkdownToolbar: FC<MarkdownToolbarProps> = ({ onInsert, onLink }) => {
  const tools = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => onInsert('**', '**'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => onInsert('*', '*'),
    },
    {
      icon: Heading2,
      label: 'Heading',
      action: () => onInsert('## ', '', true),
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => onInsert('> ', '', true),
    },
    {
      icon: Code,
      label: 'Code Block',
      action: () => onInsert('```\n', '\n```', true),
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => onInsert('- ', '', true),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => onInsert('1. ', '', true),
    },
    {
      icon: LinkIcon,
      label: 'Internal Link',
      action: () => onInsert('[[', ']]'),
    },
  ];

  return (
    <div className="markdown-toolbar">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.label}
            className="toolbar-btn"
            onClick={tool.action}
            title={tool.label}
            aria-label={tool.label}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
};
