export interface JarMessage {
  id: string;
  message: string;
  category: string | null;
  written_by: 'jesse' | 'abigail' | null;
  created_at: string;
}
