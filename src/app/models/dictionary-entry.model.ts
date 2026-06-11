export type DictionaryCategory =
  | 'basics' | 'past' | 'inner' | 'people' | 'dates' | 'food' | 'favorites'
  | 'sizes' | 'health' | 'comfort' | 'love' | 'intimacy' | 'future'
  | 'words' | 'gifts' | 'questions' | 'other';

export type DictionaryAbout = 'jesse' | 'abigail' | 'us';

export interface DictionaryEntry {
  id: string;
  term: string;
  translation: string | null;
  definition: string | null;
  category: DictionaryCategory;
  about: DictionaryAbout;
  created_by: 'jesse' | 'abigail' | null;
  created_at: string;
}
