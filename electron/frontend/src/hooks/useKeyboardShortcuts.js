import { useEffect, useRef } from 'react';

export function useKeyboardShortcuts(keyMap) {
  const keyMapRef = useRef(keyMap);

  useEffect(() => {
    keyMapRef.current = keyMap;
  }, [keyMap]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      
      let keyCombo = '';
      if (isCmdOrCtrl) keyCombo += 'Ctrl+';
      if (event.shiftKey) keyCombo += 'Shift+';
      if (event.altKey) keyCombo += 'Alt+';
      
      // Handle characters vs special keys
      if (event.key.length === 1) {
        keyCombo += event.key.toUpperCase();
      } else {
        // Keep special keys as-is (e.g. "Enter", "Tab", "Escape")
        keyCombo += event.key;
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