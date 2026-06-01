// Supabase table: push_subscriptions
// CREATE TABLE push_subscriptions (
//   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   endpoint text UNIQUE NOT NULL,
//   subscription jsonb NOT NULL,
//   lang text NOT NULL DEFAULT 'en',
//   created_at timestamptz NOT NULL DEFAULT now()
// );
// ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "anon insert" ON push_subscriptions FOR INSERT WITH CHECK (true);
// CREATE POLICY "anon upsert" ON push_subscriptions FOR UPDATE USING (true);

import { Injectable, inject, signal } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { LanguageService } from './language.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushService {
  private swPush = inject(SwPush);
  private supabase = inject(SupabaseService);
  private langService = inject(LanguageService);

  readonly supported = this.swPush.isEnabled;
  readonly subscribed = signal(false);
  readonly lastError = signal<string>('none');

  async init(): Promise<void> {
    if (!this.swPush.isEnabled) return;
    const existing = await firstValueFrom(this.swPush.subscription);
    this.subscribed.set(!!existing);
  }

  async subscribe(): Promise<void> {
    if (!this.swPush.isEnabled) return;
    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: environment.vapidPublicKey,
      });
      const { error } = await this.supabase.client
        .from('push_subscriptions')
        .upsert(
          { endpoint: sub.endpoint, subscription: JSON.stringify(sub), lang: this.langService.lang() },
          { onConflict: 'endpoint' }
        );
      if (error) {
        this.lastError.set(`DB: ${error.message}`);
        return;
      }
      this.subscribed.set(true);
    } catch (err: any) {
      this.lastError.set(err?.message ?? String(err));
    }
  }
}
