import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { VaultMessage } from '../models';

@Injectable({ providedIn: 'root' })
export class VaultService {
  private supabase = inject(SupabaseService);

  private messagesSignal = signal<VaultMessage[]>([]);
  readonly messages = this.messagesSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('vault_messages')
      .select('*')
      .order('unlock_at', { ascending: true });
    if (error) { console.error(error); return; }
    this.messagesSignal.set(data ?? []);
  }

  async create(msg: Pick<VaultMessage, 'author' | 'title' | 'content' | 'unlock_at'>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('vault_messages')
      .insert(msg)
      .select()
      .single();
    if (error) { console.error(error); return; }
    this.messagesSignal.update(msgs =>
      [...msgs, data].sort((a, b) => new Date(a.unlock_at).getTime() - new Date(b.unlock_at).getTime())
    );
  }

  async update(id: string, changes: Pick<VaultMessage, 'title' | 'content' | 'unlock_at'>): Promise<void> {
    const { error } = await this.supabase.client
      .from('vault_messages')
      .update(changes)
      .eq('id', id);
    if (error) { console.error(error); return; }
    this.messagesSignal.update(msgs =>
      msgs.map(m => m.id === id ? { ...m, ...changes } : m)
          .sort((a, b) => new Date(a.unlock_at).getTime() - new Date(b.unlock_at).getTime())
    );
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('vault_messages')
      .delete()
      .eq('id', id);
    if (error) { console.error(error); return; }
    this.messagesSignal.update(msgs => msgs.filter(m => m.id !== id));
  }
}
