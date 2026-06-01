import { Injectable, signal, computed, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'safeUnlocked';
  private readonly PASSCODE = '0505';

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
    if (passcode === this.PASSCODE) {
      this.isUnlocked.set(true);
      return true;
    }
    return false;
  }

  lock(): void {
    this.isUnlocked.set(false);
  }
}
