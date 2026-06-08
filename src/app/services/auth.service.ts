import { Injectable, signal, effect, inject } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private configService = inject(ConfigService);
  private readonly STORAGE_KEY = 'safeUnlockedAt';
  // How long a login lasts before the passcode is required again.
  private readonly TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  readonly isUnlocked = signal(this.checkStoredAuth());

  constructor() {
    effect(() => {
      if (this.isUnlocked()) {
        localStorage.setItem(this.STORAGE_KEY, Date.now().toString());
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    });
  }

  private checkStoredAuth(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return false;
    const unlockedAt = Number(stored);
    if (!unlockedAt || Date.now() - unlockedAt > this.TTL_MS) {
      localStorage.removeItem(this.STORAGE_KEY);
      return false;
    }
    return true;
  }

  unlock(passcode: string): boolean {
    const correctPasscode = this.configService.getPasscode();
    if (passcode === correctPasscode) {
      this.isUnlocked.set(true);
      return true;
    }
    return false;
  }

  lock(): void {
    this.isUnlocked.set(false);
  }
}
