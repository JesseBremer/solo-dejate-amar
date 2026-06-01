import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

const MAIN_NAV = [
  {
    route: '/',
    label: 'Home',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>`,
  },
  {
    route: '/gallery',
    label: 'Memories',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>`,
  },
  {
    route: '/songs',
    label: 'Songs',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </svg>`,
  },
  {
    route: '/journal',
    label: 'Journal',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>`,
  },
  {
    route: '/dreams',
    label: 'Dreams',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`,
  },
] as const;

const MORE_NAV = [
  {
    route: '/jar',
    label: 'Jar',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.134 4.085.001 7.705.001 9.6.001 11.3.857 12 2.025 12.7.857 14.4.001 16.295.001 19.915.001 23 3.134 23 7.191c0 4.105-5.371 8.863-11 14.402z"/>
    </svg>`,
  },
  {
    route: '/map',
    label: 'Map',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>`,
  },
] as const;

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- More tray — slides up above the nav bar -->
    @if (moreOpen()) {
      <div class="fixed inset-0 z-30" (click)="moreOpen.set(false)"></div>
      <div class="fixed bottom-[calc(56px+env(safe-area-inset-bottom))] right-0 z-40 m-3 rounded-2xl border border-romantic-pink/20 bg-[#1a0810]/95 backdrop-blur-md overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        @for (item of moreItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="text-romantic-pink"
            [routerLinkActiveOptions]="{ exact: false }"
            (click)="moreOpen.set(false)"
            class="flex items-center gap-3 px-5 py-3.5 text-romantic-text/50 hover:text-romantic-pink hover:bg-romantic-pink/5 transition-colors duration-150 active:bg-romantic-pink/10">
            <span class="w-5 h-5 shrink-0" [innerHTML]="item.icon"></span>
            <span class="text-sm font-serif">{{ item.label }}</span>
          </a>
        }
      </div>
    }

    <nav class="fixed bottom-0 left-0 right-0 z-40 bg-romantic-dark/95 backdrop-blur-md border-t border-romantic-pink/15
                flex items-stretch justify-around
                pb-[env(safe-area-inset-bottom)]">

      @for (item of mainItems; track item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="text-romantic-pink"
          [routerLinkActiveOptions]="{ exact: item.route === '/' }"
          class="flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 text-romantic-text/40 transition-colors duration-200 active:scale-95 touch-none select-none min-h-[56px]">
          <span class="w-6 h-6" [innerHTML]="item.icon"></span>
          <span class="text-[10px] font-serif leading-none">{{ item.label }}</span>
        </a>
      }

      <!-- More button -->
      <button (click)="moreOpen.set(!moreOpen())"
        class="flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 transition-colors duration-200 active:scale-95 touch-none select-none min-h-[56px]"
        [class]="moreOpen() ? 'text-romantic-pink' : 'text-romantic-text/40'">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>
          <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none"/>
        </svg>
        <span class="text-[10px] font-serif leading-none">More</span>
      </button>

    </nav>
  `,
})
export class NavBarComponent {
  readonly mainItems = MAIN_NAV;
  readonly moreItems = MORE_NAV;
  moreOpen = signal(false);
}
