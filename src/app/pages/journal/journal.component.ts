import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JournalService } from '../../services/journal.service';
import { GalleryService } from '../../services/gallery.service';
import { TimelineService } from '../../services/timeline.service';
import { LanguageService } from '../../services/language.service';
import { IdentityService } from '../../services/identity.service';
import { JournalEntry, TimelineEvent } from '../../models';

interface DayGroup {
  label: string;
  shortLabel: string;
  dayOfWeek: string;
  entries: JournalEntry[];
  authors: Array<'jesse' | 'abigail'>;
  preview: string;
}

const DRAFT_KEY = 'journal_draft';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (!selectedDay()) {
      <!-- Day archive grid -->
      <div class="flex flex-col items-center w-full px-4 pt-8 pb-6">
        <h1 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-1">{{ t().journal_title }}</h1>
        <p class="text-romantic-text/60 text-sm font-serif italic mb-8 text-center">
          {{ journalService.entries().length }} {{ journalService.entries().length === 1 ? t().journal_entry : t().journal_entries }}
          {{ t().journal_across }} {{ dayGroups().length }} {{ dayGroups().length === 1 ? t().journal_day : t().journal_days }}
        </p>

        @if (dayGroups().length === 0) {
          <div class="flex flex-col items-center gap-3 mt-16 text-center">
            <span class="text-5xl">📖</span>
            <p class="text-romantic-text/60 font-serif italic text-sm" [innerHTML]="t().journal_empty.replace('\\n', '<br>')"></p>
          </div>
        }

        <div class="w-full max-w-[600px] flex flex-col gap-3">
          @for (day of dayGroups(); track day.label) {
            <button
              (click)="selectedDay.set(day)"
              class="w-full text-left rounded-2xl border border-romantic-pink/15 bg-romantic-pink/3 px-4 py-4 transition-all duration-200 active:scale-[0.99] hover:border-romantic-pink/40 hover:bg-romantic-pink/5">
              <div class="flex items-start justify-between gap-3">
                <div class="flex flex-col gap-1 flex-1 min-w-0">
                  <div class="flex items-baseline gap-2">
                    <span class="text-romantic-text font-serif text-sm font-semibold">{{ day.shortLabel }}</span>
                    <span class="text-romantic-text/55 text-xs font-serif">{{ day.dayOfWeek }}</span>
                  </div>
                  <p class="text-romantic-text/50 text-xs font-serif italic leading-relaxed line-clamp-2">{{ day.preview }}</p>
                </div>
                <div class="flex flex-col items-end gap-2 shrink-0">
                  <div class="flex gap-1.5 items-center">
                    @for (author of day.authors; track author) {
                      <span class="w-2.5 h-2.5 rounded-full"
                            [class]="author === 'jesse' ? 'bg-jesse-blue' : 'bg-romantic-pink'"></span>
                    }
                    @if (hasImage(day)) {
                      <span class="text-[11px] text-romantic-text/40">📷</span>
                    }
                  </div>
                  <span class="text-romantic-text/55 text-[11px] font-serif">
                    {{ day.entries.length }} {{ day.entries.length === 1 ? 'entry' : 'entries' }}
                  </span>
                </div>
              </div>
            </button>
          }
        </div>
      </div>

    } @else {
      <!-- Day detail view -->
      <div class="flex flex-col items-center w-full px-4 pt-8 pb-6">
        <button (click)="selectedDay.set(null)"
          class="self-start mb-6 flex items-center gap-2 text-romantic-text/50 hover:text-romantic-coral font-serif text-sm transition-colors duration-200">
          {{ t().journal_all_entries }}
        </button>

        <h2 class="text-romantic-coral font-romantic text-3xl md:text-4xl text-center mb-0.5">
          {{ selectedDay()!.shortLabel }}
        </h2>
        <p class="text-romantic-text/60 text-xs font-serif italic mb-8 text-center">{{ selectedDay()!.dayOfWeek }}</p>

        <div class="w-full max-w-[600px] flex flex-col gap-0">
          @for (entry of selectedDay()!.entries; track entry.id; let last = $last) {
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-3 h-3 rounded-full mt-1.5 shrink-0"
                     [class]="entry.author === 'jesse' ? 'bg-jesse-blue' : 'bg-romantic-pink'"></div>
                @if (!last) {
                  <div class="w-px flex-1 mt-1"
                       [class]="entry.author === 'jesse' ? 'bg-jesse-blue/20' : 'bg-romantic-pink/20'"></div>
                }
              </div>

              <div class="flex-1 pb-8">
                <div class="flex items-baseline gap-2 mb-2">
                  <span class="text-xs font-serif font-semibold"
                        [class]="entry.author === 'jesse' ? 'text-jesse-blue' : 'text-romantic-pink'">
                    {{ entry.author === 'jesse' ? 'Jesse' : 'Abigail' }}
                  </span>
                  <span class="text-romantic-text/55 text-xs font-serif">{{ formatTime(entry.created_at) }}</span>
                </div>

                <div class="rounded-2xl overflow-hidden border"
                     [class]="entry.author === 'jesse' ? 'bg-jesse-blue/5 border-jesse-blue/15' : 'bg-romantic-pink/5 border-romantic-pink/15'">
                  @if (entry.image_path) {
                    <img [src]="galleryService.getPublicUrl(entry.image_path)"
                         alt="Journal photo"
                         class="w-full max-h-72 object-cover" />
                  }
                  <div class="p-4">
                    @if (entry.title) {
                      <p class="text-romantic-text font-serif font-semibold text-base mb-2 leading-snug">{{ entry.title }}</p>
                    }
                    <p class="text-romantic-text/80 font-serif text-sm leading-[1.8] whitespace-pre-wrap">{{ entry.content }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-3 mt-2 flex-wrap">
                  <button (click)="openEdit(entry)"
                    class="text-[11px] text-romantic-text/45 font-serif hover:text-romantic-text/75 transition-colors">
                    {{ t().journal_edit }}
                  </button>
                  @if (onTimeline(entry.id)) {
                    <button (click)="goToTimeline()"
                      class="text-[11px] text-romantic-pink/70 font-serif hover:text-romantic-pink transition-colors">
                      {{ t().journal_on_timeline }}
                    </button>
                  } @else {
                    <button (click)="addToTimeline(entry)"
                      class="text-[11px] text-romantic-text/45 font-serif hover:text-romantic-text/75 transition-colors">
                      {{ t().journal_add_timeline }}
                    </button>
                  }
                  @if (confirmDelete() === entry.id) {
                    <button (click)="confirmDelete.set(null)"
                      class="text-[11px] text-romantic-text/60 font-serif">
                      {{ t().journal_cancel }}
                    </button>
                    <button (click)="deleteEntry(entry.id)"
                      class="text-[11px] text-red-400 font-serif">
                      {{ t().journal_confirm_delete }}
                    </button>
                  } @else {
                    <button (click)="confirmDelete.set(entry.id)"
                      class="text-[11px] text-romantic-text/45 font-serif hover:text-romantic-text/60 transition-colors">
                      {{ t().journal_delete }}
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Hidden file input for image picker -->
    <input #imgInput type="file" accept="image/*" class="hidden" (change)="selectImage($event)" />

    <!-- Floating write button -->
    <button (click)="openSheet()"
      class="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-romantic-pink text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral active:scale-95">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    </button>

    <!-- Write entry sheet -->
    @if (sheetOpen()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeSheet()"></div>

        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4 max-h-[92dvh] overflow-y-auto">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1 shrink-0"></div>
          <h3 class="text-romantic-coral font-romantic text-2xl text-center shrink-0">
            {{ editingId() ? t().journal_edit_entry : t().journal_new_entry }}
          </h3>

          @if (!editingId()) {
            <div class="grid grid-cols-2 gap-2 shrink-0">
              <button (click)="author.set('jesse')"
                [class]="author() === 'jesse' ? 'border-jesse-blue bg-jesse-blue/15 text-jesse-blue' : 'border-romantic-text/20 text-romantic-text/60'"
                class="py-2.5 rounded-xl border text-sm font-serif transition-all duration-200">
                Jesse
              </button>
              <button (click)="author.set('abigail')"
                [class]="author() === 'abigail' ? 'border-romantic-pink bg-romantic-pink/15 text-romantic-pink' : 'border-romantic-text/20 text-romantic-text/60'"
                class="py-2.5 rounded-xl border text-sm font-serif transition-all duration-200">
                Abigail
              </button>
            </div>
          }

          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().journal_title_label }} <span class="text-romantic-text/50">{{ t().journal_title_optional }}</span></label>
            <input type="text" [(ngModel)]="titleInput" (ngModelChange)="saveDraft()"
              [placeholder]="t().journal_title_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/50" />
          </div>

          <!-- Image attachment -->
          @if (imagePreviewUrl()) {
            <div class="relative rounded-xl overflow-hidden">
              <img [src]="imagePreviewUrl()!" alt="Selected photo" class="w-full max-h-52 object-cover" />
              <button (click)="removeImage()"
                class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-lg leading-none hover:bg-black/80 transition-colors">
                ×
              </button>
            </div>
          } @else if (currentImagePath()) {
            <div class="relative rounded-xl overflow-hidden group">
              <img [src]="galleryService.getPublicUrl(currentImagePath()!)" alt="Current photo" class="w-full max-h-52 object-cover" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button (click)="imgInput.click()"
                  class="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-serif backdrop-blur-sm hover:bg-white/30 transition-colors">
                  {{ t().journal_photo_replace }}
                </button>
                <button (click)="removeExistingImage()"
                  class="px-3 py-1.5 rounded-full bg-red-500/60 text-white text-xs font-serif backdrop-blur-sm hover:bg-red-500/80 transition-colors">
                  {{ t().journal_photo_remove }}
                </button>
              </div>
            </div>
          } @else {
            <button (click)="imgInput.click()"
              class="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-dashed border-romantic-pink/30 text-romantic-text/50 text-sm font-serif hover:border-romantic-pink/60 hover:text-romantic-text/70 transition-all duration-200 w-full">
              <span class="text-base">📷</span>
              <span>{{ t().journal_add_photo }}</span>
            </button>
          }

          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().journal_content_label }}</label>
            <textarea [(ngModel)]="contentInput" (ngModelChange)="saveDraft()" rows="9"
              [placeholder]="t().journal_content_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-[15px] focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/50 resize-none leading-[1.8]"></textarea>
            <div class="flex items-center justify-between text-[11px] text-romantic-text/35 font-serif px-1">
              <span>{{ wordCount }} {{ wordCount === 1 ? t().journal_word : t().journal_words }}</span>
              @if (wordCount > 0) {
                <span>~{{ readingTime }} {{ t().journal_min_read }}</span>
              }
            </div>
          </div>

          <button (click)="save()" [disabled]="!contentInput.trim() || saving()"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shrink-0">
            {{ saving() ? t().journal_saving : editingId() ? t().journal_save_edit : t().journal_save }}
          </button>
        </div>
      </div>
    }
  `,
})
export class JournalComponent implements OnInit {
  journalService = inject(JournalService);
  galleryService = inject(GalleryService);
  private timelineService = inject(TimelineService);
  private langService = inject(LanguageService);
  private identityService = inject(IdentityService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly t = this.langService.t;

  // Journal entries already pinned to the timeline, keyed by entry id.
  private timelineByEntryId = computed(() => new Map(
    this.timelineService.events()
      .filter(e => e.journal_entry_id)
      .map(e => [e.journal_entry_id!, e])
  ));

  onTimeline(entryId: string): TimelineEvent | null {
    return this.timelineByEntryId().get(entryId) ?? null;
  }

  goToTimeline(): void {
    this.router.navigate(['/timeline']);
  }

  sheetOpen = signal(false);
  saving = signal(false);
  confirmDelete = signal<string | null>(null);
  editingId = signal<string | null>(null);
  author = signal<'jesse' | 'abigail'>(this.identityService.user());
  selectedDay = signal<DayGroup | null>(null);
  imageFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);
  currentImagePath = signal<string | null>(null);
  titleInput = '';
  contentInput = '';

  get wordCount(): number {
    const text = this.contentInput.trim();
    return text ? text.split(/\s+/).length : 0;
  }

  get readingTime(): number {
    return Math.max(1, Math.ceil(this.wordCount / 200));
  }

  dayGroups = computed<DayGroup[]>(() => {
    const locale = this.langService.lang() === 'es' ? 'es-ES' : 'en-US';
    const entries = [...this.journalService.entries()];
    const groups = new Map<string, JournalEntry[]>();

    for (const entry of entries) {
      const key = new Date(entry.created_at).toLocaleDateString(locale, {
        month: 'long', day: 'numeric', year: 'numeric',
      });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    }

    return Array.from(groups, ([shortLabel, entries]) => {
      const date = new Date(entries[0].created_at);
      const authors = [...new Set(entries.map(e => e.author))] as Array<'jesse' | 'abigail'>;
      const firstEntry = entries[entries.length - 1];
      return {
        label: date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        shortLabel,
        dayOfWeek: date.toLocaleDateString(locale, { weekday: 'long' }),
        entries,
        authors,
        preview: firstEntry.title ? `${firstEntry.title} — ${firstEntry.content}` : firstEntry.content,
      };
    });
  });

  ngOnInit(): void {
    this.journalService.loadAll().then(() => {
      const entryId = this.route.snapshot.queryParamMap.get('entry');
      if (entryId) this.jumpToEntry(entryId);
    });
    // Also load gallery images so getPublicUrl is available for entry images
    this.galleryService.loadAll();
    // Timeline events drive the per-entry "on timeline" state
    this.timelineService.loadAll();
  }

  private jumpToEntry(id: string): void {
    const entry = this.journalService.entries().find(e => e.id === id);
    if (!entry) return;
    const locale = this.langService.lang() === 'es' ? 'es-ES' : 'en-US';
    const key = new Date(entry.created_at).toLocaleDateString(locale, {
      month: 'long', day: 'numeric', year: 'numeric',
    });
    const day = this.dayGroups().find(d => d.shortLabel === key);
    if (day) this.selectedDay.set(day);
  }

  hasImage(day: DayGroup): boolean {
    return day.entries.some(e => !!e.image_path);
  }

  formatTime(iso: string): string {
    const locale = this.langService.lang() === 'es' ? 'es-ES' : 'en-US';
    return new Date(iso).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  saveDraft(): void {
    if (this.editingId()) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ title: this.titleInput, content: this.contentInput }));
  }

  openSheet(): void {
    this.editingId.set(null);
    this.author.set(this.identityService.user());
    this.titleInput = '';
    this.contentInput = '';
    this.imageFile.set(null);
    this.imagePreviewUrl.set(null);

    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        this.titleInput = draft.title ?? '';
        this.contentInput = draft.content ?? '';
      } catch { /* ignore malformed draft */ }
    }

    this.sheetOpen.set(true);
  }

  openEdit(entry: JournalEntry): void {
    this.editingId.set(entry.id);
    this.titleInput = entry.title ?? '';
    this.contentInput = entry.content;
    this.currentImagePath.set(entry.image_path ?? null);
    this.imageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
    this.editingId.set(null);
    this.titleInput = '';
    this.contentInput = '';
    this.currentImagePath.set(null);
    this._revokePreview();
  }

  selectImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this._revokePreview();
    this.imageFile.set(file);
    this.imagePreviewUrl.set(URL.createObjectURL(file));
  }

  removeImage(): void {
    this._revokePreview();
  }

  removeExistingImage(): void {
    this.currentImagePath.set(null);
  }

  private _revokePreview(): void {
    const prev = this.imagePreviewUrl();
    if (prev) URL.revokeObjectURL(prev);
    this.imageFile.set(null);
    this.imagePreviewUrl.set(null);
  }

  async save(): Promise<void> {
    if (!this.contentInput.trim()) return;
    this.saving.set(true);

    const id = this.editingId();
    if (id) {
      const file = this.imageFile();
      if (file) {
        // New image picked: upload, replace gallery record, update entry
        const newPath = await this.journalService.uploadImage(file);
        if (newPath) {
          const linked = this.galleryService.images().find(img => img.journal_entry_id === id);
          if (linked) await this.galleryService.delete(linked.id);
          await this.galleryService.create(newPath, this.titleInput.trim() || 'Journal photo', id);
          await this.journalService.update(id, {
            title: this.titleInput.trim() || null,
            content: this.contentInput.trim(),
            image_path: newPath,
          });
        } else {
          await this.journalService.update(id, { title: this.titleInput.trim() || null, content: this.contentInput.trim() });
        }
      } else if (!this.currentImagePath()) {
        // Image removed: delete gallery record, clear image_path
        const linked = this.galleryService.images().find(img => img.journal_entry_id === id);
        if (linked) await this.galleryService.delete(linked.id);
        await this.journalService.update(id, {
          title: this.titleInput.trim() || null,
          content: this.contentInput.trim(),
          image_path: null,
        });
      } else {
        // Image unchanged
        await this.journalService.update(id, {
          title: this.titleInput.trim() || null,
          content: this.contentInput.trim(),
        });
      }
    } else {
      let imagePath: string | null = null;
      const file = this.imageFile();
      if (file) imagePath = await this.journalService.uploadImage(file);

      const entry = await this.journalService.create({
        author: this.author(),
        title: this.titleInput.trim() || null,
        content: this.contentInput.trim(),
        image_path: imagePath,
      });

      if (entry && imagePath) {
        await this.galleryService.create(imagePath, entry.title ?? 'Journal photo', entry.id);
      }
    }

    localStorage.removeItem(DRAFT_KEY);
    this.saving.set(false);
    this.closeSheet();

    if (this.selectedDay()) {
      const label = this.selectedDay()!.label;
      const updated = this.dayGroups().find(d => d.label === label);
      if (updated) this.selectedDay.set(updated);
    }
  }

  async addToTimeline(entry: JournalEntry): Promise<void> {
    // Guard against duplicates — an entry maps to at most one timeline event.
    if (this.onTimeline(entry.id)) return;
    await this.timelineService.create({
      author: entry.author,
      title: entry.title || entry.content.slice(0, 60),
      description: null,
      event_date: entry.created_at.split('T')[0],
      emoji: '📖',
      journal_entry_id: entry.id,
    });
    // The computed timeline map updates automatically, flipping the button to "View on timeline".
  }

  async deleteEntry(id: string): Promise<void> {
    // Cascade-delete the linked gallery image if present
    const entry = this.journalService.entries().find(e => e.id === id);
    if (entry?.image_path) {
      const linked = this.galleryService.images().find(img => img.journal_entry_id === id);
      if (linked) await this.galleryService.delete(linked.id);
    }

    await this.journalService.delete(id);
    this.confirmDelete.set(null);

    if (this.selectedDay()) {
      const updated = this.dayGroups().find(d => d.label === this.selectedDay()!.label);
      updated ? this.selectedDay.set(updated) : this.selectedDay.set(null);
    }
  }
}
