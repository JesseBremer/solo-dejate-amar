import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Config } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private supabase = inject(SupabaseService);

  private configSignal = signal<Config | null>(null);
  readonly config = this.configSignal.asReadonly();

  async load(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('config')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error loading config:', error);
      return;
    }

    this.configSignal.set(data);
  }

  async update(updates: Partial<Omit<Config, 'id' | 'updated_at'>>): Promise<void> {
    const current = this.configSignal();
    if (!current) return;

    const { data, error } = await this.supabase.client
      .from('config')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', current.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating config:', error);
      return;
    }

    this.configSignal.set(data);
  }

  getPasscode(): string {
    return this.configSignal()?.passcode ?? '0505';
  }
}
