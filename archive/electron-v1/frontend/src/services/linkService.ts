import { Note } from '../types';

class LinkService {
  /**
   * Parse internal links from markdown content
   * Format: [[note-name]] or [[note-name|display text]]
   */
  extractLinks(content: string): string[] {
    const linkRegex = /\[\[([^\[\]|]+)(?:\|[^\[\]]+)?\]\]/g;
    const links: string[] = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      links.push(match[1].trim());
    }

    return [...new Set(links)]; // Remove duplicates
  }

  /**
   * Extract tags from markdown content
   * Format: #tag-name
   */
  extractTags(content: string): string[] {
    const tagRegex = /#([a-zA-Z0-9_-]+)/g;
    const tags: string[] = [];
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }

    return [...new Set(tags)];
  }

  /**
   * Convert internal links to clickable markdown links
   */
  processLinks(content: string, baseUrl: string = ''): string {
    return content.replace(
      /\[\[([^\[\]|]+)(?:\|([^\[\]]+))?\]\]/g,
      (match, noteName, displayText) => {
        const display = displayText?.trim() || noteName.trim();
        const href = `${baseUrl}#note/${encodeURIComponent(noteName.trim())}`;
        return `[${display}](${href})`;
      }
    );
  }

  /**
   * Find backlinks for a note
   */
  findBacklinks(noteName: string, allNotes: Note[]): Note[] {
    return allNotes.filter(note => {
      if (!note.content) return false;
      const links = this.extractLinks(note.content);
      return links.some(link => 
        link.toLowerCase() === noteName.toLowerCase()
      );
    });
  }

  /**
   * Build a graph of note connections
   */
  buildGraph(notes: Note[]): { nodes: any[]; edges: any[] } {
    const nodes = notes.map(note => ({
      id: note.id,
      label: note.name.replace('.md', ''),
      title: note.name,
    }));

    const edges: any[] = [];
    const edgeSet = new Set<string>();

    notes.forEach(note => {
      const links = note.content ? this.extractLinks(note.content) : [];
      links.forEach(linkName => {
        const targetNote = notes.find(n => 
          n.name.replace('.md', '').toLowerCase() === linkName.toLowerCase()
        );
        if (targetNote) {
          const edgeKey = `${note.id}-${targetNote.id}`;
          if (!edgeSet.has(edgeKey)) {
            edges.push({
              from: note.id,
              to: targetNote.id,
            });
            edgeSet.add(edgeKey);
          }
        }
      });
    });

    return { nodes, edges };
  }
}

export const linkService = new LinkService();
