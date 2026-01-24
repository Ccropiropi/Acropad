const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const { renderMarkdown } = require('./services/markdown-service');
const { fileOperations } = require('./services/file-service');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/files', require('./routes/files'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/render', require('./routes/render'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Acropad Backend running on http://localhost:${PORT}`);
});

module.exports = app;
