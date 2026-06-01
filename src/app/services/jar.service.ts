import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { IdentityService } from './identity.service';
import { JarMessage } from '../models';

@Injectable({ providedIn: 'root' })
export class JarService {
  private supabase = inject(SupabaseService);
  private identityService = inject(IdentityService);

  private messagesSignal = signal<JarMessage[]>([]);
  readonly messages = this.messagesSignal.asReadonly();

  private writtenCountSignal = signal<number>(0);
  readonly writtenCount = this.writtenCountSignal.asReadonly();

  private authoredSignal = signal<{ id: string; created_at: string; written_by: 'jesse' | 'abigail' }[]>([]);
  readonly authored = this.authoredSignal.asReadonly();

  async loadAuthored(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('jar_messages')
      .select('id, created_at, written_by')
      .not('written_by', 'is', null)
      .order('created_at', { ascending: false });

    if (error) { console.error(error); return; }
    this.authoredSignal.set((data ?? []) as { id: string; created_at: string; written_by: 'jesse' | 'abigail' }[]);
  }

  // Load messages written FOR the current user (by the other person, or legacy null)
  async loadAll(): Promise<void> {
    const me = this.identityService.user();
    const other = me === 'jesse' ? 'abigail' : 'jesse';

    const { data, error } = await this.supabase.client
      .from('jar_messages')
      .select('*')
      .or(`written_by.eq.${other},written_by.is.null`)
      .order('created_at', { ascending: true });

    if (error) { console.error(error); return; }
    this.messagesSignal.set(data ?? []);

    // Also count how many the current user has written
    const { count } = await this.supabase.client
      .from('jar_messages')
      .select('*', { count: 'exact', head: true })
      .eq('written_by', me);

    this.writtenCountSignal.set(count ?? 0);
  }

  async write(message: string): Promise<void> {
    const me = this.identityService.user();
    const { data, error } = await this.supabase.client
      .from('jar_messages')
      .insert({ message, written_by: me, category: null })
      .select()
      .single();

    if (error) { console.error(error); return; }
    this.writtenCountSignal.update(n => n + 1);
    // Don't add to messages — those are notes FOR us, not FROM us
  }

  async create(message: Omit<JarMessage, 'id' | 'created_at'>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('jar_messages')
      .insert(message)
      .select()
      .single();

    if (error) { console.error(error); return; }
    this.messagesSignal.update(messages => [...messages, data]);
  }

  async bulkCreate(messages: string[]): Promise<void> {
    const inserts = messages.map(message => ({ message, category: null, written_by: null }));
    const { data, error } = await this.supabase.client.from('jar_messages').insert(inserts).select();
    if (error) { console.error(error); return; }
    this.messagesSignal.update(existing => [...existing, ...(data ?? [])]);
  }

  async update(id: string, updates: Partial<Omit<JarMessage, 'id' | 'created_at'>>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('jar_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) { console.error(error); return; }
    this.messagesSignal.update(messages => messages.map(m => m.id === id ? data : m));
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client.from('jar_messages').delete().eq('id', id);
    if (error) { console.error(error); return; }
    this.messagesSignal.update(messages => messages.filter(m => m.id !== id));
  }
}
