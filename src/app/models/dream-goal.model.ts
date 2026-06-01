export interface DreamGoal {
  id: string;
  title: string;
  description: string | null;
  category: 'short_term' | 'long_term' | 'forever';
  emoji: string | null;
  completed: boolean;
  sort_order: number | null;
  created_at: string;
}
