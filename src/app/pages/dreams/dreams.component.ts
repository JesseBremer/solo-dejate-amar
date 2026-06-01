import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DreamsService } from '../../services/dreams.service';
import { LanguageService } from '../../services/language.service';
import { DreamGoal } from '../../models';

type Category = 'short_term' | 'long_term' | 'forever';

const CATEGORY_META: { key: Category; emoji: string; accentBg: string; accentBorder: string; accentText: string }[] = [
  { key: 'short_term', emoji: '🌸', accentBg: 'bg-romantic-coral/5', accentBorder: 'border-romantic-coral/20', accentText: 'text-romantic-coral' },
  { key: 'long_term',  emoji: '✨', accentBg: 'bg-romantic-pink/5',   accentBorder: 'border-romantic-pink/20',  accentText: 'text-romantic-pink'  },
  { key: 'forever',   emoji: '💫', accentBg: 'bg-jesse-blue/5',      accentBorder: 'border-jesse-blue/20',     accentText: 'text-jesse-blue'     },
];

@Component({
  selector: 'app-dreams',
  standalone: true,
  imports: [FormsModule],
  template: `
    <input #imageInput type="file" accept="image/*" class="hidden" (change)="onImageSelected($event)" />

    <div class="w-full px-4 pt-8 pb-28 flex flex-col items-center gap-8 max-w-[600px] mx-auto">

      <!-- Header -->
      <div class="w-full text-center">
        <h1 class="text-romantic-pink font-romantic text-4xl md:text-5xl animate-pulse-glow">{{ t().dreams_title }}</h1>
        <p class="text-romantic-text/40 text-sm font-serif italic mt-1">{{ t().dreams_subtitle }}</p>
      </div>

      <!-- Progress bar -->
      @if (totalGoals() > 0) {
        <div class="w-full rounded-2xl border border-romantic-pink/15 bg-white/3 px-5 py-4 flex items-center gap-4">
          <div class="flex-1">
            <div class="flex items-baseline gap-2 mb-1.5">
              <span class="text-romantic-pink font-bold text-lg">{{ completedGoals() }}</span>
              <span class="text-romantic-text/40 text-xs font-serif">{{ t().dreams_of }} {{ totalGoals() }} {{ t().dreams_achieved }}</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-romantic-coral to-romantic-pink transition-all duration-700"
                   [style.width.%]="progressPercent()"></div>
            </div>
          </div>
          <div class="text-2xl">{{ progressPercent() === 100 ? '🎉' : '💝' }}</div>
        </div>
      }

      <!-- Category sections -->
      @for (cat of categoryMeta; track cat.key) {
        <div class="w-full flex flex-col gap-3">

          <div class="flex items-center gap-2">
            <span class="text-lg">{{ cat.emoji }}</span>
            <div class="flex-1">
              <h2 class="font-romantic text-xl leading-none" [class]="cat.accentText">{{ categoryLabel(cat.key) }}</h2>
              <p class="text-romantic-text/30 text-[11px] font-serif">{{ categorySublabel(cat.key) }}</p>
            </div>
            <span class="text-romantic-text/25 text-xs font-serif">{{ goalsFor(cat.key).length }}</span>
          </div>

          @for (goal of goalsFor(cat.key); track goal.id) {
            <div class="w-full rounded-2xl border overflow-hidden transition-all duration-300"
                 [class]="goal.completed ? 'border-white/5 bg-white/2 opacity-60' : cat.accentBorder + ' ' + cat.accentBg">

              <!-- Cover image -->
              @if (goal.image_url) {
                <button (click)="openDetail(goal)" class="block w-full">
                  <img [src]="goal.image_url" alt="" class="w-full h-36 object-cover" />
                </button>
              }

              <div class="px-4 py-3.5 flex items-start gap-3">
                <!-- Emoji -->
                <button (click)="openDetail(goal)"
                  class="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 mt-0.5"
                  [class]="goal.completed ? 'bg-white/5' : 'bg-white/8'">
                  {{ goal.emoji || '🌟' }}
                </button>

                <!-- Content -->
                <button (click)="openDetail(goal)" class="flex-1 min-w-0 text-left">
                  <p class="text-romantic-text font-serif text-sm font-semibold leading-snug"
                     [class]="goal.completed ? 'line-through text-romantic-text/40' : ''">
                    {{ goal.title }}
                  </p>
                  @if (goal.description) {
                    <p class="text-romantic-text/50 text-xs font-serif mt-0.5 leading-relaxed line-clamp-2">{{ goal.description }}</p>
                  }
                  @if (goal.target_date) {
                    <p class="text-romantic-text/35 text-[10px] font-serif mt-1">
                      📅 {{ formatDate(goal.target_date) }}
                    </p>
                  }
                </button>

                <!-- Actions -->
                <div class="flex flex-col items-center gap-2 shrink-0">
                  <button (click)="openEdit(goal)"
                    class="w-7 h-7 rounded-full flex items-center justify-center text-romantic-text/25 hover:text-romantic-pink hover:bg-romantic-pink/10 transition-all duration-200">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </button>
                  <button (click)="toggle(goal)"
                    class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 active:scale-90"
                    [class]="goal.completed
                      ? 'border-transparent bg-romantic-pink/70 text-white'
                      : 'border-romantic-text/20 text-transparent hover:border-romantic-pink/50'">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }

          @if (goalsFor(cat.key).length === 0) {
            <button (click)="openAdd(cat.key)"
              class="w-full rounded-2xl border border-dashed px-4 py-4 text-center transition-all duration-200 active:scale-[0.99]"
              [class]="cat.accentBorder">
              <p class="text-romantic-text/25 text-xs font-serif italic">{{ categoryEmptyLabel(cat.key) }}</p>
            </button>
          }
        </div>
      }
    </div>

    <!-- Floating add button -->
    <button (click)="openAdd(null)"
      class="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-romantic-pink text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral active:scale-95">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>
      </svg>
    </button>

    <!-- Detail sheet -->
    @if (detailGoal()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="detailGoal.set(null)"></div>
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl z-10 flex flex-col max-h-[90dvh] overflow-y-auto">

          <!-- Image -->
          @if (detailGoal()!.image_url) {
            <img [src]="detailGoal()!.image_url" alt="" class="w-full h-52 object-cover rounded-t-2xl" />
          } @else {
            <div class="pt-5"></div>
          }

          <div class="px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex flex-col gap-4">
            <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto"></div>

            <!-- Category badge -->
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ emojiFor(detailGoal()!.category) }}</span>
              <span class="text-xs font-serif px-2 py-0.5 rounded-full border"
                    [class]="accentFor(detailGoal()!.category)">
                {{ categoryLabel(detailGoal()!.category) }}
              </span>
              @if (detailGoal()!.completed) {
                <span class="text-romantic-pink text-xs font-serif ml-auto">{{ t().dreams_achieved_on }}</span>
              }
            </div>

            <!-- Title -->
            <div class="flex items-start gap-3">
              <span class="text-3xl">{{ detailGoal()!.emoji || '🌟' }}</span>
              <h2 class="text-romantic-text font-romantic text-2xl leading-snug flex-1"
                  [class]="detailGoal()!.completed ? 'line-through opacity-50' : ''">
                {{ detailGoal()!.title }}
              </h2>
            </div>

            <!-- Description -->
            @if (detailGoal()!.description) {
              <p class="text-romantic-text/70 font-serif text-sm leading-relaxed whitespace-pre-wrap">{{ detailGoal()!.description }}</p>
            }

            <!-- Target date -->
            @if (detailGoal()!.target_date) {
              <p class="text-romantic-text/40 text-xs font-serif">📅 {{ t().dreams_goal_for }} {{ formatDate(detailGoal()!.target_date!) }}</p>
            }

            <!-- Actions -->
            <div class="flex gap-3 mt-2">
              <button (click)="toggle(detailGoal()!)"
                class="flex-1 py-3 rounded-xl border font-serif text-sm transition-all duration-200 active:scale-[0.98]"
                [class]="detailGoal()!.completed
                  ? 'border-romantic-text/20 text-romantic-text/50'
                  : 'border-romantic-pink bg-romantic-pink/10 text-romantic-pink'">
                {{ detailGoal()!.completed ? t().dreams_mark_undone : t().dreams_mark_done }}
              </button>
              <button (click)="openEdit(detailGoal()!)"
                class="px-4 py-3 rounded-xl border border-romantic-text/20 text-romantic-text/50 font-serif text-sm transition-all active:scale-[0.98]">
                ✏️
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Add / Edit sheet -->
    @if (sheetOpen()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeSheet()"></div>
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4 max-h-[92dvh] overflow-y-auto">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1 shrink-0"></div>
          <h3 class="text-romantic-coral font-romantic text-2xl text-center shrink-0">
            {{ editingId() ? t().dreams_edit : t().dreams_new }}
          </h3>

          <!-- Category -->
          <div class="flex gap-2 shrink-0">
            @for (cat of categoryMeta; track cat.key) {
              <button (click)="formCategory.set(cat.key)"
                [class]="formCategory() === cat.key
                  ? cat.accentBorder + ' ' + cat.accentText + ' bg-white/8'
                  : 'border-romantic-text/20 text-romantic-text/40'"
                class="flex-1 py-2 rounded-xl border text-[11px] font-serif transition-all duration-200 leading-tight text-center">
                {{ cat.emoji }}<br>{{ categoryLabel(cat.key) }}
              </button>
            }
          </div>

          <!-- Image -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().dreams_image_label }} <span class="text-romantic-text/25">{{ t().dreams_optional }}</span></label>
            @if (formImagePreview()) {
              <div class="relative rounded-xl overflow-hidden">
                <img [src]="formImagePreview()!" alt="" class="w-full h-36 object-cover" />
                <button (click)="removeImage()"
                  class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-sm">
                  ✕
                </button>
              </div>
            } @else {
              <button (click)="imageInput.click()"
                [disabled]="uploadingImage()"
                class="w-full h-20 rounded-xl border-2 border-dashed border-romantic-pink/20 flex items-center justify-center gap-2 text-romantic-text/30 text-xs font-serif hover:border-romantic-pink/40 transition-colors disabled:opacity-40">
                @if (uploadingImage()) {
                  <span class="animate-pulse">Uploading…</span>
                } @else {
                  <span>📷 Add a photo</span>
                }
              </button>
            }
          </div>

          <!-- Emoji + Title row -->
          <div class="flex gap-2">
            <div class="flex flex-col gap-1.5 w-20 shrink-0">
              <label class="text-romantic-text/50 text-xs font-serif">{{ t().dreams_emoji_label }}</label>
              <input type="text" [(ngModel)]="formEmoji" maxlength="2" placeholder="🌟"
                class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-3 py-3 text-romantic-text text-sm text-center focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25" />
            </div>
            <div class="flex flex-col gap-1.5 flex-1">
              <label class="text-romantic-text/50 text-xs font-serif">{{ t().dreams_dream_label }}</label>
              <input type="text" [(ngModel)]="formTitle" [placeholder]="t().dreams_dream_placeholder"
                class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25" />
            </div>
          </div>

          <!-- Description -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().dreams_details_label }} <span class="text-romantic-text/25">{{ t().dreams_optional }}</span></label>
            <textarea [(ngModel)]="formDescription" rows="4" [placeholder]="t().dreams_details_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25 resize-none leading-relaxed"></textarea>
          </div>

          <!-- Target date -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().dreams_target_date_label }} <span class="text-romantic-text/25">{{ t().dreams_optional }}</span></label>
            <input type="date" [(ngModel)]="formTargetDate"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]" />
          </div>

          <!-- Save -->
          <button (click)="save()" [disabled]="!formTitle.trim() || saving() || uploadingImage()"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shrink-0">
            {{ saving() ? t().dreams_saving : editingId() ? t().dreams_save_edit : t().dreams_save }}
          </button>

          <!-- Delete (edit mode only) -->
          @if (editingId()) {
            <button (click)="handleDelete()"
              class="w-full py-2.5 rounded-xl border font-serif text-sm transition-all duration-200 active:scale-[0.98]"
              [class]="confirmingDelete()
                ? 'border-red-500/60 text-red-400 bg-red-500/10'
                : 'border-romantic-text/15 text-romantic-text/30'">
              {{ confirmingDelete() ? t().dreams_confirm_delete : t().dreams_delete }}
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class DreamsComponent implements OnInit {
  private dreamsService = inject(DreamsService);
  private langService = inject(LanguageService);

  readonly t = this.langService.t;
  readonly categoryMeta = CATEGORY_META;

  // Sheet state
  sheetOpen = signal(false);
  editingId = signal<string | null>(null);
  detailGoal = signal<DreamGoal | null>(null);
  saving = signal(false);
  confirmingDelete = signal(false);
  uploadingImage = signal(false);

  // Form fields
  formCategory = signal<Category>('short_term');
  formTitle = '';
  formDescription = '';
  formEmoji = '';
  formTargetDate = '';
  formImagePreview = signal<string | null>(null);
  private pendingImageUrl: string | null = null;

  totalGoals = computed(() => this.dreamsService.goals().length);
  completedGoals = computed(() => this.dreamsService.goals().filter(g => g.completed).length);
  progressPercent = computed(() =>
    this.totalGoals() === 0 ? 0 : Math.round((this.completedGoals() / this.totalGoals()) * 100)
  );

  ngOnInit(): void {
    this.dreamsService.loadAll();
  }

  goalsFor(category: Category): DreamGoal[] {
    return this.dreamsService.goals().filter(g => g.category === category);
  }

  categoryLabel(key: Category): string {
    const t = this.langService.t();
    if (key === 'short_term') return t.dreams_short_term_label;
    if (key === 'long_term') return t.dreams_long_term_label;
    return t.dreams_forever_label;
  }

  categorySublabel(key: Category): string {
    const t = this.langService.t();
    if (key === 'short_term') return t.dreams_short_term_sub;
    if (key === 'long_term') return t.dreams_long_term_sub;
    return t.dreams_forever_sub;
  }

  categoryEmptyLabel(key: Category): string {
    const t = this.langService.t();
    const label = this.categoryLabel(key).toLowerCase();
    return `${t.dreams_new.toLowerCase().replace('nuevo ', '').replace('new ', '')} ${label}...`;
  }

  emojiFor(key: Category): string {
    return CATEGORY_META.find(c => c.key === key)?.emoji ?? '✨';
  }

  accentFor(key: Category): string {
    const m = CATEGORY_META.find(c => c.key === key)!;
    return `${m.accentBorder} ${m.accentText}`;
  }

  formatDate(iso: string): string {
    const lang = this.langService.lang();
    return new Date(iso + 'T00:00:00').toLocaleDateString(
      lang === 'es' ? 'es-ES' : 'en-US',
      { month: 'long', year: 'numeric' }
    );
  }

  openAdd(category: Category | null): void {
    this.editingId.set(null);
    this.formCategory.set(category ?? 'short_term');
    this.formTitle = '';
    this.formDescription = '';
    this.formEmoji = '';
    this.formTargetDate = '';
    this.formImagePreview.set(null);
    this.pendingImageUrl = null;
    this.confirmingDelete.set(false);
    this.sheetOpen.set(true);
  }

  openEdit(goal: DreamGoal): void {
    this.detailGoal.set(null);
    this.editingId.set(goal.id);
    this.formCategory.set(goal.category);
    this.formTitle = goal.title;
    this.formDescription = goal.description ?? '';
    this.formEmoji = goal.emoji ?? '';
    this.formTargetDate = goal.target_date ?? '';
    this.formImagePreview.set(goal.image_url);
    this.pendingImageUrl = null;
    this.confirmingDelete.set(false);
    this.sheetOpen.set(true);
  }

  openDetail(goal: DreamGoal): void {
    this.detailGoal.set(goal);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
    this.editingId.set(null);
    this.confirmingDelete.set(false);
  }

  async onImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingImage.set(true);
    const url = await this.dreamsService.uploadImage(file);
    if (url) {
      this.formImagePreview.set(url);
      this.pendingImageUrl = url;
    }
    this.uploadingImage.set(false);
    (event.target as HTMLInputElement).value = '';
  }

  removeImage(): void {
    this.formImagePreview.set(null);
    this.pendingImageUrl = null;
  }

  async save(): Promise<void> {
    if (!this.formTitle.trim()) return;
    this.saving.set(true);

    const imageUrl = this.formImagePreview();
    const id = this.editingId();

    if (id) {
      await this.dreamsService.update(id, {
        title: this.formTitle.trim(),
        description: this.formDescription.trim() || null,
        category: this.formCategory(),
        emoji: this.formEmoji.trim() || null,
        target_date: this.formTargetDate || null,
        image_url: imageUrl,
      });
      // Refresh detail view if open
      const updated = this.dreamsService.goals().find(g => g.id === id);
      if (updated) this.detailGoal.set(updated);
    } else {
      await this.dreamsService.create({
        title: this.formTitle.trim(),
        description: this.formDescription.trim() || null,
        category: this.formCategory(),
        emoji: this.formEmoji.trim() || null,
        target_date: this.formTargetDate || null,
        image_url: imageUrl,
      });
    }

    this.saving.set(false);
    this.closeSheet();
  }

  async toggle(goal: DreamGoal): Promise<void> {
    await this.dreamsService.toggleComplete(goal.id, !goal.completed);
    // Update detail view if open
    if (this.detailGoal()?.id === goal.id) {
      this.detailGoal.set({ ...goal, completed: !goal.completed });
    }
  }

  handleDelete(): void {
    if (!this.confirmingDelete()) {
      this.confirmingDelete.set(true);
      setTimeout(() => this.confirmingDelete.set(false), 3000);
      return;
    }
    this.deleteGoal();
  }

  private async deleteGoal(): Promise<void> {
    const id = this.editingId();
    if (!id) return;
    await this.dreamsService.delete(id);
    this.closeSheet();
  }
}
