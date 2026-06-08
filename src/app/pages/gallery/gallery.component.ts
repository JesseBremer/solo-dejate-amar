import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { GalleryService } from '../../services/gallery.service';
import { LanguageService } from '../../services/language.service';
import { JournalService } from '../../services/journal.service';

interface GalleryImageEntry {
  id: string;
  url: string;
  caption: string | null;
  createdAt: Date;
  journalEntryId: string | null;
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
  imports: [],
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
        <h2 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-1">{{ t().gallery_title }}</h2>
        <p class="text-romantic-text/60 text-sm font-serif italic mb-8">
          {{ totalImages() }} {{ t().gallery_photos }} {{ t().gallery_across }} {{ dateGroups().length }} {{ dateGroups().length === 1 ? t().gallery_day : t().gallery_days }}
        </p>

        <!-- Journal Photos section -->
        @if (journalImages().length > 0) {
          <div class="w-full max-w-[680px] mb-10">
            <div class="flex items-baseline gap-3 mb-4">
              <span class="text-romantic-coral font-romantic text-2xl">{{ t().gallery_journal_section }}</span>
              <span class="text-romantic-text/45 text-xs font-serif">{{ journalImages().length }} {{ journalImages().length === 1 ? t().gallery_photo : t().gallery_photos }}</span>
            </div>
            <div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
              @for (img of journalImages(); track img.id) {
                <div class="group relative overflow-hidden rounded-xl border border-romantic-pink/20 hover:border-romantic-pink/60 transition-all duration-300 shadow-sm hover:shadow-[0_0_12px_rgba(255,105,180,0.2)]">
                  <img [src]="img.url" [alt]="img.caption || 'Journal photo'"
                       class="w-full h-[150px] object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                       (click)="openLightbox(img)" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none"></div>
                  <div class="absolute bottom-0 left-0 right-0 px-2 pb-2 flex items-end justify-between gap-1">
                    @if (img.caption) {
                      <p class="text-white text-[11px] font-serif truncate flex-1">{{ img.caption }}</p>
                    }
                    @if (img.journalEntryId) {
                      <button (click)="goToEntry(img.journalEntryId!)"
                        title="View journal entry"
                        class="shrink-0 text-[11px] font-serif bg-romantic-pink/80 hover:bg-romantic-pink text-white px-2 py-0.5 rounded-full transition-colors">
                        📖
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
            <div class="mt-4 w-full border-b border-romantic-pink/10"></div>
          </div>
        }

        <!-- Regular photo date grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-[680px] mb-10">
          @for (group of dateGroups(); track group.label) {
            <div
              class="relative group cursor-pointer rounded-xl overflow-hidden border border-romantic-pink/20 hover:border-romantic-pink/70 shadow-sm hover:shadow-[0_0_16px_rgba(255,105,180,0.25)] transition-all duration-300 aspect-square"
              (click)="openGroup(group)">
              <img [src]="group.cover" alt="Cover photo" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div class="absolute bottom-0 left-0 right-0 p-3">
                <p class="text-white font-romantic text-lg leading-tight">{{ group.shortLabel }}</p>
                <p class="text-romantic-pink/80 text-xs font-serif">{{ group.images.length }} {{ group.images.length === 1 ? t().gallery_photo : t().gallery_photos }}</p>
              </div>
            </div>
          }
        </div>

      </div>
    } @else {
      <div class="flex flex-col items-center w-full py-8 px-4">
        <button
          (click)="closeGroup()"
          class="self-start mb-6 flex items-center gap-2 text-romantic-text/50 hover:text-romantic-coral font-serif text-sm transition-colors duration-200">
          {{ t().gallery_all_dates }}
        </button>

        <h2 class="text-romantic-coral font-romantic text-3xl md:text-4xl text-center mb-1">{{ selectedGroup()!.label }}</h2>
        <p class="text-romantic-text/60 text-xs font-serif italic mb-8">{{ selectedGroup()!.images.length }} {{ selectedGroup()!.images.length === 1 ? t().gallery_photo : t().gallery_photos }}</p>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 w-full max-w-[680px] mb-10">
          @for (img of selectedGroup()!.images; track img.id) {
            <div
              class="group cursor-pointer relative overflow-hidden rounded-xl border border-romantic-pink/20 hover:border-romantic-pink/60 transition-all duration-300 shadow-sm hover:shadow-[0_0_12px_rgba(255,105,180,0.2)]"
              (click)="openLightbox(img)">
              <img [src]="img.url" [alt]="img.caption || 'Our Memory'" class="w-full h-[150px] object-cover transition-transform duration-500 group-hover:scale-105" />
              @if (img.caption) {
                <div class="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                  <p class="text-romantic-text text-xs font-serif truncate">{{ img.caption }}</p>
                </div>
              }
            </div>
          }
        </div>

      </div>
    }

    <!-- Floating upload button -->
    <button
      (click)="fileInput.click()"
      [disabled]="uploading()"
      class="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-romantic-pink border-2 border-romantic-pink/60 text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral hover:shadow-[0_0_28px_rgba(255,105,180,0.6)] disabled:opacity-60 disabled:cursor-not-allowed">
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
      <div class="fixed bottom-36 right-5 z-50 bg-romantic-dark border border-romantic-pink/40 text-romantic-text text-sm font-serif px-4 py-3 rounded-lg shadow-lg">
        ✓ {{ lastUploadCount() }} {{ lastUploadCount() === 1 ? 'photo' : 'photos' }} added
      </div>
    }

