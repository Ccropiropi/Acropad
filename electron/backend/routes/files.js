const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const { fileOperations } = require('../services/file-service');

// Read file
router.post('/read', async (req, res) => {
  try {
    const { path: filePath } = req.body;
    const content = await fileOperations.readFile(filePath);
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Write file
router.post('/write', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    const result = await fileOperations.writeFile(filePath, content);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List files
router.get('/list/:basePath', async (req, res) => {
  try {
    const basePath = decodeURIComponent(req.params.basePath);
    const files = await fileOperations.listFiles(basePath);
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create file
router.post('/create', async (req, res) => {
  try {
    const { basePath, filename } = req.body;
    const result = await fileOperations.createFile(basePath, filename);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete file
router.delete('/delete', async (req, res) => {
  try {
    const { path: filePath } = req.body;
    const result = await fileOperations.deleteFile(filePath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rename file
router.post('/rename', async (req, res) => {
  try {
    const { oldPath, newPath } = req.body;
    await fs.move(oldPath, newPath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create directory
router.post('/mkdir', async (req, res) => {
  try {
    const { path: dirPath } = req.body;
    await fs.ensureDir(dirPath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete directory
router.delete('/rmdir', async (req, res) => {
  try {
    const { path: dirPath } = req.body;
    await fs.remove(dirPath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search files
router.post('/search', async (req, res) => {
  try {
    const { query, directory } = req.body;
    if (!query || !directory) {
      return res.status(400).json({ error: 'Query and directory are required' });
    }

    const files = await fileOperations.listFiles(directory);
    const results = [];
    const queryLower = query.toLowerCase();

    for (const file of files) {
      const nameMatch = file.name.toLowerCase().includes(queryLower);
      let contentMatch = false;
      let matchCount = nameMatch ? 1 : 0;

      try {
        const content = await fileOperations.readFile(file.path);
        contentMatch = content.toLowerCase().includes(queryLower);
        if (contentMatch) {
          const regex = new RegExp(query, 'gi');
          const matches = content.match(regex);
          matchCount += matches ? matches.length : 0;
        }
      } catch (err) {
        console.error(`Failed to read ${file.name}:`, err);
      }

      if (nameMatch || contentMatch) {
        results.push({
          noteId: file.path,
          noteName: file.name,
          path: file.path,
          matchCount,
        });
      }
    }

    results.sort((a, b) => b.matchCount - a.matchCount);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
