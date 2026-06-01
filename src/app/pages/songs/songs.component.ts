import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SongsService } from '../../services/songs.service';
import { environment } from '../../../environments/environment';

type Platform = 'spotify' | 'youtube-music' | 'youtube' | null;

function detectPlatform(url: string): Platform {
  if (url.includes('open.spotify.com')) return 'spotify';
  if (url.includes('music.youtube.com')) return 'youtube-music';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return null;
}

@Component({
  selector: 'app-songs',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col items-center w-full px-4 pt-8 pb-6">
      <h1 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-1"
          style="text-shadow: 2px 2px 4px rgba(255,105,180,0.2);">
        The Soundtrack of Us
      </h1>
      <p class="text-romantic-text/40 text-sm font-serif italic mb-6 text-center">{{ songsService.songs().length }} songs in our story</p>

      <div class="flex items-center gap-4 mb-6 text-xs font-serif">
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-jesse-blue inline-block"></span>
          <span class="text-romantic-text/60">Jesse</span>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-romantic-pink inline-block"></span>
          <span class="text-romantic-text/60">Abigail</span>
        </span>
      </div>

      <div class="w-full max-w-[600px] flex flex-col gap-3 mb-6">
        @for (song of songsService.songs(); track song.id) {
          <div class="flex flex-col p-4 rounded-xl transition-transform duration-200 active:scale-[0.99]"
               [class]="song.shared_by === 'jesse'
                 ? 'border-l-4 border-l-jesse-blue bg-jesse-blue/5'
                 : 'border-l-4 border-l-romantic-pink bg-romantic-pink/5'">
            <span class="text-[10px] uppercase tracking-widest mb-1.5"
                  [class]="song.shared_by === 'jesse' ? 'text-jesse-blue' : 'text-romantic-pink'">
              {{ song.shared_by === 'jesse' ? 'Jesse' : 'Abigail' }}
            </span>
            <p class="text-base font-semibold text-white leading-tight mb-0.5">{{ song.title }}</p>
            <p class="text-sm text-romantic-text/50 italic mb-3">{{ song.artist }}</p>
            <div class="flex gap-2 flex-wrap">
              @if (song.spotify_url) {
                <a [href]="song.spotify_url" target="_blank" rel="noopener"
                   [class]="getLinkClass(song.spotify_url)"
                   class="flex-1 text-center py-2 px-3 rounded-lg text-xs font-serif border transition-colors duration-200 min-h-[36px] flex items-center justify-center">
                  {{ getLinkLabel(song.spotify_url) }}
                </a>
              }
              @if (song.youtube_url) {
                <a [href]="song.youtube_url" target="_blank" rel="noopener"
                   [class]="getLinkClass(song.youtube_url)"
                   class="flex-1 text-center py-2 px-3 rounded-lg text-xs font-serif border transition-colors duration-200 min-h-[36px] flex items-center justify-center">
                  {{ getLinkLabel(song.youtube_url) }}
                </a>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Floating add button -->
    <button
      (click)="openSheet()"
      class="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-romantic-pink text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral hover:shadow-[0_0_28px_rgba(255,105,180,0.6)] active:scale-95">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
      </svg>
    </button>

    <!-- Add song bottom sheet -->
    @if (sheetOpen()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeSheet()"></div>

        <!-- Sheet -->
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1"></div>
          <h3 class="text-romantic-coral font-romantic text-2xl text-center">Add a Song</h3>

          <!-- URL input -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">Spotify or YouTube Music link</label>
            <div class="relative">
              <input
                type="url"
                inputmode="url"
                [(ngModel)]="urlInput"
                (input)="onUrlChange()"
                placeholder="Paste link here..."
                class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25 pr-10" />
              @if (detecting()) {
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-romantic-pink/60 text-xs animate-pulse">...</span>
              }
              @if (detectedPlatform()) {
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-base">{{ platformEmoji() }}</span>
              }
            </div>
          </div>

          <!-- Title -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">Song title</label>
            <input
              type="text"
              [(ngModel)]="titleInput"
              placeholder="Title"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25" />
          </div>

          <!-- Artist -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">Artist</label>
            <input
              type="text"
              [(ngModel)]="artistInput"
              placeholder="Artist name"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25" />
          </div>

          <!-- Shared by -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">Shared by</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                (click)="sharedBy.set('jesse')"
                [class]="sharedBy() === 'jesse'
                  ? 'border-jesse-blue bg-jesse-blue/15 text-jesse-blue'
                  : 'border-romantic-text/20 text-romantic-text/40'"
                class="py-2.5 rounded-xl border text-sm font-serif transition-all duration-200">
                Jesse
              </button>
              <button
                (click)="sharedBy.set('abigail')"
                [class]="sharedBy() === 'abigail'
                  ? 'border-romantic-pink bg-romantic-pink/15 text-romantic-pink'
                  : 'border-romantic-text/20 text-romantic-text/40'"
                class="py-2.5 rounded-xl border text-sm font-serif transition-all duration-200">
                Abigail
              </button>
            </div>
          </div>

          <!-- Save -->
          <button
            (click)="save()"
            [disabled]="!canSave() || saving()"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">
            {{ saving() ? 'Adding...' : 'Add to our songs' }}
          </button>
        </div>
      </div>
    }
  `,
})
export class SongsComponent implements OnInit {
  songsService = inject(SongsService);

  sheetOpen = signal(false);
  urlInput = '';
  titleInput = '';
  artistInput = '';
  sharedBy = signal<'jesse' | 'abigail'>('abigail');
  detecting = signal(false);
  saving = signal(false);
  detectedPlatform = signal<Platform>(null);

  private detectTimeout: ReturnType<typeof setTimeout> | null = null;

  canSave = computed(() =>
    !!this.urlInput.trim() && !!this.titleInput.trim() && !!this.artistInput.trim()
  );

  platformEmoji = computed(() => {
    switch (this.detectedPlatform()) {
      case 'spotify': return '🟢';
      case 'youtube-music': return '🔴';
      case 'youtube': return '▶️';
      default: return '';
    }
  });

  ngOnInit(): void {
    this.songsService.loadAll();
  }

  getLinkClass(url: string): string {
    if (url.includes('spotify.com')) return 'text-spotify-green border-spotify-green/40 hover:bg-spotify-green/10';
    if (url.includes('music.youtube.com') || url.includes('youtube.com') || url.includes('youtu.be'))
      return 'text-youtube-red border-youtube-red/40 hover:bg-youtube-red/10';
    return 'text-romantic-text/60 border-romantic-text/20';
  }

  getLinkLabel(url: string): string {
    if (url.includes('spotify.com')) return 'Spotify';
    if (url.includes('music.youtube.com')) return 'YouTube Music';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    return 'Listen';
  }

  openSheet(): void {
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
    this.reset();
  }

  onUrlChange(): void {
    const url = this.urlInput.trim();
    const platform = detectPlatform(url);
    this.detectedPlatform.set(platform);

    if (!platform) return;

    if (this.detectTimeout) clearTimeout(this.detectTimeout);
    this.detecting.set(true);

    this.detectTimeout = setTimeout(() => this.fetchMeta(url), 600);
  }

  private async fetchMeta(url: string): Promise<void> {
    try {
      const res = await fetch('/.netlify/functions/song-meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(environment.functionSecret && { 'x-function-secret': environment.functionSecret }),
        },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error('lookup failed');
      const { title, artist } = await res.json();
      if (title && !this.titleInput) this.titleInput = title;
      if (artist && !this.artistInput) this.artistInput = artist;
    } catch {
      // Netlify function not available (dev mode) — user fills in manually
    } finally {
      this.detecting.set(false);
    }
  }

  async save(): Promise<void> {
    if (!this.canSave()) return;
    this.saving.set(true);

    const url = this.urlInput.trim();
    const platform = detectPlatform(url);

    const spotifyUrl = platform === 'spotify' ? url : null;
    const youtubeUrl = (platform === 'youtube' || platform === 'youtube-music') ? url : null;

    const currentSongs = this.songsService.songs();
    const maxOrder = currentSongs.reduce((m, s) => Math.max(m, s.sort_order), -1);

    await this.songsService.create({
      title: this.titleInput.trim(),
      artist: this.artistInput.trim(),
      shared_by: this.sharedBy(),
      spotify_url: spotifyUrl,
      youtube_url: youtubeUrl,
      sort_order: maxOrder + 1,
    });

    this.saving.set(false);
    this.closeSheet();
  }

  private reset(): void {
    this.urlInput = '';
    this.titleInput = '';
    this.artistInput = '';
    this.detectedPlatform.set(null);
    this.detecting.set(false);
  }
}
