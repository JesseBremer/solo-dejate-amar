export interface PhotoAlbum {
  id: string;
  title: string;
  url: string;
  cover_path: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}
