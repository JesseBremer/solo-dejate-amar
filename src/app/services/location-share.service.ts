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

  // Outcome of an app-open location attempt, so the UI can guide the user if needed.
  //  'shared'   – location captured & saved
  //  'blocked'  – permission was denied; the browser won't re-prompt, manual re-enable needed
  //  'skipped'  – nothing to do (unsupported, or prompt dismissed without choosing)
  readonly autoShareState = signal<'idle' | 'shared' | 'blocked' | 'skipped'>('idle');

  // Fired on app open. Updates location automatically, and — unlike a fully silent
  // version — will trigger the native permission prompt when the user hasn't decided yet,
  // so it "just works" the first time without anyone digging through settings.
  async requestLocationOnOpen(): Promise<void> {
    try {
      const state = navigator.permissions?.query
        ? (await navigator.permissions.query({ name: 'geolocation' as PermissionName })).state
        : 'prompt';

      if (state === 'denied') {
        // Browser blocks JS from re-prompting; surface guidance instead.
        this.autoShareState.set('blocked');
        return;
      }

      // 'granted' → silent update. 'prompt' → this call triggers the native dialog.
      await this.shareCurrentLocation(false, true);
      this.autoShareState.set('shared');
    } catch {
      // Prompt dismissed, timed out, or unsupported — don't nag, leave manual buttons available.
      this.autoShareState.set('skipped');
    }
  }

  // After a manual share fails, flag 'blocked' if the failure was a denied permission
  // (so the same guidance banner appears). No-op where the Permissions API is unavailable.
  async flagBlockedIfDenied(): Promise<void> {
    try {
      if (!navigator.permissions?.query) return;
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (status.state === 'denied') this.autoShareState.set('blocked');
    } catch {
      // ignore
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
