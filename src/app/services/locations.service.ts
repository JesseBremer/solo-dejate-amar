import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { MapLocation } from '../models';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private supabase = inject(SupabaseService);

  private locationsSignal = signal<MapLocation[]>([]);
  readonly locations = this.locationsSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('map_locations')
      .select('*')
      .order('visit_date', { ascending: true });

    if (error) {
      console.error('Error loading locations:', error);
      return;
    }

    this.locationsSignal.set(data ?? []);
  }

  async create(location: Omit<MapLocation, 'id' | 'created_at'>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('map_locations')
      .insert(location)
      .select()
      .single();

    if (error) {
      console.error('Error creating location:', error);
      return;
    }

    this.locationsSignal.update((locations) => [...locations, data]);
  }

  async update(id: string, updates: Partial<Omit<MapLocation, 'id' | 'created_at'>>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('map_locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating location:', error);
      return;
    }

    this.locationsSignal.update((locations) => locations.map((l) => (l.id === id ? data : l)));
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client.from('map_locations').delete().eq('id', id);

    if (error) {
      console.error('Error deleting location:', error);
      return;
    }

    this.locationsSignal.update((locations) => locations.filter((l) => l.id !== id));
  }
}
