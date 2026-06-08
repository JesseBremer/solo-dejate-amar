import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { JournalEntry } from '../models';

@Injectable({ providedIn: 'root' })
export class JournalService {
  private supabase = inject(SupabaseService);

  private entriesSignal = signal<JournalEntry[]>([]);
  readonly entries = this.entriesSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { console.error(error); return; }
    this.entriesSignal.set(data ?? []);
  }

  async create(entry: Pick<JournalEntry, 'author' | 'title' | 'content' | 'image_path'>): Promise<JournalEntry | null> {
    const { data, error } = await this.supabase.client
      .from('journal_entries')
      .insert(entry)
      .select()
      .single();

    if (error) { console.error(error); return null; }
    this.entriesSignal.update(entries => [data, ...entries]);
    return data;
  }

  async update(id: string, changes: Partial<Pick<JournalEntry, 'title' | 'content' | 'image_path'>>): Promise<void> {
    const { error } = await this.supabase.client
      .from('journal_entries')
      .update(changes)
      .eq('id', id);

    if (error) { console.error(error); return; }
    this.entriesSignal.update(entries =>
      entries.map(e => e.id === id ? { ...e, ...changes } : e)
    );
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (error) { console.error(error); return; }
    this.entriesSignal.update(entries => entries.filter(e => e.id !== id));
  }

  // Uploads an image file to the gallery bucket under a journal/ prefix, returns the storage path.
  async uploadImage(file: File): Promise<string | null> {
    const fileName = `journal/${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`;
    const { error } = await this.supabase.client.storage
      .from('gallery')
      .upload(fileName, file);
    if (error) { console.error(error); return null; }
    return fileName;
  }
}