    <!-- Lightbox -->
    @if (lightboxImg()) {
      <div (click)="closeLightbox()" class="fixed z-[1000] inset-0 bg-black/92 flex items-center justify-center">
        <span class="absolute top-5 right-8 text-romantic-coral text-4xl font-bold cursor-pointer hover:text-white select-none">&times;</span>
        <div class="relative max-w-[90vw] max-h-[90vh]">
          <img [src]="lightboxImg()!.url" alt="Enlarged Memory"
               class="max-w-[90vw] max-h-[90vh] rounded-xl border-2 border-romantic-pink shadow-[0_0_30px_rgba(255,105,180,0.25)] block" />
          @if (lightboxImg()!.journalEntryId) {
            <div class="absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-black/85 to-transparent px-4 pt-8 pb-4">
              @if (entryTitle(lightboxImg()!.journalEntryId!)) {
                <p class="text-white font-serif text-sm font-semibold leading-snug mb-2">
                  {{ entryTitle(lightboxImg()!.journalEntryId!) }}
                </p>
              }
              <button (click)="goToJournalEntry(lightboxImg()!.journalEntryId!, $event)"
                class="flex items-center gap-1.5 text-romantic-pink text-xs font-serif hover:text-romantic-coral transition-colors">
                {{ t().gallery_view_entry }}
              </button>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class GalleryComponent implements OnInit {
  private galleryService = inject(GalleryService);
  private langService = inject(LanguageService);
  private router = inject(Router);
  private journalService = inject(JournalService);
  readonly t = this.langService.t;

  lightboxImg = signal<GalleryImageEntry | null>(null);
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
      journalEntryId: img.journal_entry_id ?? null,
    }))
  );

  totalImages = computed(() => this.allImages().length);

  journalImages = computed<GalleryImageEntry[]>(() =>
    this.allImages()
      .filter(img => !!img.journalEntryId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  );

  private regularImages = computed<GalleryImageEntry[]>(() =>
    this.allImages().filter(img => !img.journalEntryId)
  );

  dateGroups = computed<DateGroup[]>(() => {
    const locale = this.langService.lang() === 'es' ? 'es-ES' : 'en-US';
    const imgs = [...this.regularImages()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const groups = new Map<string, GalleryImageEntry[]>();

    for (const img of imgs) {
      const label = img.createdAt.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(img);
    }

    return Array.from(groups, ([label, images]) => ({
      label,
      shortLabel: new Date(images[0].createdAt).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' }),
      images,
      cover: images[0].url,
    }));
  });

  ngOnInit(): void {
    this.galleryService.loadAll();
    this.journalService.loadAll();
  }

  goToEntry(entryId: string): void {
    this.router.navigate(['/journal'], { queryParams: { entry: entryId } });
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

  openLightbox(img: GalleryImageEntry): void {
    this.lightboxImg.set(img);
  }

  closeLightbox(): void {
    this.lightboxImg.set(null);
  }

  goToJournalEntry(entryId: string, event: Event): void {
    event.stopPropagation();
    this.closeLightbox();
    this.router.navigate(['/journal'], { queryParams: { entry: entryId } });
  }

  entryTitle(entryId: string): string {
    const entry = this.journalService.entries().find(e => e.id === entryId);
    return entry?.title || entry?.content.slice(0, 60) || '';
  }
}
