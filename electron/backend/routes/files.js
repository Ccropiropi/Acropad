const express = require('express');
const router = express.Router();
const { fileOperations } = require('../services/file-service');

// Read file
router.post('/read', async (req, res) => {
  try {
    const { path } = req.body;
    const content = await fileOperations.readFile(path);
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Write file
router.post('/write', async (req, res) => {
  try {
    const { path, content } = req.body;
    const result = await fileOperations.writeFile(path, content);
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
    const { path } = req.body;
    const result = await fileOperations.deleteFile(path);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
