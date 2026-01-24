import { SearchResult } from '../types';

class SearchService {
  private index: Map<string, Set<string>> = new Map();

  /**
   * Build search index from notes
   */
  buildIndex(notes: Array<{ path: string; name: string; content?: string }>): void {
    this.index.clear();

    notes.forEach(note => {
      const text = `${note.name} ${note.content || ''}`.toLowerCase();
      const words = text.split(/\s+/).filter(w => w.length > 2);

      words.forEach(word => {
        if (!this.index.has(word)) {
          this.index.set(word, new Set());
        }
        this.index.get(word)!.add(note.path);
      });
    });
  }

  /**
   * Search notes by query
   */
  search(query: string, notes: Array<{ path: string; name: string; content?: string }>): SearchResult[] {
    const queryLower = query.toLowerCase();
    const results: Map<string, SearchResult> = new Map();

    notes.forEach(note => {
      const nameMatch = note.name.toLowerCase().includes(queryLower);
      const contentMatch = note.content?.toLowerCase().includes(queryLower) ?? false;

      if (nameMatch || contentMatch) {
        const matchCount = (
          (note.name.match(new RegExp(queryLower, 'gi')) || []).length +
          (note.content?.match(new RegExp(queryLower, 'gi')) || []).length
        );

        results.set(note.path, {
          noteId: note.path,
          noteName: note.name,
          path: note.path,
          matchCount,
          highlights: this.extractHighlights(note.content || '', query, 2),
        });
      }
    });

    return Array.from(results.values()).sort((a, b) => b.matchCount - a.matchCount);
  }

  /**
   * Extract context highlights around search results
   */
  private extractHighlights(content: string, query: string, lines: number): string[] {
    const regex = new RegExp(`([^.!?]*${query}[^.!?]*)`, 'gi');
    const matches = content.match(regex);
    return matches ? matches.slice(0, lines) : [];
  }
}

export const searchService = new SearchService();
