import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { TimelineEvent } from '../models';

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private supabase = inject(SupabaseService);

  private eventsSignal = signal<TimelineEvent[]>([]);
  readonly events = this.eventsSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('timeline_events')
      .select('*')
      .order('event_date', { ascending: true });
    if (error) { console.error(error); return; }
    this.eventsSignal.set(data ?? []);
  }

  async create(event: Pick<TimelineEvent, 'author' | 'title' | 'description' | 'event_date' | 'emoji' | 'journal_entry_id'>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('timeline_events')
      .insert(event)
      .select()
      .single();
    if (error) { console.error(error); return; }
    this.eventsSignal.update(events =>
      [...events, data].sort((a, b) => a.event_date.localeCompare(b.event_date))
    );
  }

  async update(id: string, changes: Pick<TimelineEvent, 'title' | 'description' | 'event_date' | 'emoji'>): Promise<void> {
    const { error } = await this.supabase.client
      .from('timeline_events')
      .update(changes)
      .eq('id', id);
    if (error) { console.error(error); return; }
    this.eventsSignal.update(events =>
      events.map(e => e.id === id ? { ...e, ...changes } : e)
            .sort((a, b) => a.event_date.localeCompare(b.event_date))
    );
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('timeline_events')
      .delete()
      .eq('id', id);
    if (error) { console.error(error); return; }
    this.eventsSignal.update(events => events.filter(e => e.id !== id));
  }
}
