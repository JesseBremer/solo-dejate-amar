import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VaultService } from '../../services/vault.service';
import { LanguageService } from '../../services/language.service';
import { IdentityService } from '../../services/identity.service';

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col items-center w-full px-4 pt-8 pb-6">
      <h1 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-1">The Vault</h1>
      <p class="text-romantic-text/60 text-sm font-serif italic mb-8 text-center">Letters sealed until the right moment</p>

      @if (vaultService.messages().length === 0) {
        <div class="flex flex-col items-center gap-3 mt-16 text-center">
          <span class="text-5xl">🔐</span>
          <p class="text-romantic-text/60 font-serif italic text-sm">No letters yet<br>Seal the first one below</p>
        </div>
      }

      <!-- Backdrop to close any open menu -->
      @if (menuOpenId()) {
        <div class="fixed inset-0 z-10" (click)="menuOpenId.set(null)"></div>
      }

      <!-- Sealed letters -->
      @if (sealed().length > 0) {
        <div class="w-full max-w-[600px] mb-8">
          <div class="flex items-baseline gap-2 mb-3">
            <span class="text-romantic-text/50 text-xs font-serif uppercase tracking-widest">Sealed</span>
            <span class="text-romantic-text/35 text-xs font-serif">{{ sealed().length }}</span>
          </div>
          <div class="flex flex-col gap-3">
            @for (msg of sealed(); track msg.id) {
              <div class="relative rounded-2xl border border-romantic-pink/15 bg-romantic-pink/3 px-4 py-4 flex items-center gap-3">
                <span class="text-2xl shrink-0">🔐</span>
                <div class="flex-1 min-w-0">
                  <p class="text-romantic-text font-serif text-sm font-semibold leading-snug">{{ msg.title }}</p>
                  <p class="text-romantic-coral/60 text-xs font-serif mt-0.5">Opens {{ formatDate(msg.unlock_at) }}</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="w-2.5 h-2.5 rounded-full"
                        [class]="msg.author === 'jesse' ? 'bg-jesse-blue' : 'bg-romantic-pink'"></span>
                  <button (click)="toggleMenu(msg.id)"
                    class="w-8 h-8 rounded-full flex items-center justify-center text-romantic-text/55 hover:text-romantic-text/70 hover:bg-white/5 transition-all duration-200">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>
                    </svg>
                  </button>
                </div>
                @if (menuOpenId() === msg.id) {
                  <div class="absolute top-12 right-3 z-20 w-36 rounded-xl border border-romantic-pink/20 bg-[#1a0810]/95 backdrop-blur-md overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
                    <button (click)="deleteMessage(msg.id)"
                      class="w-full px-4 py-2.5 text-left text-sm font-serif text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-2">
                      🗑️ Delete
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Opened letters -->
      @if (opened().length > 0) {
        <div class="w-full max-w-[600px]">
          <div class="flex items-baseline gap-2 mb-3">
            <span class="text-romantic-text/50 text-xs font-serif uppercase tracking-widest">Open Letters</span>
            <span class="text-romantic-text/35 text-xs font-serif">{{ opened().length }}</span>
          </div>
          <div class="flex flex-col gap-4">
            @for (msg of opened(); track msg.id) {
              <div class="relative rounded-2xl border overflow-hidden"
                   [class]="msg.author === 'jesse' ? 'border-jesse-blue/15 bg-jesse-blue/5' : 'border-romantic-pink/15 bg-romantic-pink/5'">
                <div class="px-4 pt-4 pb-4">
                  <div class="flex items-start gap-2.5 mb-3">
                    <span class="text-xl shrink-0 mt-0.5">💌</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-romantic-text font-serif text-base font-semibold leading-snug">{{ msg.title }}</p>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span class="w-2 h-2 rounded-full shrink-0"
                              [class]="msg.author === 'jesse' ? 'bg-jesse-blue' : 'bg-romantic-pink'"></span>
                        <span class="text-romantic-text/50 text-[11px] font-serif">
                          {{ msg.author === 'jesse' ? 'Jesse' : 'Abigail' }} · written {{ formatDate(msg.created_at) }}
                        </span>
                      </div>
                    </div>
                    <button (click)="toggleMenu(msg.id)"
                      class="w-8 h-8 rounded-full flex items-center justify-center text-romantic-text/45 hover:text-romantic-text/70 hover:bg-white/5 transition-all duration-200 shrink-0">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>
                      </svg>
                    </button>
                  </div>
                  <p class="text-romantic-text/80 font-serif text-sm leading-[1.8] whitespace-pre-wrap">{{ msg.content }}</p>
                </div>
                @if (menuOpenId() === msg.id) {
                  <div class="absolute top-12 right-3 z-20 w-36 rounded-xl border border-romantic-pink/20 bg-[#1a0810]/95 backdrop-blur-md overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
                    <button (click)="openEdit(msg)"
                      class="w-full px-4 py-2.5 text-left text-sm font-serif text-romantic-text/70 hover:bg-romantic-pink/10 hover:text-romantic-pink transition-colors flex items-center gap-2">
                      ✏️ Edit
                    </button>
                    <button (click)="deleteMessage(msg.id)"
                      class="w-full px-4 py-2.5 text-left text-sm font-serif text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-2 border-t border-white/5">
                      🗑️ Delete
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- FAB -->
    <button (click)="openSheet()"
      class="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-romantic-pink text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral active:scale-95">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
    </button>

    <!-- Write sheet -->
    @if (sheetOpen()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeSheet()"></div>
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4 max-h-[92dvh] overflow-y-auto">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1 shrink-0"></div>
          <h3 class="text-romantic-coral font-romantic text-2xl text-center shrink-0">
            {{ editingId() ? 'Edit Letter' : 'Seal a Letter' }}
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

          <!-- Title -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">Title</label>
            <input type="text" [(ngModel)]="titleInput" placeholder="What is this letter about?"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/50" />
          </div>

          <!-- Content -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">Write your letter...</label>
            <textarea [(ngModel)]="contentInput" rows="10" placeholder="Write something they will open one day..."
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-[15px] focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/50 resize-none leading-[1.8]"></textarea>
            <div class="flex justify-between text-[11px] text-romantic-text/35 font-serif px-1">
              <span>{{ wordCount }} {{ wordCount === 1 ? 'word' : 'words' }}</span>
              @if (wordCount > 0) { <span>~{{ readingTime }} min read</span> }
            </div>
          </div>

          <!-- Seal until -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">Seal until</label>
            <input type="date" [(ngModel)]="unlockDate" [min]="minDate"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]" />
          </div>

          <button (click)="save()" [disabled]="!canSave() || saving()"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shrink-0">
            {{ saving() ? 'Saving…' : editingId() ? 'Save changes' : 'Seal this letter 🔐' }}
          </button>
        </div>
      </div>
    }
  `,
})
export class VaultComponent implements OnInit, OnDestroy {
  vaultService = inject(VaultService);
  private langService = inject(LanguageService);
  private identityService = inject(IdentityService);

  private now = signal(Date.now());
  private ticker: ReturnType<typeof setInterval> | null = null;

  sheetOpen = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);
  menuOpenId = signal<string | null>(null);
  author = signal<'jesse' | 'abigail'>(this.identityService.user());
  titleInput = '';
  contentInput = '';
  unlockDate = '';

  get minDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  get wordCount(): number {
    const text = this.contentInput.trim();
    return text ? text.split(/\s+/).length : 0;
  }

  get readingTime(): number {
    return Math.max(1, Math.ceil(this.wordCount / 200));
  }

  sealed = computed(() =>
    this.vaultService.messages()
      .filter(m => new Date(m.unlock_at).getTime() > this.now())
      .sort((a, b) => new Date(a.unlock_at).getTime() - new Date(b.unlock_at).getTime())
  );

  opened = computed(() =>
    this.vaultService.messages()
      .filter(m => new Date(m.unlock_at).getTime() <= this.now())
      .sort((a, b) => new Date(b.unlock_at).getTime() - new Date(a.unlock_at).getTime())
  );

  ngOnInit(): void {
    this.vaultService.loadAll();
    this.ticker = setInterval(() => this.now.set(Date.now()), 60000);
  }

  ngOnDestroy(): void {
    if (this.ticker) clearInterval(this.ticker);
  }

  formatDate(iso: string): string {
    const locale = this.langService.lang() === 'es' ? 'es-ES' : 'en-US';
    return new Date(iso).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
  }

  openSheet(): void {
    this.editingId.set(null);
    this.author.set(this.identityService.user());
    this.titleInput = '';
    this.contentInput = '';
    this.unlockDate = '';
    this.sheetOpen.set(true);
  }

  openEdit(msg: { id: string; author: 'jesse' | 'abigail'; title: string; content: string; unlock_at: string }): void {
    this.menuOpenId.set(null);
    this.editingId.set(msg.id);
    this.author.set(msg.author);
    this.titleInput = msg.title;
    this.contentInput = msg.content;
    this.unlockDate = msg.unlock_at.split('T')[0];
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
    this.editingId.set(null);
    this.titleInput = '';
    this.contentInput = '';
    this.unlockDate = '';
  }

  canSave(): boolean {
    return !!this.titleInput.trim() && !!this.contentInput.trim() && !!this.unlockDate;
  }

  async save(): Promise<void> {
    if (!this.canSave()) return;
    this.saving.set(true);
    const id = this.editingId();
    if (id) {
      await this.vaultService.update(id, {
        title: this.titleInput.trim(),
        content: this.contentInput.trim(),
        unlock_at: new Date(this.unlockDate + 'T00:00:00').toISOString(),
      });
    } else {
      await this.vaultService.create({
        author: this.author(),
        title: this.titleInput.trim(),
        content: this.contentInput.trim(),
        unlock_at: new Date(this.unlockDate + 'T00:00:00').toISOString(),
      });
    }
    this.saving.set(false);
    this.closeSheet();
  }

  toggleMenu(id: string): void {
    this.menuOpenId.update(current => current === id ? null : id);
  }

  async deleteMessage(id: string): Promise<void> {
    await this.vaultService.delete(id);
    this.menuOpenId.set(null);
  }
}
