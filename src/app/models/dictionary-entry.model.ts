export type DictionaryCategory =
  | 'basics' | 'people' | 'dates' | 'food' | 'favorites'
  | 'sizes' | 'health' | 'comfort' | 'words' | 'gifts' | 'other';

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
