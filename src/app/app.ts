import { Component, computed, effect, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { AuthService } from './services/auth.service';
import { LocationShareService } from './services/location-share.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent],
  template: `
    <main class="flex flex-col w-full min-h-screen" [class.pb-[env(safe-area-inset-bottom)]]="false"
          [class.pb-20]="showNav()">
      <router-outlet />
    </main>
    @if (showNav()) {
      <app-nav-bar />
    }
  `
})
export class App {
  private router = inject(Router);
  private authService = inject(AuthService);
  private locationShareService = inject(LocationShareService);

  // Update location once per app open (once unlocked) — prompts the first time if needed.
  private autoSharedThisSession = false;
  private autoShareEffect = effect(() => {
    if (this.authService.isUnlocked() && !this.autoSharedThisSession) {
      this.autoSharedThisSession = true;
      this.locationShareService.requestLocationOnOpen();
    }
  });

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  showNav = computed(() => {
    const url = this.currentUrl();
    return !url.startsWith('/unlock') && !url.startsWith('/admin');
  });
}
