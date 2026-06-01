import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GalleryService } from '../../../services/gallery.service';
import { GalleryImage } from '../../../models';

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <h2 class="text-xl text-romantic-coral font-semibold">Manage Gallery</h2>

      <!-- Upload Form -->
      <div class="flex flex-col gap-4 p-4 border border-romantic-pink/30 rounded-lg">
        <h3 class="text-lg text-romantic-text-light">Upload New Image</h3>

        <div class="flex flex-col gap-2">
          <label class="text-romantic-text-light text-sm">Select Image</label>
          <input
            type="file"
            accept="image/*"
            (change)="onFileSelected($event)"
            class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-romantic-pink file:text-white file:cursor-pointer" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-romantic-text-light text-sm">Caption (optional)</label>
          <input
            type="text"
            [(ngModel)]="caption"
            placeholder="Describe this memory..."
            class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
        </div>

        <button
          (click)="upload()"
          [disabled]="!selectedFile() || uploading()"
          class="self-start px-4 py-2 bg-romantic-pink text-white rounded hover:bg-romantic-pink/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ uploading() ? 'Uploading...' : 'Upload Image' }}
        </button>

        @if (uploadError()) {
          <p class="text-red-400 text-sm">{{ uploadError() }}</p>
        }
        @if (uploadSuccess()) {
          <p class="text-green-400 text-sm">Image uploaded successfully!</p>
        }
      </div>

      <!-- Edit Caption -->
      @if (editingId()) {
        <div class="flex flex-col gap-4 p-4 border border-jesse-blue/30 rounded-lg">
          <h3 class="text-lg text-romantic-text-light">Edit Caption</h3>

          <input
            type="text"
            [(ngModel)]="editCaption"
            class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />

          <div class="flex gap-2">
            <button
              (click)="saveCaption()"
              class="px-4 py-2 bg-jesse-blue text-white rounded hover:bg-jesse-blue/80 transition-colors">
              Save
            </button>
            <button
              (click)="cancelEdit()"
              class="px-4 py-2 border border-gray-500 text-gray-400 rounded hover:bg-gray-500/20 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      }

      <!-- Images Grid -->
      <div class="flex flex-col gap-3">
        <h3 class="text-lg text-romantic-text-light">Images ({{ galleryService.images().length }})</h3>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          @for (img of imageUrls(); track img.id) {
            <div class="relative group">
              <img
                [src]="img.url"
                [alt]="img.caption || 'Gallery image'"
                class="w-full h-32 object-cover rounded-lg border border-romantic-pink/30" />

              <!-- Overlay -->
              <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2">
                @if (img.caption) {
                  <span class="text-white text-xs text-center px-2">{{ img.caption }}</span>
                }
                <div class="flex gap-2">
                  <button
                    (click)="editImage(img.id, img.caption)"
                    class="px-2 py-1 text-xs border border-jesse-blue text-jesse-blue rounded hover:bg-jesse-blue/20 transition-colors">
                    Edit
                  </button>
                  <button
                    (click)="deleteImage(img.id)"
                    class="px-2 py-1 text-xs border border-red-500 text-red-500 rounded hover:bg-red-500/20 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminGalleryComponent implements OnInit {
  galleryService = inject(GalleryService);

  caption = '';
  editCaption = '';
  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  uploadError = signal('');
  uploadSuccess = signal(false);
  editingId = signal<string | null>(null);

  imageUrls = computed(() => {
    return this.galleryService.images().map((img) => ({
      id: img.id,
      url: this.galleryService.getPublicUrl(img.storage_path),
      caption: img.caption,
    }));
  });

  ngOnInit(): void {
    this.galleryService.loadAll();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
      this.uploadError.set('');
      this.uploadSuccess.set(false);
    }
  }

  async upload(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    this.uploadError.set('');
    this.uploadSuccess.set(false);

    const storagePath = await this.galleryService.upload(file);

    if (!storagePath) {
      this.uploadError.set('Failed to upload image. Please try again.');
      this.uploading.set(false);
      return;
    }

    await this.galleryService.create(storagePath, this.caption || undefined);

    this.uploading.set(false);
    this.uploadSuccess.set(true);
    this.selectedFile.set(null);
    this.caption = '';

    setTimeout(() => this.uploadSuccess.set(false), 3000);
  }

  editImage(id: string, currentCaption: string | null): void {
    this.editingId.set(id);
    this.editCaption = currentCaption ?? '';
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editCaption = '';
  }

  async saveCaption(): Promise<void> {
    const id = this.editingId();
    if (!id) return;

    await this.galleryService.update(id, { caption: this.editCaption || null });
    this.cancelEdit();
  }

  async deleteImage(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this image?')) {
      await this.galleryService.delete(id);
    }
  }
}
