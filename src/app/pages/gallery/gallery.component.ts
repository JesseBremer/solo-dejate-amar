import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GalleryService } from '../../services/gallery.service';
import { LanguageService } from '../../services/language.service';
import { JournalService } from '../../services/journal.service';
import { AlbumsService } from '../../services/albums.service';

interface AlbumCard {
  id: string;
  title: string;
  url: string;
  cover: string | null;
  description: string | null;
}

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

// Everything in the gallery is presented as a uniform "album" tile.
interface GalleryTile {
  key: string;
  kind: 'album' | 'journal' | 'uploads' | 'date';
  title: string;
  subtitle: string;
  cover: string | null;
  badge: string | null;          // small type indicator, e.g. 📁 / 📖 / 📷
  albumId?: string;              // google-album tiles: enables edit
  url?: string;                  // google-album tiles: external link
  images?: GalleryImageEntry[];  // journal / date tiles: open a photo view
  detailLabel?: string;         // heading shown in the detail view
}

// A drilled-in view: either a grid of sub-album tiles, or a grid of photos.
interface GalleryView {
  type: 'tiles' | 'photos';
  label: string;
  tiles?: GalleryTile[];
  images?: GalleryImageEntry[];
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [FormsModule],
  template: `
    <input
      #fileInput
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      (change)="onFilesSelected($event)" />

    @if (currentView()?.type === 'photos') {
      <!-- Photo view (a single date, or the journal) -->
      <div class="flex flex-col items-center w-full py-8 px-4">
        <button
          (click)="back()"
          class="self-start mb-6 flex items-center gap-2 text-romantic-text/50 hover:text-romantic-coral font-serif text-sm transition-colors duration-200">
          ← {{ t().gallery_back }}
        </button>

        <h2 class="text-romantic-coral font-romantic text-3xl md:text-4xl text-center mb-1">{{ currentView()!.label }}</h2>
        <p class="text-romantic-text/60 text-xs font-serif italic mb-8">{{ currentView()!.images!.length }} {{ currentView()!.images!.length === 1 ? t().gallery_photo : t().gallery_photos }}</p>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 w-full max-w-[680px] mb-10">
          @for (img of currentView()!.images!; track img.id) {
            <div
              class="group cursor-pointer relative overflow-hidden rounded-xl border border-romantic-pink/20 hover:border-romantic-pink/60 transition-all duration-300 shadow-sm hover:shadow-[0_0_12px_rgba(255,105,180,0.2)]"
              (click)="openLightbox(img)">
              <img [src]="img.url" [alt]="img.caption || 'Our Memory'" class="w-full h-[150px] object-cover transition-transform duration-500 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none"></div>
              <div class="absolute bottom-0 left-0 right-0 px-2 pb-2 flex items-end justify-between gap-1">
                @if (img.caption) {
                  <p class="text-white text-[11px] font-serif truncate flex-1">{{ img.caption }}</p>
                }
                @if (img.journalEntryId) {
                  <button (click)="$event.stopPropagation(); goToEntry(img.journalEntryId!)"
                    title="View journal entry"
                    class="shrink-0 text-[11px] font-serif bg-romantic-pink/80 hover:bg-romantic-pink text-white px-2 py-0.5 rounded-full transition-colors">
                    📖
                  </button>
                }
              </div>
            </div>
          }
        </div>

      </div>
    } @else {
      <!-- Tile grid: top level, or a drilled-in album of albums (Our Uploads) -->
      <div class="flex flex-col items-center w-full py-8 px-4">
        @if (currentView()) {
          <button
            (click)="back()"
            class="self-start mb-6 flex items-center gap-2 text-romantic-text/50 hover:text-romantic-coral font-serif text-sm transition-colors duration-200">
            ← {{ t().gallery_back }}
          </button>
          <h2 class="text-romantic-coral font-romantic text-3xl md:text-4xl text-center mb-8">{{ currentView()!.label }}</h2>
        } @else {
          <h2 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-1">{{ t().gallery_title }}</h2>
          <p class="text-romantic-text/60 text-sm font-serif italic mb-8">
            {{ totalImages() }} {{ t().gallery_photos }} {{ t().gallery_across }} {{ tiles().length }} {{ tiles().length === 1 ? t().gallery_album_one : t().gallery_album_many }}
          </p>
        }

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-[680px] mb-10">
          @for (tile of (currentView()?.tiles ?? tiles()); track tile.key) {
            <div
              (click)="openTile(tile)"
              class="relative group cursor-pointer rounded-xl overflow-hidden border border-romantic-pink/20 hover:border-romantic-pink/70 shadow-sm hover:shadow-[0_0_16px_rgba(255,105,180,0.25)] transition-all duration-300 aspect-square">
              @if (tile.cover) {
                <img [src]="tile.cover" [alt]="tile.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              } @else {
                <div class="w-full h-full bg-gradient-to-br from-romantic-pink/40 via-romantic-coral/30 to-romantic-dark flex items-center justify-center">
                  <span class="text-5xl opacity-80">📁</span>
                </div>
              }
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              @if (tile.badge) {
                <span class="absolute top-2 left-2 text-sm bg-black/45 rounded-full w-7 h-7 flex items-center justify-center">{{ tile.badge }}</span>
              }
              @if (tile.kind === 'album') {
                <button
                  (click)="editAlbumById(tile.albumId!, $event)"
                  title="Edit album"
                  class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/45 hover:bg-romantic-pink text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              }

              <div class="absolute bottom-0 left-0 right-0 p-3">
                <p class="text-white font-romantic text-lg leading-tight">{{ tile.title }}</p>
                <p class="text-romantic-pink/80 text-[11px] font-serif">{{ tile.subtitle }}</p>
              </div>
            </div>
          }
        </div>

      </div>
    }

    <!-- Click-away backdrop for the add menu -->
    @if (addMenuOpen()) {
      <div class="fixed inset-0 z-40" (click)="addMenuOpen.set(false)"></div>
    }

    <!-- Add menu (shown above the FAB) -->
    @if (addMenuOpen()) {
      <div class="fixed bottom-36 right-5 z-50 flex flex-col items-end gap-2">
        <button
          (click)="addMenuOpen.set(false); fileInput.click()"
          class="flex items-center gap-2 bg-romantic-dark border border-romantic-pink/40 text-romantic-text text-sm font-serif px-4 py-2 rounded-full shadow-lg hover:border-romantic-pink transition-colors">
          📷 {{ t().gallery_add_upload }}
        </button>
        <button
          (click)="openAlbumModal()"
          class="flex items-center gap-2 bg-romantic-dark border border-romantic-pink/40 text-romantic-text text-sm font-serif px-4 py-2 rounded-full shadow-lg hover:border-romantic-pink transition-colors">
          🔗 {{ t().gallery_add_link }}
        </button>
      </div>
    }

    <!-- Floating add button -->
    <button
      (click)="toggleAddMenu()"
      [disabled]="uploading()"
      class="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-romantic-pink border-2 border-romantic-pink/60 text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral hover:shadow-[0_0_28px_rgba(255,105,180,0.6)] disabled:opacity-60 disabled:cursor-not-allowed">
      @if (uploading()) {
        <span class="text-xs font-bold leading-none text-center">{{ uploadProgress() }}<br>/{{ uploadTotal() }}</span>
      } @else {
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 transition-transform duration-300" [class.rotate-45]="addMenuOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      }
    </button>

    <!-- Add album modal -->
    @if (albumModalOpen()) {
      <div (click)="closeAlbumModal()" class="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4">
        <div (click)="$event.stopPropagation()" class="bg-romantic-dark border border-romantic-pink/40 rounded-xl p-5 w-full max-w-sm flex flex-col gap-3 shadow-[0_0_30px_rgba(255,105,180,0.2)]">
          <h3 class="text-romantic-coral font-romantic text-2xl">{{ editingAlbumId() ? t().gallery_edit_album_heading : t().gallery_add_album_heading }}</h3>

          <input
            [(ngModel)]="albumTitle"
            [placeholder]="t().gallery_album_title_label"
            class="px-3 py-2 bg-white/10 border border-romantic-pink/40 rounded text-romantic-text text-sm focus:outline-none focus:border-romantic-pink" />

          <input
            [(ngModel)]="albumUrl"
            type="url"
            placeholder="https://photos.app.goo.gl/..."
            class="px-3 py-2 bg-white/10 border border-romantic-pink/40 rounded text-romantic-text text-sm focus:outline-none focus:border-romantic-pink" />

          <input
            [(ngModel)]="albumDescription"
            [placeholder]="t().gallery_album_desc_label"
            class="px-3 py-2 bg-white/10 border border-romantic-pink/40 rounded text-romantic-text text-sm focus:outline-none focus:border-romantic-pink" />

          <label class="text-romantic-text/55 text-xs font-serif">{{ t().gallery_album_cover_label }}</label>
          <input
            type="file"
            accept="image/*"
            (change)="onAlbumCoverSelected($event)"
            class="text-xs text-romantic-text/70 file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-romantic-pink file:text-white" />
          @if (albumCoverPath()) {
            <span class="text-xs text-green-400">✓</span>
          }

          <div class="flex gap-2 items-center mt-2">
            @if (editingAlbumId()) {
              <button
                (click)="deleteAlbum()"
                class="px-4 py-2 text-sm font-serif border border-red-500/70 text-red-400 rounded hover:bg-red-500/15 transition-colors">
                {{ t().gallery_album_delete }}
              </button>
            }
            <button
              (click)="closeAlbumModal()"
              class="ml-auto px-4 py-2 text-sm font-serif border border-romantic-text/30 text-romantic-text/60 rounded hover:text-romantic-text transition-colors">
              {{ t().gallery_album_cancel }}
            </button>
            <button
              (click)="saveAlbum()"
              [disabled]="!albumTitle || !albumUrl || albumSaving()"
              class="px-4 py-2 text-sm font-serif bg-romantic-pink text-white rounded hover:bg-romantic-coral transition-colors disabled:opacity-50">
              {{ albumSaving() ? '…' : t().gallery_album_save }}
            </button>
          </div>
        </div>
      </div>
    }

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
  private albumsService = inject(AlbumsService);
  readonly t = this.langService.t;

  albums = computed<AlbumCard[]>(() =>
    this.albumsService.albums().map((a) => ({
      id: a.id,
      title: a.title,
      url: a.url,
      cover: a.cover_path ? this.albumsService.getCoverUrl(a.cover_path) : null,
      description: a.description,
    }))
  );

  lightboxImg = signal<GalleryImageEntry | null>(null);
  // Navigation stack for drill-down (root → Our Uploads → a date). Empty = top level.
  private viewStack = signal<GalleryView[]>([]);
  currentView = computed<GalleryView | null>(() => this.viewStack().at(-1) ?? null);
  uploading = signal(false);
  uploadProgress = signal(0);
  uploadTotal = signal(0);
  uploadDone = signal(false);
  lastUploadCount = signal(0);

  addMenuOpen = signal(false);
  albumModalOpen = signal(false);
  albumSaving = signal(false);
  albumCoverPath = signal<string | null>(null);
  editingAlbumId = signal<string | null>(null);
  albumTitle = '';
  albumUrl = '';
  albumDescription = '';

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

  private photoLabel(n: number): string {
    const t = this.t();
    return `${n} ${n === 1 ? t.gallery_photo : t.gallery_photos}`;
  }

  // Top-level tiles: google albums, the journal album, then a single "Our Uploads" album.
  tiles = computed<GalleryTile[]>(() => {
    const t = this.t();
    const list: GalleryTile[] = [];

    for (const a of this.albums()) {
      list.push({
        key: `album-${a.id}`,
        kind: 'album',
        title: a.title,
        subtitle: t.gallery_album_open,
        cover: a.cover,
        badge: '📁',
        albumId: a.id,
        url: a.url,
      });
    }

    const journal = this.journalImages();
    if (journal.length) {
      list.push({
        key: 'journal',
        kind: 'journal',
        title: t.gallery_journal_section,
        subtitle: this.photoLabel(journal.length),
        cover: journal[0].url,
        badge: '📖',
        images: journal,
        detailLabel: t.gallery_journal_section,
      });
    }

    const uploads = this.regularImages();
    if (uploads.length) {
      list.push({
        key: 'uploads',
        kind: 'uploads',
        title: t.gallery_uploads_section,
        subtitle: this.photoLabel(uploads.length),
        cover: this.dateGroups()[0]?.cover ?? null,
        badge: '📷',
      });
    }

    return list;
  });

  // Sub-album tiles shown inside "Our Uploads": one per day.
  private dateTiles = computed<GalleryTile[]>(() =>
    this.dateGroups().map((g) => ({
      key: `date-${g.label}`,
      kind: 'date' as const,
      title: g.shortLabel,
      subtitle: this.photoLabel(g.images.length),
      cover: g.cover,
      badge: null,
      images: g.images,
      detailLabel: g.label,
    }))
  );

  ngOnInit(): void {
    this.galleryService.loadAll();
    this.journalService.loadAll();
    this.albumsService.loadAll();
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

  toggleAddMenu(): void {
    this.addMenuOpen.update((v) => !v);
  }

  openAlbumModal(): void {
    this.addMenuOpen.set(false);
    this.editingAlbumId.set(null);
    this.albumModalOpen.set(true);
  }

  editAlbumById(id: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const album = this.albumsService.albums().find((a) => a.id === id);
    if (!album) return;
    this.editingAlbumId.set(album.id);
    this.albumTitle = album.title;
    this.albumUrl = album.url;
    this.albumDescription = album.description ?? '';
    this.albumCoverPath.set(album.cover_path);
    this.albumModalOpen.set(true);
  }

  closeAlbumModal(): void {
    this.albumModalOpen.set(false);
    this.editingAlbumId.set(null);
    this.albumTitle = '';
    this.albumUrl = '';
    this.albumDescription = '';
    this.albumCoverPath.set(null);
  }

  async deleteAlbum(): Promise<void> {
    const id = this.editingAlbumId();
    if (!id) return;
    if (!confirm(this.t().gallery_album_delete_confirm)) return;
    await this.albumsService.delete(id);
    this.closeAlbumModal();
  }

  async onAlbumCoverSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const path = await this.albumsService.uploadCover(file);
    if (path) this.albumCoverPath.set(path);
  }

  async saveAlbum(): Promise<void> {
    if (!this.albumTitle || !this.albumUrl) return;
    this.albumSaving.set(true);
    const id = this.editingAlbumId();
    if (id) {
      await this.albumsService.update(id, {
        title: this.albumTitle,
        url: this.albumUrl,
        description: this.albumDescription || null,
        cover_path: this.albumCoverPath(),
      });
    } else {
      await this.albumsService.create({
        title: this.albumTitle,
        url: this.albumUrl,
        description: this.albumDescription || null,
        cover_path: this.albumCoverPath(),
        sort_order: this.albumsService.albums().length,
      });
    }
    this.albumSaving.set(false);
    this.closeAlbumModal();
  }

  openTile(tile: GalleryTile): void {
    if (tile.kind === 'album') {
      if (tile.url) window.open(tile.url, '_blank', 'noopener');
      return;
    }
    if (tile.kind === 'uploads') {
      this.viewStack.update((s) => [...s, { type: 'tiles', label: tile.title, tiles: this.dateTiles() }]);
      return;
    }
    if (tile.images) {
      this.viewStack.update((s) => [...s, { type: 'photos', label: tile.detailLabel ?? tile.title, images: tile.images }]);
    }
  }

  back(): void {
    this.viewStack.update((s) => s.slice(0, -1));
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
