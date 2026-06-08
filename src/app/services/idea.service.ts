import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Idea } from '../models';

@Injectable({ providedIn: 'root' })
export class IdeaService {
  private supabase = inject(SupabaseService);

  private ideasSignal = signal<Idea[]>([]);
  readonly ideas = this.ideasSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    this.ideasSignal.set(data ?? []);
  }


  async create(idea: Pick<Idea, 'author' | 'title' | 'note' | 'suggested_date' | 'suggested_time' | 'is_dream'>): Promise<Idea | null> {
    const { data, error } = await this.supabase.client
      .from('ideas')
      .insert({ ...idea, status: 'pending' })
      .select()
      .single();
    if (error) { console.error(error); return null; }
    this.ideasSignal.update(ideas => [data, ...ideas]);
    return data;
  }

  async updateSuggestion(id: string, suggestion: string | null, suggested_date: string | null, suggested_time?: string | null): Promise<void> {
    const changes: Partial<Idea> = { suggestion };
    if (suggested_date !== undefined) changes.suggested_date = suggested_date;
    if (suggested_time !== undefined) changes.suggested_time = suggested_time;
    const { error } = await this.supabase.client
      .from('ideas')
      .update(changes)
      .eq('id', id);
    if (error) { console.error(error); return; }
    this.ideasSignal.update(ideas =>
      ideas.map(i => i.id === id ? { ...i, ...changes } : i)
    );
  }

  async update(id: string, changes: Pick<Idea, 'title' | 'note' | 'suggested_date' | 'suggested_time' | 'is_dream'>): Promise<void> {
    const { error } = await this.supabase.client
      .from('ideas')
      .update(changes)
      .eq('id', id);
    if (error) { console.error(error); return; }
    this.ideasSignal.update(ideas =>
      ideas.map(i => i.id === id ? { ...i, ...changes } : i)
    );
  }

  async reschedule(id: string): Promise<void> {
    const core = { status: 'pending' as const, suggested_date: null, suggested_time: null, suggestion: null };
    const { error } = await this.supabase.client
      .from('ideas')
      .update(core)
      .eq('id', id);
    if (error) { console.error(error); return; }
    // rescheduled flag requires: ALTER TABLE ideas ADD COLUMN rescheduled boolean NOT NULL DEFAULT false
    await this.supabase.client.from('ideas').update({ rescheduled: true }).eq('id', id);
    this.ideasSignal.update(ideas =>
      ideas.map(i => i.id === id ? { ...i, ...core, rescheduled: true } : i)
    );
  }

  async clearSuggestion(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('ideas')
      .update({ suggestion: null })
      .eq('id', id);
    if (error) { console.error(error); return; }
    this.ideasSignal.update(ideas =>
      ideas.map(i => i.id === id ? { ...i, suggestion: null } : i)
    );
  }

  async updateDate(id: string, suggested_date: string | null): Promise<void> {
    const { error } = await this.supabase.client
      .from('ideas')
      .update({ suggested_date })
      .eq('id', id);
    if (error) { console.error(error); return; }
    this.ideasSignal.update(ideas =>
      ideas.map(i => i.id === id ? { ...i, suggested_date } : i)
    );
  }

  async updateStatus(id: string, status: Idea['status']): Promise<void> {
    const { error } = await this.supabase.client
      .from('ideas')
      .update({ status })
      .eq('id', id);
    if (error) { console.error(error); return; }
    this.ideasSignal.update(ideas =>
      ideas.map(i => i.id === id ? { ...i, status } : i)
    );
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('ideas')
      .delete()
      .eq('id', id);
    if (error) { console.error(error); return; }
    this.ideasSignal.update(ideas => ideas.filter(i => i.id !== id));
  }
}
