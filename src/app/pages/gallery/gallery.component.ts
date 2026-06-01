import { Component, signal, OnInit, inject, computed, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GalleryService } from '../../services/gallery.service';

interface GalleryImageEntry {
  id: string;
  url: string;
  caption: string | null;
  createdAt: Date;
}

interface DateGroup {
  label: string;
  shortLabel: string;
  images: GalleryImageEntry[];
  cover: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [RouterLink],
  template: `
    <input
      #fileInput
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      (change)="onFilesSelected($event)" />

    @if (!selectedGroup()) {
      <div class="flex flex-col items-center w-full py-8 px-4">
        <h2 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-1">Our Beautiful Memories</h2>
        <p class="text-romantic-text/40 text-sm font-serif italic mb-8">
          {{ totalImages() }} photos across {{ dateGroups().length }} {{ dateGroups().length === 1 ? 'day' : 'days' }}
        </p>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-[680px] mb-10">
          @for (group of dateGroups(); track group.label) {
            <div
              class="relative group cursor-pointer rounded-xl overflow-hidden border border-romantic-pink/20 hover:border-romantic-pink/70 shadow-sm hover:shadow-[0_0_16px_rgba(255,105,180,0.25)] transition-all duration-300 aspect-square"
              (click)="openGroup(group)">
              <img [src]="group.cover" alt="Cover photo" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div class="absolute bottom-0 left-0 right-0 p-3">
                <p class="text-white font-romantic text-lg leading-tight">{{ group.shortLabel }}</p>
                <p class="text-romantic-pink/80 text-xs font-serif">{{ group.images.length }} {{ group.images.length === 1 ? 'photo' : 'photos' }}</p>
              </div>
            </div>
          }
        </div>

        <a routerLink="/" class="px-6 py-3 bg-transparent border border-romantic-coral text-romantic-coral rounded-md font-serif transition-all duration-300 hover:bg-romantic-coral hover:text-white">
          Back
        </a>
      </div>
    } @else {
      <div class="flex flex-col items-center w-full py-8 px-4">
        <button
          (click)="closeGroup()"
          class="self-start mb-6 flex items-center gap-2 text-romantic-text/50 hover:text-romantic-coral font-serif text-sm transition-colors duration-200">
          ← All dates
        </button>

        <h2 class="text-romantic-coral font-romantic text-3xl md:text-4xl text-center mb-1">{{ selectedGroup()!.label }}</h2>
        <p class="text-romantic-text/40 text-xs font-serif italic mb-8">{{ selectedGroup()!.images.length }} {{ selectedGroup()!.images.length === 1 ? 'photo' : 'photos' }}</p>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 w-full max-w-[680px] mb-10">
          @for (img of selectedGroup()!.images; track img.id) {
            <div
              class="group cursor-pointer relative overflow-hidden rounded-xl border border-romantic-pink/20 hover:border-romantic-pink/60 transition-all duration-300 shadow-sm hover:shadow-[0_0_12px_rgba(255,105,180,0.2)]"
              (click)="openLightbox(img.url)">
              <img [src]="img.url" [alt]="img.caption || 'Our Memory'" class="w-full h-[150px] object-cover transition-transform duration-500 group-hover:scale-105" />
              @if (img.caption) {
                <div class="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                  <p class="text-romantic-text text-xs font-serif truncate">{{ img.caption }}</p>
                </div>
              }
            </div>
          }
        </div>

        <a routerLink="/" class="px-6 py-3 bg-transparent border border-romantic-coral text-romantic-coral rounded-md font-serif transition-all duration-300 hover:bg-romantic-coral hover:text-white">
          Back home
        </a>
      </div>
    }

    <!-- Floating upload button -->
    <button
      (click)="fileInput.click()"
      [disabled]="uploading()"
      class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-romantic-pink border-2 border-romantic-pink/60 text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral hover:shadow-[0_0_28px_rgba(255,105,180,0.6)] disabled:opacity-60 disabled:cursor-not-allowed">
      @if (uploading()) {
        <span class="text-xs font-bold leading-none text-center">{{ uploadProgress() }}<br>/{{ uploadTotal() }}</span>
      } @else {
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      }
    </button>

    <!-- Upload toast -->
    @if (uploadDone()) {
      <div class="fixed bottom-24 right-6 z-50 bg-romantic-dark border border-romantic-pink/40 text-romantic-text text-sm font-serif px-4 py-3 rounded-lg shadow-lg">
        ✓ {{ lastUploadCount() }} {{ lastUploadCount() === 1 ? 'photo' : 'photos' }} added
      </div>
    }

    <!-- Lightbox -->
    @if (lightboxSrc()) {
      <div (click)="closeLightbox()" class="fixed z-[1000] inset-0 bg-black/92 flex items-center justify-center">
        <span class="absolute top-5 right-8 text-romantic-coral text-4xl font-bold cursor-pointer hover:text-white select-none">&times;</span>
        <img [src]="lightboxSrc()" alt="Enlarged Memory" class="max-w-[90vw] max-h-[90vh] rounded-xl border-2 border-romantic-pink shadow-[0_0_30px_rgba(255,105,180,0.25)]" />
      </div>
    }
  `
})
export class GalleryComponent implements OnInit {
  private galleryService = inject(GalleryService);

  lightboxSrc = signal<string | null>(null);
  selectedGroup = signal<DateGroup | null>(null);
  uploading = signal(false);
  uploadProgress = signal(0);
  uploadTotal = signal(0);
  uploadDone = signal(false);
  lastUploadCount = signal(0);

  private allImages = computed<GalleryImageEntry[]>(() =>
    this.galleryService.images().map(img => ({
      id: img.id,
      url: this.galleryService.getPublicUrl(img.storage_path),
      caption: img.caption,
      createdAt: new Date(img.created_at),
    }))
  );

  totalImages = computed(() => this.allImages().length);

  dateGroups = computed<DateGroup[]>(() => {
    const imgs = [...this.allImages()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const groups = new Map<string, GalleryImageEntry[]>();

    for (const img of imgs) {
      const label = img.createdAt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(img);
    }

    return Array.from(groups, ([label, images]) => ({
      label,
      shortLabel: new Date(images[0].createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      images,
      cover: images[0].url,
    }));
  });

  ngOnInit(): void {
    this.galleryService.loadAll();
  }

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    input.value = '';
    this.uploading.set(true);
    this.uploadDone.set(false);
    this.uploadProgress.set(0);
    this.uploadTotal.set(files.length);

    let succeeded = 0;
    for (const file of files) {
      const path = await this.galleryService.upload(file);
      if (path) {
        await this.galleryService.create(path);
        succeeded++;
      }
      this.uploadProgress.update(n => n + 1);
    }

    this.uploading.set(false);
    this.lastUploadCount.set(succeeded);
    this.uploadDone.set(true);
    setTimeout(() => this.uploadDone.set(false), 3000);
  }

  openGroup(group: DateGroup): void {
    this.selectedGroup.set(group);
  }

  closeGroup(): void {
    this.selectedGroup.set(null);
  }

  openLightbox(src: string): void {
    this.lightboxSrc.set(src);
  }

  closeLightbox(): void {
    this.lightboxSrc.set(null);
  }
}
