// Supabase table:
// CREATE TABLE photo_albums (
//   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   title text NOT NULL,
//   url text NOT NULL,
//   cover_path text,
//   description text,
//   sort_order integer NOT NULL DEFAULT 0,
//   created_at timestamptz NOT NULL DEFAULT now()
// );
// ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "anon select" ON photo_albums FOR SELECT USING (true);
// CREATE POLICY "anon insert" ON photo_albums FOR INSERT WITH CHECK (true);
// CREATE POLICY "anon update" ON photo_albums FOR UPDATE USING (true);
// CREATE POLICY "anon delete" ON photo_albums FOR DELETE USING (true);

import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { PhotoAlbum } from '../models';

@Injectable({ providedIn: 'root' })
export class AlbumsService {
  private supabase = inject(SupabaseService);
  // Covers reuse the existing gallery bucket — one small image per album.
  private readonly BUCKET_NAME = 'gallery';

  private albumsSignal = signal<PhotoAlbum[]>([]);
  readonly albums = this.albumsSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('photo_albums')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) { console.error('Error loading albums:', error); return; }
    this.albumsSignal.set(data ?? []);
  }

  getCoverUrl(coverPath: string): string {
    const { data } = this.supabase.client.storage.from(this.BUCKET_NAME).getPublicUrl(coverPath);
    return data.publicUrl;
  }

  async uploadCover(file: File): Promise<string | null> {
    const fileName = `albums/${Date.now()}-${file.name}`;
    const { error } = await this.supabase.client.storage.from(this.BUCKET_NAME).upload(fileName, file);
    if (error) { console.error('Error uploading album cover:', error); return null; }
    return fileName;
  }

  async create(album: Omit<PhotoAlbum, 'id' | 'created_at'>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('photo_albums')
      .insert(album)
      .select()
      .single();

    if (error) { console.error('Error creating album:', error); return; }
    this.albumsSignal.update((a) => [...a, data]);
  }

  async update(id: string, updates: Partial<Omit<PhotoAlbum, 'id' | 'created_at'>>): Promise<void> {
    const previousCover = this.albumsSignal().find((a) => a.id === id)?.cover_path ?? null;

    const { data, error } = await this.supabase.client
      .from('photo_albums')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) { console.error('Error updating album:', error); return; }

    // Clean up the replaced cover file once the row update has succeeded.
    if ('cover_path' in updates && previousCover && previousCover !== updates.cover_path) {
      await this.supabase.client.storage.from(this.BUCKET_NAME).remove([previousCover]);
    }

    this.albumsSignal.update((a) => a.map((item) => (item.id === id ? data : item)));
  }

  async delete(id: string): Promise<void> {
    const album = this.albumsSignal().find((a) => a.id === id);
    if (album?.cover_path) {
      await this.supabase.client.storage.from(this.BUCKET_NAME).remove([album.cover_path]);
    }
    const { error } = await this.supabase.client.from('photo_albums').delete().eq('id', id);
    if (error) { console.error('Error deleting album:', error); return; }
    this.albumsSignal.update((a) => a.filter((item) => item.id !== id));
  }
}
