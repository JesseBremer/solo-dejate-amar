import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TimelineService } from '../../services/timeline.service';
import { LanguageService } from '../../services/language.service';
import { IdentityService } from '../../services/identity.service';
import { TimelineEvent } from '../../models';

const PRESET_EMOJIS = ['💕', '📞', '📹', '✈️', '🏠', '💍', '💒', '🎂', '🎉', '🌍', '⭐', '🤝', '🥰', '🌹', '🎵', '📖'];

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Backdrop for kebab menus -->
    @if (menuOpenId()) {
      <div class="fixed inset-0 z-10" (click)="menuOpenId.set(null)"></div>
    }

    <div class="flex flex-col items-center w-full px-4 pt-8 pb-6 max-w-[600px] mx-auto">
      <h1 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-1">{{ t().timeline_title }}</h1>
      <p class="text-romantic-text/60 text-sm font-serif italic mb-10 text-center">{{ t().timeline_subtitle }}</p>

      @if (timelineService.events().length === 0) {
        <div class="flex flex-col items-center gap-3 mt-16 text-center">
          <span class="text-5xl">📜</span>
          <p class="text-romantic-text/60 font-serif italic text-sm" [innerHTML]="t().timeline_empty.replace('\\n','<br>')"></p>
        </div>
      }

      <!-- Timeline -->
      <div class="w-full flex flex-col">
        @for (event of timelineService.events(); track event.id; let last = $last) {
          <div class="flex gap-4">

            <!-- Spine: dot + line -->
            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 border-2"
                   [class]="event.author === 'jesse'
                     ? 'bg-jesse-blue/15 border-jesse-blue/50'
                     : 'bg-romantic-pink/15 border-romantic-pink/50'">
                {{ event.emoji || '⭐' }}
              </div>
              @if (!last) {
                <div class="w-px flex-1 my-1 bg-romantic-pink/15"></div>
              }
            </div>

            <!-- Content -->
            <div class="flex-1 pb-8 min-w-0">
              <p class="text-romantic-text/45 text-[11px] font-serif mb-1.5 mt-1">{{ formatDate(event.event_date) }}</p>

              <div class="relative rounded-2xl border px-4 py-3.5"
                   [class]="event.author === 'jesse'
                     ? 'bg-jesse-blue/5 border-jesse-blue/15'
                     : 'bg-romantic-pink/5 border-romantic-pink/15'">

                <p class="text-romantic-text font-serif text-sm font-semibold leading-snug pr-8">{{ event.title }}</p>

                @if (event.description) {
                  <p class="text-romantic-text/65 font-serif text-xs leading-relaxed mt-1.5 whitespace-pre-wrap">{{ event.description }}</p>
                }

                <div class="flex items-center gap-3 mt-2">
                  <p class="text-[11px] font-serif"
                     [class]="event.author === 'jesse' ? 'text-jesse-blue/60' : 'text-romantic-pink/60'">
                    {{ event.author === 'jesse' ? 'Jesse' : 'Abigail' }}
                  </p>
                  @if (event.journal_entry_id) {
                    <button (click)="goToEntry(event.journal_entry_id)"
                      class="text-[11px] font-serif text-romantic-text/45 hover:text-romantic-pink transition-colors">
                      {{ t().timeline_from_journal }}
                    </button>
                  }
                </div>

                <!-- Kebab -->
                <button (click)="toggleMenu(event.id)"
                  class="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-romantic-text/40 hover:text-romantic-text/70 hover:bg-white/5 transition-all duration-200">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>
                  </svg>
                </button>

                @if (menuOpenId() === event.id) {
                  <div class="absolute top-10 right-3 z-20 w-36 rounded-xl border border-romantic-pink/20 bg-[#1a0810]/95 backdrop-blur-md overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
                    <button (click)="openEdit(event)"
                      class="w-full px-4 py-2.5 text-left text-sm font-serif text-romantic-text/70 hover:bg-romantic-pink/10 hover:text-romantic-pink transition-colors flex items-center gap-2">
                      {{ t().timeline_edit }}
                    </button>
                    <button (click)="deleteEvent(event.id)"
                      class="w-full px-4 py-2.5 text-left text-sm font-serif text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-2 border-t border-white/5">
                      {{ t().timeline_delete }}
                    </button>
                  </div>
                }
              </div>
            </div>

          </div>
        }
      </div>
    </div>

    <!-- FAB -->
    <button (click)="openSheet()"
      class="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-romantic-pink text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral active:scale-95">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>
      </svg>
    </button>

    <!-- Add / Edit sheet -->
    @if (sheetOpen()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeSheet()"></div>
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4 max-h-[92dvh] overflow-y-auto">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1 shrink-0"></div>
          <h3 class="text-romantic-coral font-romantic text-2xl text-center shrink-0">
            {{ editingId() ? t().timeline_edit_title : t().timeline_add_title }}
          </h3>

          <!-- Author (create only) -->
          @if (!editingId()) {
            <div class="grid grid-cols-2 gap-2 shrink-0">
              <button (click)="author.set('jesse')"
                [class]="author() === 'jesse' ? 'border-jesse-blue bg-jesse-blue/15 text-jesse-blue' : 'border-romantic-text/20 text-romantic-text/60'"
                class="py-2.5 rounded-xl border text-sm font-serif transition-all duration-200">Jesse</button>
              <button (click)="author.set('abigail')"
                [class]="author() === 'abigail' ? 'border-romantic-pink bg-romantic-pink/15 text-romantic-pink' : 'border-romantic-text/20 text-romantic-text/60'"
                class="py-2.5 rounded-xl border text-sm font-serif transition-all duration-200">Abigail</button>
            </div>
          }

          <!-- Emoji picker -->
          <div class="flex flex-col gap-2">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().timeline_emoji_label }} <span class="text-romantic-text/35">{{ t().timeline_optional }}</span></label>
            <div class="grid grid-cols-8 gap-1.5">
              @for (e of presets; track e) {
                <button (click)="formEmoji = e"
                  class="h-9 rounded-lg text-xl flex items-center justify-center transition-all duration-150"
                  [class]="formEmoji === e ? 'bg-romantic-pink/20 ring-1 ring-romantic-pink/50' : 'bg-white/5 hover:bg-white/10'">
                  {{ e }}
                </button>
              }
            </div>
          </div>

          <!-- Date -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().timeline_date_label }}</label>
            <input type="date" [(ngModel)]="formDate"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]" />
          </div>

          <!-- Title -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().timeline_what_label }}</label>
            <input type="text" [(ngModel)]="formTitle" [placeholder]="t().timeline_what_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/50" />
          </div>

          <!-- Description -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().timeline_details_label }} <span class="text-romantic-text/35">{{ t().timeline_optional }}</span></label>
            <textarea [(ngModel)]="formDescription" rows="3" [placeholder]="t().timeline_details_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/50 resize-none leading-relaxed"></textarea>
          </div>

          <button (click)="save()" [disabled]="!canSave() || saving()"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shrink-0">
            {{ saving() ? t().timeline_saving : editingId() ? t().timeline_save_edit : t().timeline_save }}
          </button>
        </div>
      </div>
    }
  `,
})
export class TimelineComponent implements OnInit {
  timelineService = inject(TimelineService);
  private langService = inject(LanguageService);
  private identityService = inject(IdentityService);
  private router = inject(Router);
  readonly t = this.langService.t;

  readonly presets = PRESET_EMOJIS;

  sheetOpen = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);
  menuOpenId = signal<string | null>(null);
  author = signal<'jesse' | 'abigail'>(this.identityService.user());
  formTitle = '';
  formDescription = '';
  formDate = '';
  formEmoji = '';

  ngOnInit(): void {
    this.timelineService.loadAll();
  }

  formatDate(dateStr: string): string {
    const locale = this.langService.lang() === 'es' ? 'es-ES' : 'en-US';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }

  goToEntry(entryId: string): void {
    this.router.navigate(['/journal'], { queryParams: { entry: entryId } });
  }

  toggleMenu(id: string): void {
    this.menuOpenId.update(current => current === id ? null : id);
  }

  openSheet(): void {
    this.editingId.set(null);
    this.author.set(this.identityService.user());
    this.formTitle = '';
    this.formDescription = '';
    this.formDate = '';
    this.formEmoji = '';
    this.sheetOpen.set(true);
  }

  openEdit(event: TimelineEvent): void {
    this.menuOpenId.set(null);
    this.editingId.set(event.id);
    this.formTitle = event.title;
    this.formDescription = event.description ?? '';
    this.formDate = event.event_date;
    this.formEmoji = event.emoji ?? '';
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
    this.editingId.set(null);
    this.formTitle = '';
    this.formDescription = '';
    this.formDate = '';
    this.formEmoji = '';
  }

  canSave(): boolean {
    return !!this.formTitle.trim() && !!this.formDate;
  }

  async save(): Promise<void> {
    if (!this.canSave()) return;
    this.saving.set(true);

    const payload = {
      title: this.formTitle.trim(),
      description: this.formDescription.trim() || null,
      event_date: this.formDate,
      emoji: this.formEmoji.trim() || null,
    };

    const id = this.editingId();
    if (id) {
      await this.timelineService.update(id, payload);
    } else {
      await this.timelineService.create({ ...payload, author: this.author(), journal_entry_id: null });
    }

    this.saving.set(false);
    this.closeSheet();
  }

  async deleteEvent(id: string): Promise<void> {
    await this.timelineService.delete(id);
    this.menuOpenId.set(null);
  }
}
