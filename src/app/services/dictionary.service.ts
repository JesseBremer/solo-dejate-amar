// Supabase table: dictionary_entries
// CREATE TABLE dictionary_entries (
//   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   term text NOT NULL,
//   translation text,
//   definition text,
//   category text NOT NULL DEFAULT 'other',
//   about text NOT NULL DEFAULT 'us',
//   created_by text,
//   created_at timestamptz NOT NULL DEFAULT now()
// );
// ALTER TABLE dictionary_entries ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "public all" ON dictionary_entries FOR ALL USING (true) WITH CHECK (true);

import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { IdentityService } from './identity.service';
import { DictionaryEntry } from '../models';

type EntryInput = Pick<DictionaryEntry, 'term' | 'translation' | 'definition' | 'category' | 'about'>;

@Injectable({ providedIn: 'root' })
export class DictionaryService {
  private supabase = inject(SupabaseService);
  private identityService = inject(IdentityService);

  private entriesSignal = signal<DictionaryEntry[]>([]);
  readonly entries = this.entriesSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('dictionary_entries')
      .select('*')
      .order('term', { ascending: true });

    if (error) { console.error(error); return; }
    this.entriesSignal.set(data ?? []);
  }

  async create(entry: EntryInput): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('dictionary_entries')
      .insert({ ...entry, created_by: this.identityService.user() })
      .select()
      .single();

    if (error) { console.error(error); return; }
    this.entriesSignal.update(entries =>
      [...entries, data].sort((a, b) => a.term.localeCompare(b.term))
    );
  }

  async update(id: string, changes: Partial<EntryInput>): Promise<void> {
    const { error } = await this.supabase.client
      .from('dictionary_entries')
      .update(changes)
      .eq('id', id);

    if (error) { console.error(error); return; }
    this.entriesSignal.update(entries =>
      entries.map(e => e.id === id ? { ...e, ...changes } : e)
        .sort((a, b) => a.term.localeCompare(b.term))
    );
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('dictionary_entries')
      .delete()
      .eq('id', id);

    if (error) { console.error(error); return; }
    this.entriesSignal.update(entries => entries.filter(e => e.id !== id));
  }
}
