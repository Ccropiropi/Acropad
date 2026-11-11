import { useEffect, useRef } from 'react';

type KeyMap = Record<string, (event?: KeyboardEvent) => void>;

export function useKeyboardShortcuts(keyMap: KeyMap): void {
  const keyMapRef = useRef(keyMap);

  useEffect(() => {
    keyMapRef.current = keyMap;
  }, [keyMap]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't capture shortcuts in input/textarea unless it's a special command
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;

      let keyCombo = '';
      if (isCmdOrCtrl) keyCombo += 'Ctrl+';
      if (event.shiftKey) keyCombo += 'Shift+';
      if (event.altKey) keyCombo += 'Alt+';

      // Handle characters vs special keys
      if (event.key.length === 1) {
        keyCombo += event.key.toUpperCase();
      } else {
        keyCombo += event.key;
      }

      // Skip shortcuts in inputs unless it's Ctrl+S or similar important commands
      if (isInput && !['Ctrl+S', 'Ctrl+N', 'Escape'].includes(keyCombo)) {
        return;
      }

      const action = keyMapRef.current[keyCombo];
      if (action) {
        event.preventDefault();
        action(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
