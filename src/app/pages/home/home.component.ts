import { Component, computed, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SpicyMeterComponent } from '../../components/spicy-meter/spicy-meter.component';
import { ConfigService } from '../../services/config.service';
import { JournalService } from '../../services/journal.service';
import { GalleryService } from '../../services/gallery.service';
import { SongsService } from '../../services/songs.service';

declare const confetti: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, SpicyMeterComponent],
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
        <!-- Edit button -->
        <button (click)="openEditSheet()"
          class="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-romantic-text/25 hover:text-romantic-pink hover:bg-romantic-pink/10 transition-all duration-200">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z"/>
          </svg>
        </button>

        <div class="grid grid-cols-2">
          <!-- Left: days together -->
          <div class="flex flex-col items-center justify-center px-4 py-6 text-center">
            <p class="text-romantic-text/40 text-[10px] font-serif uppercase tracking-widest mb-2">together for</p>
            <p class="text-6xl font-bold text-romantic-pink leading-none">{{ daysTogether() }}</p>
            <p class="text-romantic-text/50 text-xs font-serif mt-1.5">days</p>
            <p class="text-romantic-text/25 text-[10px] font-serif mt-2">since {{ startDateLabel() }}</p>
          </div>

          <!-- Divider -->
          <div class="absolute left-1/2 top-4 bottom-4 w-px bg-romantic-pink/15"></div>

          <!-- Right: milestone countdown -->
          <div class="flex flex-col items-center justify-center px-4 py-6 text-center">
            @if (countdown()) {
              <p class="text-romantic-text/40 text-[10px] font-serif uppercase tracking-widest mb-2">until</p>
              <p class="text-6xl font-bold text-romantic-coral leading-none">{{ countdown()!.days }}</p>
              <p class="text-romantic-text/50 text-xs font-serif mt-1.5">{{ countdown()!.days === 1 ? 'day' : 'days' }}</p>
              <p class="text-romantic-coral/60 text-[10px] font-serif mt-2 px-2 leading-tight text-center">{{ countdown()!.eventName }}</p>
            } @else {
              <button (click)="openEditSheet()" class="flex flex-col items-center gap-1.5 text-romantic-text/25 hover:text-romantic-text/50 transition-colors">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 8v4m0 4h.01"/>
                </svg>
                <p class="text-[10px] font-serif">set next milestone</p>
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
            <h3 class="text-romantic-coral font-romantic text-2xl text-center">Next Milestone</h3>

            <div class="flex flex-col gap-1.5">
              <label class="text-romantic-text/50 text-xs font-serif">Event name</label>
              <input type="text" [(ngModel)]="editEventName" placeholder="e.g. Our reunion, First trip, Anniversary…"
                class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-romantic-text/50 text-xs font-serif">Date</label>
              <input type="date" [(ngModel)]="editTargetDate"
                class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]" />
            </div>

            <button (click)="saveMilestone()" [disabled]="savingMilestone()"
              class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 active:scale-[0.98]">
              {{ savingMilestone() ? 'Saving…' : 'Save milestone' }}
            </button>
          </div>
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
    const start = new Date((config?.start_date ?? '2026-05-05') + 'T00:00:00');
    return Math.floor((Date.now() - start.getTime()) / 86400000);
  });

  startDateLabel = computed(() => {
    const config = this.configService.config();
    const start = new Date((config?.start_date ?? '2026-05-05') + 'T00:00:00');
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
      eventName: config.event_name || 'Next milestone',
      label: target.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
    };
  });

  editSheetOpen = signal(false);
  savingMilestone = signal(false);
  editEventName = '';
  editTargetDate = '';

  spicyScore = computed(() => this.configService.config()?.spicy_score ?? 5);

  latestEntry = computed(() => this.journalService.entries()[0] ?? null);

  latestPhoto = computed(() => {
    const img = this.galleryService.images()[0];
    return img ? { url: this.galleryService.getPublicUrl(img.storage_path) } : null;
  });

  latestSong = computed(() => this.songsService.songs()[0] ?? null);

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

  rainRoses(): void {
    if (typeof confetti !== 'undefined') {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#ff0000', '#ff69b4', '#8b0000', '#ffb6c1'] });
    }
  }
}
