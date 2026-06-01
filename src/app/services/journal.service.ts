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

  async create(entry: Pick<JournalEntry, 'author' | 'title' | 'content'>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('journal_entries')
      .insert(entry)
      .select()
      .single();

    if (error) { console.error(error); return; }
    this.entriesSignal.update(entries => [data, ...entries]);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (error) { console.error(error); return; }
    this.entriesSignal.update(entries => entries.filter(e => e.id !== id));
  }
}
