const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // File operations
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  writeFile: (path, content) => ipcRenderer.invoke('write-file', path, content),
  createFile: (name) => ipcRenderer.invoke('create-file', name),
  deleteFile: (path) => ipcRenderer.invoke('delete-file', path),
  
  // Directory operations
  listFiles: () => ipcRenderer.invoke('list-files'),
  getNotesDir: () => ipcRenderer.invoke('get-notes-dir'),
  
  // Markdown rendering
  renderMarkdown: (content) => ipcRenderer.invoke('render-markdown', content),
  
  // Dialogs
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  
  // File watching
  watchFiles: (callback) => {
    ipcRenderer.on('files-changed', (event, data) => callback(data));
  }
});
