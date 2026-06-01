// Supabase table: dream_goals
// Run this migration if upgrading from the initial schema:
// ALTER TABLE dream_goals ADD COLUMN IF NOT EXISTS target_date date;
// ALTER TABLE dream_goals ADD COLUMN IF NOT EXISTS image_url text;
//
// Storage bucket: dreams (create in Supabase Storage → New bucket → "dreams" → Public)

import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DreamGoal } from '../models';

type DreamInput = Pick<DreamGoal, 'title' | 'description' | 'category' | 'emoji'> &
  Partial<Pick<DreamGoal, 'target_date' | 'image_url'>>;

@Injectable({ providedIn: 'root' })
export class DreamsService {
  private supabase = inject(SupabaseService);
  private readonly BUCKET = 'dreams';

  private goalsSignal = signal<DreamGoal[]>([]);
  readonly goals = this.goalsSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('dream_goals')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) { console.error(error); return; }
    this.goalsSignal.set(data ?? []);
  }

  async uploadImage(file: File): Promise<string | null> {
    const path = `${Date.now()}-${file.name}`;
    const { error } = await this.supabase.client.storage.from(this.BUCKET).upload(path, file);
    if (error) { console.error(error); return null; }
    const { data } = this.supabase.client.storage.from(this.BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async removeImage(url: string): Promise<void> {
    const path = url.split(`/${this.BUCKET}/`)[1];
    if (path) await this.supabase.client.storage.from(this.BUCKET).remove([path]);
  }

  async create(goal: DreamInput): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('dream_goals')
      .insert({ ...goal, completed: false })
      .select()
      .single();

    if (error) { console.error(error); return; }
    this.goalsSignal.update(goals => [...goals, data]);
  }

  async toggleComplete(id: string, completed: boolean): Promise<void> {
    const { error } = await this.supabase.client
      .from('dream_goals')
      .update({ completed })
      .eq('id', id);

    if (error) { console.error(error); return; }
    this.goalsSignal.update(goals =>
      goals.map(g => g.id === id ? { ...g, completed } : g)
    );
  }

  async update(id: string, changes: Partial<DreamInput>): Promise<void> {
    const { error } = await this.supabase.client
      .from('dream_goals')
      .update(changes)
      .eq('id', id);

    if (error) { console.error(error); return; }
    this.goalsSignal.update(goals =>
      goals.map(g => g.id === id ? { ...g, ...changes } : g)
    );
  }

  async delete(id: string): Promise<void> {
    const goal = this.goalsSignal().find(g => g.id === id);
    if (goal?.image_url) await this.removeImage(goal.image_url);

    const { error } = await this.supabase.client
      .from('dream_goals')
      .delete()
      .eq('id', id);

    if (error) { console.error(error); return; }
    this.goalsSignal.update(goals => goals.filter(g => g.id !== id));
  }
}
