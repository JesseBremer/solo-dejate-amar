import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DreamsService } from '../../services/dreams.service';
import { LanguageService } from '../../services/language.service';
import { DreamGoal } from '../../models';

type Category = 'short_term' | 'long_term' | 'forever';

const CATEGORY_META: { key: Category; emoji: string; accentBg: string; accentBorder: string; accentText: string }[] = [
  { key: 'short_term', emoji: '🌸', accentBg: 'bg-romantic-coral/5', accentBorder: 'border-romantic-coral/20', accentText: 'text-romantic-coral' },
  { key: 'long_term', emoji: '✨', accentBg: 'bg-romantic-pink/5', accentBorder: 'border-romantic-pink/20', accentText: 'text-romantic-pink' },
  { key: 'forever', emoji: '💫', accentBg: 'bg-jesse-blue/5', accentBorder: 'border-jesse-blue/20', accentText: 'text-jesse-blue' },
];

@Component({
  selector: 'app-dreams',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="w-full px-4 pt-8 pb-28 flex flex-col items-center gap-8 max-w-[600px] mx-auto">

      <!-- Header -->
      <div class="w-full text-center">
        <h1 class="text-romantic-pink font-romantic text-4xl md:text-5xl animate-pulse-glow">{{ t().dreams_title }}</h1>
        <p class="text-romantic-text/40 text-sm font-serif italic mt-1">{{ t().dreams_subtitle }}</p>
      </div>

      <!-- Progress summary -->
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

          <!-- Section header -->
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ cat.emoji }}</span>
            <div class="flex-1">
              <h2 class="font-romantic text-xl leading-none" [class]="cat.accentText">{{ categoryLabel(cat.key) }}</h2>
              <p class="text-romantic-text/30 text-[11px] font-serif">{{ categorySublabel(cat.key) }}</p>
            </div>
            <span class="text-romantic-text/25 text-xs font-serif">
              {{ goalsFor(cat.key).length }}
            </span>
          </div>

          <!-- Goal cards -->
          @for (goal of goalsFor(cat.key); track goal.id) {
            <div class="w-full rounded-2xl border px-4 py-3.5 flex items-start gap-3.5 transition-all duration-300"
                 [class]="goal.completed
                   ? 'border-white/5 bg-white/2 opacity-60'
                   : cat.accentBorder + ' ' + cat.accentBg">

              <!-- Emoji -->
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 mt-0.5"
                   [class]="goal.completed ? 'bg-white/5' : 'bg-white/8'">
                {{ goal.emoji || '🌟' }}
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="text-romantic-text font-serif text-sm font-semibold leading-snug"
                   [class]="goal.completed ? 'line-through text-romantic-text/40' : ''">
                  {{ goal.title }}
                </p>
                @if (goal.description) {
                  <p class="text-romantic-text/50 text-xs font-serif mt-0.5 leading-relaxed"
                     [class]="goal.completed ? 'text-romantic-text/25' : ''">
                    {{ goal.description }}
                  </p>
                }
              </div>

              <!-- Completion toggle -->
              <button (click)="toggle(goal)"
                class="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 active:scale-90"
                [class]="goal.completed
                  ? 'border-transparent bg-romantic-pink/70 text-white'
                  : 'border-romantic-text/20 text-transparent hover:border-romantic-pink/50'">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
            </div>
          }

          <!-- Empty state -->
          @if (goalsFor(cat.key).length === 0) {
            <button (click)="openSheet(cat.key)"
              class="w-full rounded-2xl border border-dashed px-4 py-4 text-center transition-all duration-200 active:scale-[0.99]"
              [class]="cat.accentBorder">
              <p class="text-romantic-text/25 text-xs font-serif italic">
                {{ categoryEmptyLabel(cat.key) }}
              </p>
            </button>
          }

        </div>
      }

    </div>

    <!-- Floating add button -->
    <button (click)="openSheet(null)"
      class="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-romantic-pink text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral active:scale-95">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>
      </svg>
    </button>

    <!-- Add dream sheet -->
    @if (sheetOpen()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeSheet()"></div>

        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4 max-h-[90dvh] overflow-y-auto">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1 shrink-0"></div>
          <h3 class="text-romantic-coral font-romantic text-2xl text-center shrink-0">{{ t().dreams_new }}</h3>

          <!-- Category selector -->
          <div class="flex gap-2 shrink-0">
            @for (cat of categoryMeta; track cat.key) {
              <button (click)="newCategory.set(cat.key)"
                [class]="newCategory() === cat.key
                  ? cat.accentBorder + ' ' + cat.accentText + ' bg-white/8'
                  : 'border-romantic-text/20 text-romantic-text/40'"
                class="flex-1 py-2 rounded-xl border text-[11px] font-serif transition-all duration-200 leading-tight text-center">
                {{ cat.emoji }}<br>{{ categoryLabel(cat.key) }}
              </button>
            }
          </div>

          <!-- Emoji -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().dreams_emoji_label }} <span class="text-romantic-text/25">{{ t().dreams_optional }}</span></label>
            <input type="text" [(ngModel)]="newEmoji" maxlength="2" placeholder="🌟"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25" />
          </div>

          <!-- Title -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().dreams_dream_label }}</label>
            <input type="text" [(ngModel)]="newTitle" [placeholder]="t().dreams_dream_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25" />
          </div>

          <!-- Description -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().dreams_details_label }} <span class="text-romantic-text/25">{{ t().dreams_optional }}</span></label>
            <textarea [(ngModel)]="newDescription" rows="3" [placeholder]="t().dreams_details_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25 resize-none leading-relaxed"></textarea>
          </div>

          <button (click)="save()" [disabled]="!newTitle.trim() || saving()"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shrink-0">
            {{ saving() ? t().dreams_saving : t().dreams_save }}
          </button>
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

  sheetOpen = signal(false);
  saving = signal(false);
  newCategory = signal<Category>('short_term');
  newTitle = '';
  newDescription = '';
  newEmoji = '';

  totalGoals = computed(() => this.dreamsService.goals().length);
  completedGoals = computed(() => this.dreamsService.goals().filter(g => g.completed).length);
  progressPercent = computed(() =>
    this.totalGoals() === 0 ? 0 : Math.round((this.completedGoals() / this.totalGoals()) * 100)
  );

  goalsFor(category: Category): DreamGoal[] {
    return this.dreamsService.goals().filter(g => g.category === category);
  }

  ngOnInit(): void {
    this.dreamsService.loadAll();
  }

  openSheet(category: Category | null): void {
    this.newCategory.set(category ?? 'short_term');
    this.newTitle = '';
    this.newDescription = '';
    this.newEmoji = '';
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
  }

  async save(): Promise<void> {
    if (!this.newTitle.trim()) return;
    this.saving.set(true);
    await this.dreamsService.create({
      title: this.newTitle.trim(),
      description: this.newDescription.trim() || null,
      category: this.newCategory(),
      emoji: this.newEmoji.trim() || null,
    });
    this.saving.set(false);
    this.closeSheet();
  }

  async toggle(goal: DreamGoal): Promise<void> {
    await this.dreamsService.toggleComplete(goal.id, !goal.completed);
  }
}
