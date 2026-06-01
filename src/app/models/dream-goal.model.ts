export interface DreamGoal {
  id: string;
  title: string;
  description: string | null;
  category: 'short_term' | 'long_term' | 'forever';
  emoji: string | null;
  completed: boolean;
  target_date: string | null;
  image_url: string | null;
  sort_order: number | null;
  created_at: string;
}
