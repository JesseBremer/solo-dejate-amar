export interface JournalEntry {
  id: string;
  author: 'jesse' | 'abigail';
  title: string | null;
  content: string;
  created_at: string;
}
