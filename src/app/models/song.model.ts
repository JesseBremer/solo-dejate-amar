export interface Song {
  id: string;
  title: string;
  artist: string;
  shared_by: 'jesse' | 'abigail';
  spotify_url: string;
  youtube_url: string | null;
  sort_order: number;
  created_at: string;
}
