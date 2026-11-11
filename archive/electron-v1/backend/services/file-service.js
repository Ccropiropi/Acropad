const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const fileOperations = {
  async readFile(filepath) {
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      return content;
    } catch (err) {
      throw new Error(`Failed to read file: ${err.message}`);
    }
  },

  async writeFile(filepath, content) {
    try {
      await fs.ensureDir(path.dirname(filepath));
      await fs.writeFile(filepath, content, 'utf-8');
      return { path: filepath, success: true };
    } catch (err) {
      throw new Error(`Failed to write file: ${err.message}`);
    }
  },

  async createFile(basePath, filename) {
    try {
      const filepath = path.join(basePath, filename || `Untitled-${Date.now()}.md`);
      await fs.ensureDir(basePath);
      await fs.writeFile(filepath, '# New Note\n\nStart writing here...', 'utf-8');
      return { path: filepath, filename: path.basename(filepath) };
    } catch (err) {
      throw new Error(`Failed to create file: ${err.message}`);
    }
  },

  async deleteFile(filepath) {
    try {
      await fs.remove(filepath);
      return { success: true };
    } catch (err) {
      throw new Error(`Failed to delete file: ${err.message}`);
    }
  },

  async listFiles(basePath, filter = ['*.md', '*.txt']) {
    try {
      const files = await fs.readdir(basePath);
      const filtered = files.filter(file => {
        const ext = path.extname(file);
        return ext === '.md' || ext === '.txt';
      });
      return filtered.map(file => ({
        name: file,
        path: path.join(basePath, file)
      }));
    } catch (err) {
      throw new Error(`Failed to list files: ${err.message}`);
    }
  },

  async renameFile(oldPath, newPath) {
    try {
      await fs.move(oldPath, newPath, { overwrite: false });
      return { success: true, newPath };
    } catch (err) {
      throw new Error(`Failed to rename file: ${err.message}`);
    }
  }
};

module.exports = { fileOperations };
