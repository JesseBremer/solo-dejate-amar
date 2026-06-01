// Supabase table: dream_goals
// CREATE TABLE dream_goals (
//   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   title text NOT NULL,
//   description text,
//   category text NOT NULL CHECK (category IN ('short_term','long_term','forever')),
//   emoji text,
//   completed boolean NOT NULL DEFAULT false,
//   sort_order integer,
//   created_at timestamptz NOT NULL DEFAULT now()
// );
// ALTER TABLE dream_goals ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "public read" ON dream_goals FOR SELECT USING (true);
// CREATE POLICY "public write" ON dream_goals FOR ALL USING (true);

import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DreamGoal } from '../models';

@Injectable({ providedIn: 'root' })
export class DreamsService {
  private supabase = inject(SupabaseService);

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

  async create(goal: Pick<DreamGoal, 'title' | 'description' | 'category' | 'emoji'>): Promise<void> {
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

  async update(id: string, changes: Partial<Pick<DreamGoal, 'title' | 'description' | 'emoji' | 'category' | 'sort_order'>>): Promise<void> {
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
    const { error } = await this.supabase.client
      .from('dream_goals')
      .delete()
      .eq('id', id);

    if (error) { console.error(error); return; }
    this.goalsSignal.update(goals => goals.filter(g => g.id !== id));
  }
}
