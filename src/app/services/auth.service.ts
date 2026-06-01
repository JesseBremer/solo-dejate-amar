import { Injectable, signal, effect, inject } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private configService = inject(ConfigService);
  private readonly STORAGE_KEY = 'safeUnlocked';

  readonly isUnlocked = signal(this.checkStoredAuth());

  constructor() {
    effect(() => {
      if (this.isUnlocked()) {
        sessionStorage.setItem(this.STORAGE_KEY, 'true');
      } else {
        sessionStorage.removeItem(this.STORAGE_KEY);
      }
    });
  }

  private checkStoredAuth(): boolean {
    return sessionStorage.getItem(this.STORAGE_KEY) === 'true';
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
