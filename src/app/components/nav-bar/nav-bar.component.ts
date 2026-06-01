import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

const NAV_ITEMS = [
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
  {
    route: '/story',
    label: 'Story',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>`,
  },
] as const;

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 z-40 bg-romantic-dark/95 backdrop-blur-md border-t border-romantic-pink/15
                flex items-stretch justify-around
                pb-[env(safe-area-inset-bottom)]">
      @for (item of navItems; track item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="text-romantic-pink"
          [routerLinkActiveOptions]="{ exact: item.route === '/' }"
          class="flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 text-romantic-text/40 transition-colors duration-200 active:scale-95 touch-none select-none min-h-[56px]">
          <span class="w-6 h-6" [innerHTML]="item.icon"></span>
          <span class="text-[10px] font-serif leading-none">{{ item.label }}</span>
        </a>
      }
    </nav>
  `,
})
export class NavBarComponent {
  readonly navItems = NAV_ITEMS;
}
