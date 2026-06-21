// Supabase table:
// CREATE TABLE quotes (
//   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   text text NOT NULL,
//   said_by text CHECK (said_by IN ('jesse', 'abigail')),
//   context text,
//   created_at timestamptz NOT NULL DEFAULT now()
// );
// ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "anon select" ON quotes FOR SELECT USING (true);
// CREATE POLICY "anon insert" ON quotes FOR INSERT WITH CHECK (true);
// CREATE POLICY "anon update" ON quotes FOR UPDATE USING (true);
// CREATE POLICY "anon delete" ON quotes FOR DELETE USING (true);

import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Quote } from '../models';

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private supabase = inject(SupabaseService);

  private quotesSignal = signal<Quote[]>([]);
  readonly quotes = this.quotesSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { console.error(error); return; }
    this.quotesSignal.set(data ?? []);
  }

  async create(quote: Omit<Quote, 'id' | 'created_at'>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('quotes')
      .insert(quote)
      .select()
      .single();

    if (error) { console.error(error); return; }
    this.quotesSignal.update(q => [data, ...q]);
  }

  async update(id: string, updates: Partial<Omit<Quote, 'id' | 'created_at'>>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) { console.error(error); return; }
    this.quotesSignal.update(q => q.map(item => item.id === id ? data : item));
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client.from('quotes').delete().eq('id', id);
    if (error) { console.error(error); return; }
    this.quotesSignal.update(q => q.filter(item => item.id !== id));
  }
}
