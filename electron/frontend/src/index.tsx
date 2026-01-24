import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Declare global window API
declare global {
  interface Window {
    api?: {
      getNotesDir?: () => Promise<string>;
      openFileDialog?: () => Promise<any>;
      openFolderDialog?: () => Promise<any>;
    };
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
