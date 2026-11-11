export interface Note {
  id: string;
  name: string;
  path: string;
  content?: string;
  createdAt?: Date;
  updatedAt?: Date;
  links?: string[];
  backlinks?: string[];
  tags?: string[];
}

export interface SearchResult {
  noteId: string;
  noteName: string;
  path: string;
  highlights?: string[];
  matchCount: number;
}

export interface GraphNode {
  id: string;
  label: string;
  title: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

export interface NotificationPayload {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface Theme {
  mode: 'light' | 'dark';
  accentColor: string;
  fontFamily: string;
  fontSize: number;
}

export interface FileSystemEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileSystemEntry[];
}
