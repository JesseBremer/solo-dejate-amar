import { Component, computed, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { JournalService } from '../../services/journal.service';
import { GalleryService } from '../../services/gallery.service';
import { SongsService } from '../../services/songs.service';
import { DreamsService } from '../../services/dreams.service';
import { LanguageService } from '../../services/language.service';
import { PushService } from '../../services/push.service';

type FeedItem =
  | { type: 'journal'; id: string; created_at: string; author: 'jesse' | 'abigail'; title: string | null; content: string }
  | { type: 'photo';   id: string; created_at: string; url: string }
  | { type: 'song';    id: string; created_at: string; shared_by: 'jesse' | 'abigail'; title: string; artist: string; href: string }
  | { type: 'dream';   id: string; created_at: string; emoji: string | null; title: string; completed: boolean };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="w-full px-4 pt-8 pb-6 flex flex-col items-center gap-6 max-w-[600px] mx-auto">

      <!-- Greeting -->
      <div class="w-full text-center">
        <p class="text-romantic-text/40 text-sm font-serif">{{ greeting() }}</p>
        <h1 class="text-romantic-pink font-romantic text-4xl md:text-5xl mt-1 animate-pulse-glow">
          Jesse & Abigail
        </h1>
      </div>

      <!-- Split counter card -->
      <div class="w-full rounded-2xl border border-romantic-pink/20 bg-romantic-pink/5 overflow-hidden relative">
        <button (click)="openEditSheet()"
          class="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-romantic-text/25 hover:text-romantic-pink hover:bg-romantic-pink/10 transition-all duration-200">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </button>

        <div class="grid grid-cols-2">
          <div class="flex flex-col items-center justify-center px-4 py-6 text-center">
            <p class="text-romantic-text/40 text-[10px] font-serif uppercase tracking-widest mb-2">{{ t().home_together_for }}</p>
            <p class="text-6xl font-bold text-romantic-pink leading-none">{{ daysTogether() }}</p>
            <p class="text-romantic-text/50 text-xs font-serif mt-1.5">{{ t().home_days }}</p>
            <p class="text-romantic-text/25 text-[10px] font-serif mt-2">{{ t().home_since }} {{ startDateLabel() }}</p>
          </div>

          <div class="absolute left-1/2 top-4 bottom-4 w-px bg-romantic-pink/15"></div>

          <div class="flex flex-col items-center justify-center px-4 py-6 text-center">
            @if (countdown()) {
              <p class="text-romantic-text/40 text-[10px] font-serif uppercase tracking-widest mb-2">{{ t().home_until }}</p>
              <p class="text-6xl font-bold text-romantic-coral leading-none">{{ countdown()!.days }}</p>
              <p class="text-romantic-text/50 text-xs font-serif mt-1.5">{{ countdown()!.days === 1 ? t().home_day : t().home_days }}</p>
              <p class="text-romantic-coral/60 text-[10px] font-serif mt-2 px-2 leading-tight text-center">{{ countdown()!.eventName }}</p>
            } @else {
              <button (click)="openEditSheet()" class="flex flex-col items-center gap-1.5 text-romantic-text/25 hover:text-romantic-text/50 transition-colors">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 8v4m0 4h.01"/>
                </svg>
                <p class="text-[10px] font-serif">{{ t().home_set_milestone }}</p>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Edit milestone sheet -->
      @if (editSheetOpen()) {
        <div class="fixed inset-0 z-50 flex flex-col justify-end">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeEditSheet()"></div>
          <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4">
            <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1"></div>
            <h3 class="text-romantic-coral font-romantic text-2xl text-center">{{ t().home_milestone_title }}</h3>
            <div class="flex flex-col gap-1.5">
              <label class="text-romantic-text/50 text-xs font-serif">{{ t().home_event_name }}</label>
              <input type="text" [(ngModel)]="editEventName" [placeholder]="t().home_event_placeholder"
                class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-romantic-text/50 text-xs font-serif">{{ t().home_date }}</label>
              <input type="date" [(ngModel)]="editTargetDate"
                class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]" />
            </div>
            <button (click)="saveMilestone()" [disabled]="savingMilestone()"
              class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 active:scale-[0.98]">
              {{ savingMilestone() ? t().home_saving : t().home_save_milestone }}
            </button>
          </div>
        </div>
      }

      <!-- Notification prompt -->
      @if (pushService.supported && !pushService.subscribed()) {
        <div class="w-full rounded-2xl border border-romantic-pink/15 bg-romantic-pink/5 px-4 py-3 flex items-center gap-3">
          <span class="text-xl">🔔</span>
          <p class="flex-1 text-romantic-text/60 text-xs font-serif">{{ t().home_notif_prompt }}</p>
          <button (click)="enableNotifications()"
            class="shrink-0 px-3 py-1.5 rounded-xl bg-romantic-pink text-white text-xs font-serif active:scale-95 transition-all">
            {{ t().home_notif_enable }}
          </button>
        </div>
      }
      @if (pushService.supported && pushService.subscribed()) {
        <p class="text-romantic-text/25 text-[11px] font-serif text-center">{{ t().home_notif_enabled }}</p>
      }

      <!-- Unified feed -->
      <div class="w-full flex flex-col gap-3">
        <p class="text-romantic-text/30 text-xs font-serif uppercase tracking-widest">{{ t().home_recent }}</p>

        @if (feed().length === 0) {
          <p class="text-romantic-text/25 text-xs font-serif italic text-center py-4">{{ t().home_feed_empty }}</p>
        }

        @for (item of feed(); track item.id) {

          <!-- Journal entry -->
          @if (item.type === 'journal') {
            <a routerLink="/journal"
               class="w-full rounded-2xl border border-romantic-pink/15 bg-white/3 px-4 py-3.5 flex items-start gap-3 active:scale-[0.99] transition-transform">
              <span class="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    [class]="item.author === 'jesse' ? 'bg-jesse-blue' : 'bg-romantic-pink'"></span>
              <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                <div class="flex items-baseline gap-2">
                  <span class="text-xs font-serif" [class]="item.author === 'jesse' ? 'text-jesse-blue' : 'text-romantic-pink'">
                    {{ item.author === 'jesse' ? 'Jesse' : 'Abigail' }} {{ t().home_wrote }}
                  </span>
                  <span class="text-romantic-text/25 text-[10px] font-serif">{{ formatRelative(item.created_at) }}</span>
                </div>
                @if (item.title) {
                  <p class="text-romantic-text text-sm font-serif font-semibold truncate">{{ item.title }}</p>
                }
                <p class="text-romantic-text/50 text-xs font-serif leading-relaxed line-clamp-2">{{ item.content }}</p>
              </div>
            </a>
          }

          <!-- Photo -->
          @if (item.type === 'photo') {
            <a routerLink="/gallery"
               class="w-full rounded-2xl border border-romantic-pink/15 bg-white/3 overflow-hidden flex items-center gap-3 active:scale-[0.99] transition-transform">
              <img [src]="item.url" alt="Memory" class="w-16 h-16 object-cover shrink-0" />
              <div class="flex flex-col gap-0.5 flex-1 min-w-0 pr-4">
                <div class="flex items-baseline gap-2">
                  <span class="text-romantic-pink text-xs font-serif">📸 {{ t().home_added_memory }}</span>
                  <span class="text-romantic-text/25 text-[10px] font-serif">{{ formatRelative(item.created_at) }}</span>
                </div>
              </div>
            </a>
          }

          <!-- Song -->
          @if (item.type === 'song') {
            <a [href]="item.href" target="_blank" rel="noopener"
               class="w-full rounded-2xl border border-romantic-pink/15 bg-white/3 px-4 py-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform">
              <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                   [class]="item.shared_by === 'jesse' ? 'bg-jesse-blue/20' : 'bg-romantic-pink/20'">
                <span class="text-base">🎵</span>
              </div>
              <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                <div class="flex items-baseline gap-2">
                  <span class="text-xs font-serif" [class]="item.shared_by === 'jesse' ? 'text-jesse-blue' : 'text-romantic-pink'">
                    {{ item.shared_by === 'jesse' ? 'Jesse' : 'Abigail' }} {{ t().home_shared_song }}
                  </span>
                  <span class="text-romantic-text/25 text-[10px] font-serif">{{ formatRelative(item.created_at) }}</span>
                </div>
                <p class="text-romantic-text text-sm font-serif font-semibold truncate">{{ item.title }}</p>
                <p class="text-romantic-text/40 text-xs font-serif italic truncate">{{ item.artist }}</p>
              </div>
            </a>
          }

          <!-- Dream -->
          @if (item.type === 'dream') {
            <a routerLink="/dreams"
               class="w-full rounded-2xl border border-romantic-pink/15 bg-white/3 px-4 py-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 bg-white/8">
                {{ item.emoji || '✨' }}
              </div>
              <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                <div class="flex items-baseline gap-2">
                  <span class="text-romantic-pink text-xs font-serif">
                    {{ item.completed ? t().home_achieved_dream : t().home_added_dream }}
                  </span>
                  <span class="text-romantic-text/25 text-[10px] font-serif">{{ formatRelative(item.created_at) }}</span>
                </div>
                <p class="text-romantic-text text-sm font-serif font-semibold truncate"
                   [class]="item.completed ? 'line-through opacity-50' : ''">
                  {{ item.title }}
                </p>
              </div>
            </a>
          }

        }
      </div>


    </div>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  private configService = inject(ConfigService);
  private journalService = inject(JournalService);
  private galleryService = inject(GalleryService);
  private songsService = inject(SongsService);
  private dreamsService = inject(DreamsService);
  private langService = inject(LanguageService);
  readonly pushService = inject(PushService);

  readonly t = this.langService.t;
  private ticker: ReturnType<typeof setInterval> | null = null;

  greeting = computed(() => {
    const h = new Date().getHours();
    const t = this.langService.t();
    if (h < 12) return t.greeting_morning;
    if (h < 17) return t.greeting_afternoon;
    if (h < 21) return t.greeting_evening;
    return t.greeting_night;
  });

  daysTogether = computed(() => {
    const config = this.configService.config();
    const start = new Date((config?.start_date ?? '2026-05-05') + 'T00:00:00');
    return Math.floor((Date.now() - start.getTime()) / 86400000);
  });

  startDateLabel = computed(() => {
    const config = this.configService.config();
    const lang = this.langService.lang();
    const start = new Date((config?.start_date ?? '2026-05-05') + 'T00:00:00');
    return start.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  });

  countdown = computed(() => {
    const config = this.configService.config();
    const lang = this.langService.lang();
    if (!config?.target_date) return null;
    const target = new Date(config.target_date + 'T00:00:00');
    const days = Math.ceil((target.getTime() - Date.now()) / 86400000);
    if (days <= 0) return null;
    return {
      days,
      eventName: config.event_name || this.langService.t().home_next_milestone,
      label: target.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'long', day: 'numeric' }),
    };
  });

  feed = computed<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    for (const e of this.journalService.entries()) {
      items.push({ type: 'journal', id: e.id, created_at: e.created_at, author: e.author, title: e.title, content: e.content });
    }

    for (const img of this.galleryService.images()) {
      items.push({ type: 'photo', id: img.id, created_at: img.created_at, url: this.galleryService.getPublicUrl(img.storage_path) });
    }

    for (const s of this.songsService.songs()) {
      items.push({ type: 'song', id: s.id, created_at: s.created_at, shared_by: s.shared_by, title: s.title, artist: s.artist, href: s.spotify_url || s.youtube_url || '#' });
    }

    for (const d of this.dreamsService.goals()) {
      items.push({ type: 'dream', id: d.id, created_at: d.created_at, emoji: d.emoji, title: d.title, completed: d.completed });
    }

    return items
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  });

  editSheetOpen = signal(false);
  savingMilestone = signal(false);
  editEventName = '';
  editTargetDate = '';

  ngOnInit(): void {
    this.journalService.loadAll();
    this.galleryService.loadAll();
    this.songsService.loadAll();
    this.dreamsService.loadAll();
    this.pushService.init();
  }

  enableNotifications(): void {
    this.pushService.subscribe();
  }

  ngOnDestroy(): void {
    if (this.ticker) clearInterval(this.ticker);
  }

  formatRelative(iso: string): string {
    return this.langService.formatRelative(iso);
  }

  openEditSheet(): void {
    const config = this.configService.config();
    this.editEventName = config?.event_name ?? '';
    this.editTargetDate = config?.target_date ?? '';
    this.editSheetOpen.set(true);
  }

  closeEditSheet(): void {
    this.editSheetOpen.set(false);
  }

  async saveMilestone(): Promise<void> {
    if (!this.editTargetDate) return;
    this.savingMilestone.set(true);
    await this.configService.update({
      target_date: this.editTargetDate,
      event_name: this.editEventName.trim() || null,
    });
    this.savingMilestone.set(false);
    this.closeEditSheet();
  }

}
