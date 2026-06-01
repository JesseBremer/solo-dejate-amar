import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface CyclePhase {
  id: string;
  phase_key: string;
  feeling: string | null;
  missions: string[] | null;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class CycleService {
  private supabase = inject(SupabaseService);

  private phasesSignal = signal<CyclePhase[]>([]);
  readonly phases = this.phasesSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('cycle_phases')
      .select('*');
    if (error) { console.error(error); return; }
    this.phasesSignal.set(data ?? []);
  }

  getPhase(key: string): CyclePhase | undefined {
    return this.phasesSignal().find(p => p.phase_key === key);
  }

  async save(phaseKey: string, changes: { feeling: string; missions: string[] }): Promise<void> {
    const existing = this.getPhase(phaseKey);

    if (existing) {
      const { data, error } = await this.supabase.client
        .from('cycle_phases')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('phase_key', phaseKey)
        .select()
        .single();
      if (error) { console.error(error); return; }
      this.phasesSignal.update(phases => phases.map(p => p.phase_key === phaseKey ? data : p));
    } else {
      const { data, error } = await this.supabase.client
        .from('cycle_phases')
        .insert({ phase_key: phaseKey, ...changes })
        .select()
        .single();
      if (error) { console.error(error); return; }
      this.phasesSignal.update(phases => [...phases, data]);
    }
  }
}
