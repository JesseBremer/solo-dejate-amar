import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { JarMessage } from '../models';

@Injectable({
  providedIn: 'root',
})
export class JarService {
  private supabase = inject(SupabaseService);

  private messagesSignal = signal<JarMessage[]>([]);
  readonly messages = this.messagesSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('jar_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading jar messages:', error);
      return;
    }

    this.messagesSignal.set(data ?? []);
  }

  async create(message: Omit<JarMessage, 'id' | 'created_at'>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('jar_messages')
      .insert(message)
      .select()
      .single();

    if (error) {
      console.error('Error creating jar message:', error);
      return;
    }

    this.messagesSignal.update((messages) => [...messages, data]);
  }

  async bulkCreate(messages: string[]): Promise<void> {
    const inserts = messages.map((message) => ({ message, category: null }));

    const { data, error } = await this.supabase.client.from('jar_messages').insert(inserts).select();

    if (error) {
      console.error('Error bulk creating jar messages:', error);
      return;
    }

    this.messagesSignal.update((existing) => [...existing, ...(data ?? [])]);
  }

  async update(id: string, updates: Partial<Omit<JarMessage, 'id' | 'created_at'>>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('jar_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating jar message:', error);
      return;
    }

    this.messagesSignal.update((messages) => messages.map((m) => (m.id === id ? data : m)));
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client.from('jar_messages').delete().eq('id', id);

    if (error) {
      console.error('Error deleting jar message:', error);
      return;
    }

    this.messagesSignal.update((messages) => messages.filter((m) => m.id !== id));
  }

  getRandomMessage(): string | null {
    const messages = this.messagesSignal();
    if (messages.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex].message;
  }
}
