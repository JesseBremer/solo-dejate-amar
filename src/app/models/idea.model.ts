export interface Idea {
  id: string;
  author: 'jesse' | 'abigail';
  title: string;
  note: string | null;
  suggested_date: string | null;
  suggested_time: string | null;
  status: 'pending' | 'accepted' | 'done' | 'declined';
  is_dream: boolean;
  rescheduled: boolean;
  suggestion: string | null;
  created_at: string;
}
