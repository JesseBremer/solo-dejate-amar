import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SongsService } from '../../../services/songs.service';
import { Song } from '../../../models';

@Component({
  selector: 'app-admin-songs',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <h2 class="text-xl text-romantic-coral font-semibold">Manage Songs</h2>

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

  title = '';
  artist = '';
  sharedBy: 'jesse' | 'abigail' = 'abigail';
  spotifyUrl = '';
  youtubeUrl = '';
  sortOrder = 0;
  editingId = signal<string | null>(null);

  ngOnInit(): void {
    this.songsService.loadAll();
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
    this.spotifyUrl = song.spotify_url;
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
