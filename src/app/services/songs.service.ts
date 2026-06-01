import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Song } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SongsService {
  private supabase = inject(SupabaseService);

  private songsSignal = signal<Song[]>([]);
  readonly songs = this.songsSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })
      .order('sort_order', { ascending: false });

    if (error) {
      console.error('Error loading songs:', error);
      return;
    }

    this.songsSignal.set(data ?? []);
  }

  async create(song: Omit<Song, 'id' | 'created_at'>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('songs')
      .insert(song)
      .select()
      .single();

    if (error) {
      console.error('Error creating song:', error);
      return;
    }

    this.songsSignal.update((songs) => [...songs, data]);
  }

  async update(id: string, updates: Partial<Omit<Song, 'id' | 'created_at'>>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('songs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating song:', error);
      return;
    }

    this.songsSignal.update((songs) => songs.map((s) => (s.id === id ? data : s)));
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client.from('songs').delete().eq('id', id);

    if (error) {
      console.error('Error deleting song:', error);
      return;
    }

    this.songsSignal.update((songs) => songs.filter((s) => s.id !== id));
  }

  async reorder(songs: Song[]): Promise<void> {
    const updates = songs.map((song, index) => ({
      id: song.id,
      sort_order: index,
    }));

    for (const update of updates) {
      await this.supabase.client.from('songs').update({ sort_order: update.sort_order }).eq('id', update.id);
    }

    this.songsSignal.set(songs);
  }
}
