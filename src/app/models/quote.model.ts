export interface Quote {
  id: string;
  text: string;
  said_by: 'jesse' | 'abigail' | null;
  context: string | null;
  created_at: string;
}
