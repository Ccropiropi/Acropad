import axios, { AxiosInstance } from 'axios';
import { Note, SearchResult } from '../types';

const API_BASE = 'http://localhost:5000/api';

class NoteService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async listFiles(dir: string): Promise<Note[]> {
    const response = await this.api.get(`/files/list/${encodeURIComponent(dir)}`);
    return response.data.files || [];
  }

  async readFile(path: string): Promise<string> {
    const response = await this.api.post('/files/read', { path });
    return response.data.content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    await this.api.post('/files/write', { path, content });
  }

  async createFile(basePath: string, filename?: string): Promise<Note> {
    const response = await this.api.post('/files/create', {
      basePath,
      filename,
    });
    return {
      name: response.data.filename,
      path: response.data.path,
      id: response.data.filename.replace('.md', ''),
    };
  }

  async deleteFile(path: string): Promise<void> {
    await this.api.delete('/files/delete', { data: { path } });
  }

  async renderMarkdown(content: string): Promise<string> {
    const response = await this.api.post('/render', { content });
    return response.data.html;
  }

  async searchContent(query: string, dir: string): Promise<SearchResult[]> {
    const response = await this.api.post('/files/search', {
      query,
      directory: dir,
    });
    return response.data.results || [];
  }

  async createDirectory(path: string): Promise<void> {
    await this.api.post('/files/mkdir', { path });
  }

  async deleteDirectory(path: string): Promise<void> {
    await this.api.delete('/files/rmdir', { data: { path } });
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    await this.api.post('/files/rename', { oldPath, newPath });
  }
}

export const noteService = new NoteService();
