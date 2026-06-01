import { Component, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpicyMeterComponent } from '../../components/spicy-meter/spicy-meter.component';
import { ConfigService } from '../../services/config.service';
import { JournalService } from '../../services/journal.service';
import { GalleryService } from '../../services/gallery.service';
import { SongsService } from '../../services/songs.service';

declare const confetti: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, SpicyMeterComponent],
  template: `
    <div class="w-full px-4 pt-8 pb-6 flex flex-col items-center gap-6 max-w-[600px] mx-auto">

      <!-- Greeting -->
      <div class="w-full text-center">
        <p class="text-romantic-text/40 text-sm font-serif">{{ greeting() }}</p>
        <h1 class="text-romantic-pink font-romantic text-4xl md:text-5xl mt-1 animate-pulse-glow">
          Jesse & Abigail
        </h1>
      </div>

      <!-- Days together hero -->
      <div class="w-full rounded-2xl border border-romantic-pink/20 bg-romantic-pink/5 px-6 py-6 text-center">
        <p class="text-romantic-text/40 text-xs font-serif uppercase tracking-widest mb-1">together for</p>
        <p class="text-7xl font-bold text-romantic-pink leading-none">{{ daysTogether() }}</p>
        <p class="text-romantic-text/60 text-sm font-serif mt-1">days</p>
        <p class="text-romantic-text/30 text-xs font-serif mt-3">since {{ startDateLabel() }}</p>
      </div>

      <!-- Countdown (only if still in the future) -->
      @if (countdown()) {
        <div class="w-full rounded-2xl border border-romantic-coral/20 bg-romantic-coral/5 px-5 py-4 text-center">
          <p class="text-romantic-text/40 text-xs font-serif uppercase tracking-widest mb-1">next milestone</p>
          <p class="text-3xl font-bold text-romantic-coral leading-none">{{ countdown()!.days }}</p>
          <p class="text-romantic-text/50 text-xs font-serif mt-1">
            {{ countdown()!.days === 1 ? 'day' : 'days' }} until {{ countdown()!.label }}
          </p>
        </div>
      }

      <!-- Recent activity -->
      <div class="w-full flex flex-col gap-3">
        <p class="text-romantic-text/30 text-xs font-serif uppercase tracking-widest">Recent</p>

        <!-- Latest journal entry -->
        @if (latestEntry()) {
          <a routerLink="/journal"
             class="w-full rounded-2xl border border-romantic-pink/15 bg-white/3 px-4 py-3.5 flex items-start gap-3 active:scale-[0.99] transition-transform">
            <span class="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  [class]="latestEntry()!.author === 'jesse' ? 'bg-jesse-blue' : 'bg-romantic-pink'"></span>
            <div class="flex flex-col gap-0.5 flex-1 min-w-0">
              <div class="flex items-baseline gap-2">
                <span class="text-xs font-serif"
                      [class]="latestEntry()!.author === 'jesse' ? 'text-jesse-blue' : 'text-romantic-pink'">
                  {{ latestEntry()!.author === 'jesse' ? 'Jesse' : 'Abigail' }} wrote
                </span>
                <span class="text-romantic-text/25 text-[10px] font-serif">{{ formatRelative(latestEntry()!.created_at) }}</span>
              </div>
              @if (latestEntry()!.title) {
                <p class="text-romantic-text text-sm font-serif font-semibold truncate">{{ latestEntry()!.title }}</p>
              }
              <p class="text-romantic-text/50 text-xs font-serif leading-relaxed line-clamp-2">{{ latestEntry()!.content }}</p>
            </div>
          </a>
        } @else {
          <a routerLink="/journal"
             class="w-full rounded-2xl border border-dashed border-romantic-pink/15 px-4 py-3.5 text-romantic-text/25 text-xs font-serif italic text-center active:scale-[0.99] transition-transform">
            No journal entries yet — write the first one
          </a>
        }

        <!-- Latest photo + latest song side by side -->
        <div class="grid grid-cols-2 gap-3">

          <!-- Latest photo -->
          @if (latestPhoto()) {
            <a routerLink="/gallery"
               class="rounded-2xl overflow-hidden border border-romantic-pink/15 aspect-square relative active:scale-[0.99] transition-transform">
              <img [src]="latestPhoto()!.url" alt="Latest memory" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <p class="absolute bottom-2 left-2.5 text-white text-[10px] font-serif">Latest memory</p>
            </a>
          } @else {
            <a routerLink="/gallery"
               class="rounded-2xl border border-dashed border-romantic-pink/15 aspect-square flex items-center justify-center active:scale-[0.99] transition-transform">
              <p class="text-romantic-text/25 text-[10px] font-serif italic text-center px-2">Add your first photo</p>
            </a>
          }

          <!-- Latest song -->
          @if (latestSong()) {
            <a [href]="latestSong()!.spotify_url || latestSong()!.youtube_url || '#'" target="_blank" rel="noopener"
               class="rounded-2xl border border-romantic-pink/15 bg-white/3 aspect-square flex flex-col justify-between p-3 active:scale-[0.99] transition-transform">
              <div class="w-8 h-8 rounded-full flex items-center justify-center"
                   [class]="latestSong()!.shared_by === 'jesse' ? 'bg-jesse-blue/20' : 'bg-romantic-pink/20'">
                <svg class="w-4 h-4" [class]="latestSong()!.shared_by === 'jesse' ? 'text-jesse-blue' : 'text-romantic-pink'"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <div class="flex flex-col gap-0.5">
                <p class="text-romantic-text text-xs font-serif font-semibold leading-tight line-clamp-2">{{ latestSong()!.title }}</p>
                <p class="text-romantic-text/40 text-[10px] font-serif italic truncate">{{ latestSong()!.artist }}</p>
                <p class="text-[10px] mt-1"
                   [class]="latestSong()!.shared_by === 'jesse' ? 'text-jesse-blue' : 'text-romantic-pink'">
                  from {{ latestSong()!.shared_by === 'jesse' ? 'Jesse' : 'Abigail' }}
                </p>
              </div>
            </a>
          } @else {
            <a routerLink="/songs"
               class="rounded-2xl border border-dashed border-romantic-pink/15 aspect-square flex items-center justify-center active:scale-[0.99] transition-transform">
              <p class="text-romantic-text/25 text-[10px] font-serif italic text-center px-2">Add your first song</p>
            </a>
          }

        </div>
      </div>

      <!-- Spicy meter -->
      <app-spicy-meter [score]="spicyScore()" class="w-full" />

      <!-- Confetti -->
      <button (click)="rainRoses()"
        class="w-full py-3.5 rounded-2xl border border-romantic-pink/30 bg-romantic-pink/10 text-romantic-pink font-serif text-base transition-all duration-300 active:scale-[0.98] hover:bg-romantic-pink hover:text-white hover:shadow-[0_0_20px_rgba(255,105,180,0.4)]">
        🌹 Rain roses
      </button>

    </div>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  private configService = inject(ConfigService);
  private journalService = inject(JournalService);
  private galleryService = inject(GalleryService);
  private songsService = inject(SongsService);

  private ticker: ReturnType<typeof setInterval> | null = null;
  private now = computed(() => new Date());

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning ☀️';
    if (h < 17) return 'Good afternoon 🌤️';
    if (h < 21) return 'Good evening 🌙';
    return 'Good night ✨';
  });

  daysTogether = computed(() => {
    const config = this.configService.config();
    const start = new Date(config?.start_date ?? '2026-05-05');
    return Math.floor((Date.now() - start.getTime()) / 86400000);
  });

  startDateLabel = computed(() => {
    const config = this.configService.config();
    const start = new Date(config?.start_date ?? '2026-05-05');
    return start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  });

  countdown = computed(() => {
    const config = this.configService.config();
    if (!config?.target_date) return null;
    const target = new Date(config.target_date + 'T00:00:00');
    const days = Math.ceil((target.getTime() - Date.now()) / 86400000);
    if (days <= 0) return null;
    return {
      days,
      label: target.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
    };
  });

  spicyScore = computed(() => this.configService.config()?.spicy_score ?? 5);

  latestEntry = computed(() => this.journalService.entries()[0] ?? null);

  latestPhoto = computed(() => {
    const img = this.galleryService.images()[0];
    return img ? { url: this.galleryService.getPublicUrl(img.storage_path) } : null;
  });

  latestSong = computed(() => {
    const songs = [...this.songsService.songs()];
    if (!songs.length) return null;
    return songs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  });

  ngOnInit(): void {
    this.journalService.loadAll();
    this.galleryService.loadAll();
    this.songsService.loadAll();
  }

  ngOnDestroy(): void {
    if (this.ticker) clearInterval(this.ticker);
  }

  formatRelative(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'yesterday';
    if (d < 7) return `${d} days ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  rainRoses(): void {
    if (typeof confetti !== 'undefined') {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#ff0000', '#ff69b4', '#8b0000', '#ffb6c1'] });
    }
  }
}
