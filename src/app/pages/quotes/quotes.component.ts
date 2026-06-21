import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuotesService } from '../../services/quotes.service';
import { LanguageService } from '../../services/language.service';
import { Quote } from '../../models';

type Filter = 'all' | 'jesse' | 'abigail';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="w-full px-4 pt-8 pb-28 flex flex-col items-center gap-5 max-w-[600px] mx-auto">

      <!-- Header -->
      <div class="w-full text-center">
        <h1 class="text-romantic-pink font-romantic text-4xl md:text-5xl animate-pulse-glow">{{ t().quotes_title }}</h1>
        <p class="text-romantic-text/55 text-sm font-serif italic mt-1">{{ t().quotes_subtitle }}</p>
      </div>

      <!-- Filter -->
      <div class="w-full grid grid-cols-3 gap-2">
        <button (click)="filter.set('all')"
          [class]="filter() === 'all' ? 'border-romantic-pink bg-romantic-pink/15 text-romantic-pink' : 'border-romantic-text/20 text-romantic-text/50'"
          class="py-2 rounded-xl border text-sm font-serif transition-all duration-200">
          {{ t().quotes_filter_all }}
        </button>
        <button (click)="filter.set('jesse')"
          [class]="filter() === 'jesse' ? 'border-jesse-blue bg-jesse-blue/15 text-jesse-blue' : 'border-romantic-text/20 text-romantic-text/50'"
          class="py-2 rounded-xl border text-sm font-serif transition-all duration-200">
          Jesse
        </button>
        <button (click)="filter.set('abigail')"
          [class]="filter() === 'abigail' ? 'border-romantic-pink bg-romantic-pink/15 text-romantic-pink' : 'border-romantic-text/20 text-romantic-text/50'"
          class="py-2 rounded-xl border text-sm font-serif transition-all duration-200">
          Abigail
        </button>
      </div>

      <!-- Empty state -->
      @if (filtered().length === 0) {
        <p class="text-romantic-text/40 text-sm font-serif italic text-center py-10">{{ t().quotes_empty }}</p>
      }

      <!-- Backdrop for open menus -->
      @if (menuOpenId()) {
        <div class="fixed inset-0 z-10" (click)="menuOpenId.set(null)"></div>
      }

      <!-- Quotes list -->
      @for (quote of filtered(); track quote.id) {
        <div class="relative w-full rounded-2xl border bg-white/3 px-5 py-4 flex flex-col gap-2"
          [class]="quote.said_by === 'jesse' ? 'border-jesse-blue/20' : quote.said_by === 'abigail' ? 'border-romantic-pink/20' : 'border-romantic-text/15'">

          <!-- Quotation mark -->
          <span class="absolute top-3 left-4 text-3xl leading-none font-serif select-none"
            [class]="quote.said_by === 'jesse' ? 'text-jesse-blue/20' : 'text-romantic-pink/20'">"</span>

          <!-- Quote text -->
          <p class="text-romantic-text text-base font-serif leading-relaxed pt-3 pl-3">{{ quote.text }}</p>

          <!-- Context -->
          @if (quote.context) {
            <p class="text-romantic-text/45 text-xs font-serif italic leading-snug">{{ quote.context }}</p>
          }

          <!-- Footer -->
          <div class="flex items-center justify-between mt-1">
            <span class="text-xs font-serif font-semibold"
              [class]="quote.said_by === 'jesse' ? 'text-jesse-blue' : quote.said_by === 'abigail' ? 'text-romantic-pink' : 'text-romantic-text/40'">
              @if (quote.said_by === 'jesse') { — Jesse }
              @else if (quote.said_by === 'abigail') { — Abigail }
            </span>
            <span class="text-romantic-text/35 text-[11px] font-serif">{{ formatDate(quote.created_at) }}</span>
          </div>

          <!-- Menu button -->
          <button (click)="toggleMenu(quote.id)"
            class="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-romantic-text/35 hover:text-romantic-text/60 hover:bg-white/5 transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>
            </svg>
          </button>

          @if (menuOpenId() === quote.id) {
            <div class="absolute top-11 right-3 z-20 w-32 rounded-xl border border-romantic-pink/20 bg-[#1a0810]/95 backdrop-blur-md overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
              <button (click)="openEdit(quote)"
                class="w-full px-4 py-2.5 text-left text-sm font-serif text-romantic-text/70 hover:bg-romantic-pink/10 hover:text-romantic-pink transition-colors">
                ✏️ {{ t().quotes_edit }}
              </button>
              <button (click)="deleteQuote(quote.id)"
                class="w-full px-4 py-2.5 text-left text-sm font-serif text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors border-t border-white/5">
                🗑️ {{ t().quotes_delete }}
              </button>
            </div>
          }
        </div>
      }

    </div>

    <!-- Floating add -->
    <button (click)="openAdd()"
      class="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-romantic-pink text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral active:scale-95">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
            {{ editingId() ? t().quotes_edit_title : t().quotes_add_title }}
          </h3>

          <!-- Said by -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/55 text-xs font-serif">{{ t().quotes_said_by_label }}</label>
            <div class="grid grid-cols-2 gap-2">
              <button (click)="formSaidBy.set('jesse')"
                [class]="formSaidBy() === 'jesse' ? 'border-jesse-blue bg-jesse-blue/15 text-jesse-blue' : 'border-romantic-text/20 text-romantic-text/50'"
                class="py-2.5 rounded-xl border text-sm font-serif transition-all">
                Jesse
              </button>
              <button (click)="formSaidBy.set('abigail')"
                [class]="formSaidBy() === 'abigail' ? 'border-romantic-pink bg-romantic-pink/15 text-romantic-pink' : 'border-romantic-text/20 text-romantic-text/50'"
                class="py-2.5 rounded-xl border text-sm font-serif transition-all">
                Abigail
              </button>
            </div>
          </div>

          <!-- Quote text -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/55 text-xs font-serif">{{ t().quotes_text_label }}</label>
            <textarea [(ngModel)]="formText" rows="4" [placeholder]="t().quotes_text_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/40 resize-none leading-relaxed"></textarea>
          </div>

          <!-- Context -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/55 text-xs font-serif">{{ t().quotes_context_label }} <span class="text-romantic-text/40">{{ t().dict_optional }}</span></label>
            <input type="text" [(ngModel)]="formContext" [placeholder]="t().quotes_context_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/40" />
          </div>

          <button (click)="save()" [disabled]="!formText.trim() || saving()"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shrink-0">
            {{ saving() ? t().quotes_saving : editingId() ? t().quotes_save_edit : t().quotes_save }}
          </button>
        </div>
      </div>
    }
  `,
})
export class QuotesComponent implements OnInit {
  private quotesService = inject(QuotesService);
  private langService = inject(LanguageService);

  readonly t = this.langService.t;

  filter = signal<Filter>('all');
  menuOpenId = signal<string | null>(null);

  sheetOpen = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  formSaidBy = signal<'jesse' | 'abigail'>('jesse');
  formText = '';
  formContext = '';

  filtered = computed<Quote[]>(() => {
    const f = this.filter();
    const all = this.quotesService.quotes();
    if (f === 'all') return all;
    return all.filter(q => q.said_by === f);
  });

  ngOnInit(): void {
    this.quotesService.loadAll();
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(this.langService.lang() === 'es' ? 'es' : 'en', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  toggleMenu(id: string): void {
    this.menuOpenId.update(c => (c === id ? null : id));
  }

  openAdd(): void {
    this.editingId.set(null);
    this.formSaidBy.set('jesse');
    this.formText = '';
    this.formContext = '';
    this.sheetOpen.set(true);
  }

  openEdit(quote: Quote): void {
    this.menuOpenId.set(null);
    this.editingId.set(quote.id);
    this.formSaidBy.set(quote.said_by ?? 'jesse');
    this.formText = quote.text;
    this.formContext = quote.context ?? '';
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
    this.editingId.set(null);
  }

  async save(): Promise<void> {
    if (!this.formText.trim()) return;
    this.saving.set(true);
    const payload = {
      text: this.formText.trim(),
      said_by: this.formSaidBy(),
      context: this.formContext.trim() || null,
    };
    const id = this.editingId();
    if (id) await this.quotesService.update(id, payload);
    else await this.quotesService.create(payload);
    this.saving.set(false);
    this.closeSheet();
  }

  async deleteQuote(id: string): Promise<void> {
    this.menuOpenId.set(null);
    await this.quotesService.delete(id);
  }
}
