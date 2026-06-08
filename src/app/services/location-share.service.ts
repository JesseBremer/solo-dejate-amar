// Supabase table: location_shares (one row per person, upserted)
// CREATE TABLE location_shares (
//   user_id text PRIMARY KEY,
//   lat double precision NOT NULL,
//   lng double precision NOT NULL,
//   place text,
//   label text,
//   updated_at timestamptz NOT NULL DEFAULT now()
// );
// ALTER TABLE location_shares ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "public all" ON location_shares FOR ALL USING (true) WITH CHECK (true);

import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { IdentityService } from './identity.service';
import { LanguageService } from './language.service';
import { LocationShare } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LocationShareService {
  private supabase = inject(SupabaseService);
  private identityService = inject(IdentityService);
  private langService = inject(LanguageService);

  private sharesSignal = signal<LocationShare[]>([]);
  readonly shares = this.sharesSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('location_shares')
      .select('*');
    if (error) { console.error(error); return; }
    this.sharesSignal.set(data ?? []);
  }

  async share(lat: number, lng: number, place: string | null): Promise<void> {
    const row = {
      user_id: this.identityService.user(),
      lat, lng, place,
      label: null as string | null,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await this.supabase.client
      .from('location_shares')
      .upsert(row, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) { console.error(error); return; }
    this.sharesSignal.update(shares =>
      [...shares.filter(s => s.user_id !== row.user_id), data]
    );
  }

  // Capture the device's current position, reverse-geocode it, save, and optionally notify the partner.
  // Throws if geolocation fails so callers can show an error.
  async shareCurrentLocation(notify: boolean, lenient = false): Promise<{ lat: number; lng: number; place: string | null }> {
    const pos = await this.getPosition(lenient);
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const place = await this.reverseGeocode(lat, lng);
    await this.share(lat, lng, place);
    if (notify) await this.notifyPartnerShared(place);
    return { lat, lng, place };
  }

  // Silent, permission-gated location update — for firing on app open.
  // Only runs if geolocation permission is ALREADY granted, so it never prompts.
  // Uses lenient GPS options (cached position OK) so it never blocks or times out.
  async maybeAutoShare(): Promise<void> {
    try {
      if (!navigator.permissions?.query) return;
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (status.state !== 'granted') return;
      await this.shareCurrentLocation(false, true);
    } catch {
      // permissions API unavailable or share failed — stay silent, wait for a manual tap
    }
  }

  private getPosition(lenient = false): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject('unsupported'); return; }
      const opts: PositionOptions = lenient
        ? { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        : { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
      navigator.geolocation.getCurrentPosition(resolve, reject, opts);
    });
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
        { headers: { 'Accept-Language': this.langService.lang() === 'es' ? 'es' : 'en' } }
      );
      const data = await res.json();
      const a = data.address ?? {};
      const city = a.city || a.town || a.village || a.county || a.state || '';
      const country = a.country || '';
      return [city, country].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 2).join(',') || null;
    } catch {
      return null;
    }
  }

  private async notifyPartnerShared(place: string | null): Promise<void> {
    try {
      await fetch('/.netlify/functions/location-shared', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(environment.functionSecret && { 'x-function-secret': environment.functionSecret }),
        },
        body: JSON.stringify({ from: this.identityService.user(), place }),
      });
    } catch {
      // ignore — sharing still succeeded
    }
  }
}
