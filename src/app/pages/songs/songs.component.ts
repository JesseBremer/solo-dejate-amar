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

      <div class="w-full max-w-[600px] flex flex-col gap-2 mb-6">
        @for (song of songsService.songs(); track song.id) {
          <div class="flex items-center gap-3 px-4 py-3 rounded-xl"
               [class]="song.shared_by === 'jesse'
                 ? 'border-l-[3px] border-l-jesse-blue bg-jesse-blue/5'
                 : 'border-l-[3px] border-l-romantic-pink bg-romantic-pink/5'">

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-white leading-tight truncate">{{ song.title }}</p>
              <p class="text-xs text-romantic-text/45 italic truncate">{{ song.artist }}</p>
            </div>

            <!-- Platform icon links -->
            <div class="flex items-center gap-1.5 shrink-0">
              @if (song.spotify_url) {
                <a [href]="song.spotify_url" target="_blank" rel="noopener"
                   title="Open in Spotify"
                   class="w-8 h-8 rounded-full flex items-center justify-center bg-[#1DB954]/10 border border-[#1DB954]/30 text-[#1DB954] transition-all duration-200 hover:bg-[#1DB954]/25 active:scale-90">
                  <!-- Spotify icon -->
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </a>
              }
              @if (song.youtube_url) {
                <a [href]="song.youtube_url" target="_blank" rel="noopener"
                   [title]="song.youtube_url.includes('music.youtube') ? 'Open in YouTube Music' : 'Open in YouTube'"
                   class="w-8 h-8 rounded-full flex items-center justify-center bg-[#ff0000]/10 border border-[#ff0000]/30 text-[#ff0000] transition-all duration-200 hover:bg-[#ff0000]/25 active:scale-90">
                  <!-- YouTube / YouTube Music icon -->
                  @if (song.youtube_url.includes('music.youtube')) {
                    <!-- Music note for YT Music -->
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/>
                    </svg>
                  } @else {
                    <!-- Play button for YouTube -->
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                  }
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
