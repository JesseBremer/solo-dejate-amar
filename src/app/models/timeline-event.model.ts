export interface TimelineEvent {
  id: string;
  author: 'jesse' | 'abigail';
  title: string;
  description: string | null;
  event_date: string;
  emoji: string | null;
  journal_entry_id: string | null;
  created_at: string;
}

