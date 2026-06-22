import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SongsService } from '../../../services/songs.service';
import { ConfigService } from '../../../services/config.service';
import { Song } from '../../../models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-songs',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <h2 class="text-xl text-romantic-coral font-semibold">Manage Songs</h2>
        <button
          (click)="syncYouTube()"
          [disabled]="syncing()"
          class="px-3 py-1.5 text-sm border border-red-500 text-red-400 rounded hover:bg-red-500/15 transition-colors disabled:opacity-50">
          {{ syncing() ? 'Syncing…' : '🎵 Sync all to YouTube' }}
        </button>
      </div>

      @if (syncResult()) {
        <div class="text-sm p-3 rounded border border-green-500/30 bg-green-500/5 text-romantic-text-light">
          @if (syncResult()!.error) {
            <span class="text-red-400">Sync failed: {{ syncResult()!.error }}</span>
          } @else {
            <span>Added {{ syncResult()!.added }} of {{ syncResult()!.total }} songs to the playlist.</span>
            @if (syncResult()!.unmatched?.length) {
              <div class="mt-2 text-romantic-text/60">
                Couldn't match {{ syncResult()!.unmatched!.length }} on YouTube:
                <ul class="list-disc list-inside mt-1">
                  @for (name of syncResult()!.unmatched; track name) {
                    <li>{{ name }}</li>
                  }
                </ul>
              </div>
            }
          }
        </div>
      }

      <!-- Playlist links shown on the songs page -->
      <div class="flex flex-col gap-4 p-4 border border-romantic-pink/30 rounded-lg">
        <h3 class="text-lg text-romantic-text-light">Playlist Links</h3>

        <div class="flex flex-col gap-2">
          <label class="text-romantic-text-light text-sm">YouTube playlist link</label>
          <input
            type="url"
            [(ngModel)]="youtubePlaylistUrl"
            placeholder="https://music.youtube.com/playlist?list=…"
            class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink placeholder:text-gray-500" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-romantic-text-light text-sm">Spotify playlist link</label>
          <input
            type="url"
            [(ngModel)]="spotifyPlaylistUrl"
            placeholder="https://open.spotify.com/playlist/…"
            class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink placeholder:text-gray-500" />
          <p class="text-gray-500 text-xs">Update after each monthly transfer makes a new Spotify playlist. Leave blank to hide the button.</p>
        </div>

        <div class="flex items-center gap-3">
          <button
            (click)="savePlaylists()"
            [disabled]="savingPlaylists()"
            class="self-start px-4 py-2 bg-romantic-pink text-white rounded hover:bg-romantic-pink/80 transition-colors disabled:opacity-50">
            {{ savingPlaylists() ? 'Saving…' : 'Save Links' }}
          </button>
          @if (playlistSaved()) {
            <span class="text-green-400 text-sm">Saved!</span>
          }
        </div>
      </div>

      <!-- Add/Edit Form -->
      <div class="flex flex-col gap-4 p-4 border border-romantic-pink/30 rounded-lg">
        <h3 class="text-lg text-romantic-text-light">{{ editingId() ? 'Edit Song' : 'Add New Song' }}</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light text-sm">Title</label>
            <input
              type="text"
              [(ngModel)]="title"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light text-sm">Artist</label>
            <input
              type="text"
              [(ngModel)]="artist"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light text-sm">Shared By</label>
            <select
              [(ngModel)]="sharedBy"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink">
              <option value="jesse">Jesse</option>
              <option value="abigail">Abigail</option>
            </select>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light text-sm">Sort Order</label>
            <input
              type="number"
              [(ngModel)]="sortOrder"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="text-romantic-text-light text-sm">Spotify URL</label>
            <input
              type="url"
              [(ngModel)]="spotifyUrl"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="text-romantic-text-light text-sm">YouTube URL (optional)</label>
            <input
              type="url"
              [(ngModel)]="youtubeUrl"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>
        </div>

        <div class="flex gap-2">
          <button
            (click)="save()"
            class="px-4 py-2 bg-romantic-pink text-white rounded hover:bg-romantic-pink/80 transition-colors">
            {{ editingId() ? 'Update' : 'Add Song' }}
          </button>
          @if (editingId()) {
            <button
              (click)="cancelEdit()"
              class="px-4 py-2 border border-gray-500 text-gray-400 rounded hover:bg-gray-500/20 transition-colors">
              Cancel
            </button>
          }
        </div>
      </div>

      <!-- Songs List -->
      <div class="flex flex-col gap-3">
        <h3 class="text-lg text-romantic-text-light">Songs ({{ songsService.songs().length }})</h3>

        @for (song of songsService.songs(); track song.id) {
          <div class="flex items-center justify-between p-3 bg-white/5 border border-romantic-pink/20 rounded">
            <div class="flex flex-col">
              <span class="text-white font-medium">{{ song.title }}</span>
              <span class="text-gray-400 text-sm">{{ song.artist }} - {{ song.shared_by }}</span>
            </div>
            <div class="flex gap-2">
              <button
                (click)="edit(song)"
                class="px-3 py-1 text-sm border border-jesse-blue text-jesse-blue rounded hover:bg-jesse-blue/20 transition-colors">
                Edit
              </button>
              <button
                (click)="delete(song.id)"
                class="px-3 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-500/20 transition-colors">
                Delete
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminSongsComponent implements OnInit {
  songsService = inject(SongsService);
  private configService = inject(ConfigService);

  youtubePlaylistUrl = '';
  spotifyPlaylistUrl = '';
  savingPlaylists = signal(false);
  playlistSaved = signal(false);

  title = '';
  artist = '';
  sharedBy: 'jesse' | 'abigail' = 'abigail';
  spotifyUrl = '';
  youtubeUrl = '';
  sortOrder = 0;
  editingId = signal<string | null>(null);

  syncing = signal(false);
  syncResult = signal<{ total?: number; added?: number; unmatched?: string[]; error?: string } | null>(null);

  async ngOnInit(): Promise<void> {
    this.songsService.loadAll();
    if (!this.configService.config()) await this.configService.load();
    const c = this.configService.config();
    this.youtubePlaylistUrl = c?.youtube_playlist_url ?? '';
    this.spotifyPlaylistUrl = c?.spotify_playlist_url ?? '';
  }

  async savePlaylists(): Promise<void> {
    this.savingPlaylists.set(true);
    this.playlistSaved.set(false);
    await this.configService.update({
      youtube_playlist_url: this.youtubePlaylistUrl.trim() || null,
      spotify_playlist_url: this.spotifyPlaylistUrl.trim() || null,
    });
    this.savingPlaylists.set(false);
    this.playlistSaved.set(true);
    setTimeout(() => this.playlistSaved.set(false), 3000);
  }

  async syncYouTube(): Promise<void> {
    this.syncing.set(true);
    this.syncResult.set(null);
    try {
      const res = await fetch('/.netlify/functions/youtube-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(environment.functionSecret && { 'x-function-secret': environment.functionSecret }),
        },
      });
      const data = await res.json();
      this.syncResult.set(res.ok ? data : { error: data.error || `HTTP ${res.status}` });
    } catch (err: any) {
      this.syncResult.set({ error: err?.message ?? String(err) });
    } finally {
      this.syncing.set(false);
    }
  }

  async save(): Promise<void> {
    if (!this.title || !this.artist || !this.spotifyUrl) return;

    const songData = {
      title: this.title,
      artist: this.artist,
      shared_by: this.sharedBy,
      spotify_url: this.spotifyUrl,
      youtube_url: this.youtubeUrl || null,
      sort_order: this.sortOrder,
    };

    if (this.editingId()) {
      await this.songsService.update(this.editingId()!, songData);
    } else {
      await this.songsService.create(songData);
    }

    this.resetForm();
  }

  edit(song: Song): void {
    this.editingId.set(song.id);
    this.title = song.title;
    this.artist = song.artist;
    this.sharedBy = song.shared_by;
    this.spotifyUrl = song.spotify_url ?? "";
    this.youtubeUrl = song.youtube_url ?? '';
    this.sortOrder = song.sort_order;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  async delete(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this song?')) {
      await this.songsService.delete(id);
    }
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.title = '';
    this.artist = '';
    this.sharedBy = 'abigail';
    this.spotifyUrl = '';
    this.youtubeUrl = '';
    this.sortOrder = this.songsService.songs().length;
  }
}
