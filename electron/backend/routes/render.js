const express = require('express');
const router = express.Router();
const { renderMarkdown } = require('../services/markdown-service');

router.post('/', (req, res) => {
  try {
    const { content } = req.body;
    const html = renderMarkdown(content);
    res.json({ html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
