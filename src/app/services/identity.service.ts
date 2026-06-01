import { Injectable, signal } from '@angular/core';

export type AppUser = 'jesse' | 'abigail';

@Injectable({ providedIn: 'root' })
export class IdentityService {
  private userSignal = signal<AppUser>(
    (localStorage.getItem('sda_user') as AppUser) ?? 'jesse'
  );

  readonly user = this.userSignal.asReadonly();

  set(user: AppUser): void {
    this.userSignal.set(user);
    localStorage.setItem('sda_user', user);
  }
}
