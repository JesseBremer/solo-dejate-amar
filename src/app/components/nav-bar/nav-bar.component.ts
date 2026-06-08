import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../services/language.service';

const MAIN_NAV_ROUTES = [
  { route: '/gallery', key: 'nav_memories' as const, emoji: '📸' },
  { route: '/journal', key: 'nav_journal'  as const, emoji: '📖' },
  { route: '/',        key: 'nav_home'     as const, emoji: '🏠' },
  { route: '/ideas',   key: 'nav_ideas'    as const, emoji: '💡' },
  { route: '/map',     key: 'nav_map'      as const, emoji: '🗺️' },
];

const MORE_NAV_ROUTES = [
  { route: '/dictionary', key: 'nav_dictionary' as const, emoji: '📔' },
  { route: '/timeline',   key: 'nav_timeline'   as const, emoji: '📜' },
  { route: '/vault',      key: 'nav_vault'      as const, emoji: '🔐' },
  { route: '/jar',        key: 'nav_jar'        as const, emoji: '💌' },
  { route: '/cycle',      key: 'nav_cycle'      as const, emoji: '🌙' },
  { route: '/songs',      key: 'nav_songs'      as const, emoji: '🎵' },
  { route: '/dreams',     key: 'nav_dreams'     as const, emoji: '✨' },
];

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- More tray -->
    @if (moreOpen()) {
      <div class="fixed inset-0 z-[59]" (click)="moreOpen.set(false)"></div>
      <div class="fixed bottom-[calc(56px+env(safe-area-inset-bottom))] right-0 z-[60] m-3 rounded-2xl border border-romantic-pink/20 bg-[#1a0810]/95 backdrop-blur-md overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        @for (item of moreItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="text-romantic-pink"
            [routerLinkActiveOptions]="{ exact: false }"
            (click)="moreOpen.set(false)"
            class="flex items-center gap-3 px-5 py-3.5 text-romantic-text/50 hover:text-romantic-pink hover:bg-romantic-pink/5 transition-colors duration-150 active:bg-romantic-pink/10">
            <span class="text-lg">{{ item.emoji }}</span>
            <span class="text-sm font-serif">{{ t()[item.key] }}</span>
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
          class="flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 text-romantic-text/60 transition-colors duration-200 active:scale-95 touch-none select-none min-h-[56px]">
          <span class="text-xl leading-none">{{ item.emoji }}</span>
          <span class="text-[11px] font-serif leading-none mt-0.5">{{ t()[item.key] }}</span>
        </a>
      }

      <!-- More button -->
      <button (click)="moreOpen.set(!moreOpen())"
        class="flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 transition-colors duration-200 active:scale-95 touch-none select-none min-h-[56px]"
        [class]="moreOpen() ? 'text-romantic-pink' : 'text-romantic-text/60'">
        <span class="text-xl leading-none">•••</span>
        <span class="text-[11px] font-serif leading-none mt-0.5">{{ t().nav_more }}</span>
      </button>

    </nav>
  `,
})
export class NavBarComponent {
  private langService = inject(LanguageService);

  readonly t = this.langService.t;
  readonly mainItems = MAIN_NAV_ROUTES;
  readonly moreItems = MORE_NAV_ROUTES;
  moreOpen = signal(false);
}
