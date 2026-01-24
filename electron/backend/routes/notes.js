const express = require('express');
const router = express.Router();
const { fileOperations } = require('../services/file-service');

router.get('/', async (req, res) => {
  res.json({ message: 'Notes API' });
});

module.exports = router;
