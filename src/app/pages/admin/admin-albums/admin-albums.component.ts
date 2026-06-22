import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlbumsService } from '../../../services/albums.service';
import { PhotoAlbum } from '../../../models';

@Component({
  selector: 'app-admin-albums',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <h2 class="text-xl text-romantic-coral font-semibold">Manage Albums</h2>
      <p class="text-gray-400 text-sm -mt-3">
        Paste a Google Photos shared-album link. Both of you can add photos to the album from your phones;
        the gallery just shows a card that opens it.
      </p>

      <!-- Add/Edit Form -->
      <div class="flex flex-col gap-4 p-4 border border-romantic-pink/30 rounded-lg">
        <h3 class="text-lg text-romantic-text-light">{{ editingId() ? 'Edit Album' : 'Add New Album' }}</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light text-sm">Title</label>
            <input
              type="text"
              [(ngModel)]="title"
              placeholder="Our First Week"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light text-sm">Sort Order</label>
            <input
              type="number"
              [(ngModel)]="sortOrder"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="text-romantic-text-light text-sm">Google Photos Album URL</label>
            <input
              type="url"
              [(ngModel)]="url"
              placeholder="https://photos.app.goo.gl/..."
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="text-romantic-text-light text-sm">Description (optional)</label>
            <input
              type="text"
              [(ngModel)]="description"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="text-romantic-text-light text-sm">Cover Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              (change)="onCoverSelected($event)"
              class="text-sm text-gray-300 file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-romantic-pink file:text-white" />
            @if (coverPath()) {
              <span class="text-xs text-green-400">✓ Cover ready</span>
            }
          </div>
        </div>

        <div class="flex gap-2">
          <button
            (click)="save()"
            [disabled]="uploading()"
            class="px-4 py-2 bg-romantic-pink text-white rounded hover:bg-romantic-pink/80 transition-colors disabled:opacity-60">
            {{ uploading() ? 'Uploading…' : (editingId() ? 'Update' : 'Add Album') }}
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

      <!-- Albums List -->
      <div class="flex flex-col gap-3">
        <h3 class="text-lg text-romantic-text-light">Albums ({{ albumsService.albums().length }})</h3>

        @for (album of albumsService.albums(); track album.id) {
          <div class="flex items-center justify-between p-3 bg-white/5 border border-romantic-pink/20 rounded">
            <div class="flex flex-col min-w-0">
              <span class="text-white font-medium">{{ album.title }}</span>
              <a [href]="album.url" target="_blank" rel="noopener noreferrer" class="text-jesse-blue text-sm truncate hover:underline">{{ album.url }}</a>
            </div>
            <div class="flex gap-2 shrink-0">
              <button
                (click)="edit(album)"
                class="px-3 py-1 text-sm border border-jesse-blue text-jesse-blue rounded hover:bg-jesse-blue/20 transition-colors">
                Edit
              </button>
              <button
                (click)="delete(album.id)"
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
export class AdminAlbumsComponent implements OnInit {
  albumsService = inject(AlbumsService);

  title = '';
  url = '';
  description = '';
  sortOrder = 0;
  coverPath = signal<string | null>(null);
  uploading = signal(false);
  editingId = signal<string | null>(null);

  ngOnInit(): void {
    this.albumsService.loadAll();
  }

  async onCoverSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    const path = await this.albumsService.uploadCover(file);
    this.uploading.set(false);
    if (path) this.coverPath.set(path);
  }

  async save(): Promise<void> {
    if (!this.title || !this.url) return;

    const albumData = {
      title: this.title,
      url: this.url,
      description: this.description || null,
      cover_path: this.coverPath(),
      sort_order: this.sortOrder,
    };

    if (this.editingId()) {
      await this.albumsService.update(this.editingId()!, albumData);
    } else {
      await this.albumsService.create(albumData);
    }

    this.resetForm();
  }

  edit(album: PhotoAlbum): void {
    this.editingId.set(album.id);
    this.title = album.title;
    this.url = album.url;
    this.description = album.description ?? '';
    this.sortOrder = album.sort_order;
    this.coverPath.set(album.cover_path);
  }

  cancelEdit(): void {
    this.resetForm();
  }

  async delete(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this album? (The photos stay safe in Google Photos.)')) {
      await this.albumsService.delete(id);
    }
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.title = '';
    this.url = '';
    this.description = '';
    this.coverPath.set(null);
    this.sortOrder = this.albumsService.albums().length;
  }
}
