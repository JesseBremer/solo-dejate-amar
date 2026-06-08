export interface GalleryImage {
  id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
  journal_entry_id: string | null;
}
