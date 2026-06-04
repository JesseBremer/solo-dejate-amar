import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JarService } from '../../services/jar.service';
import { LanguageService } from '../../services/language.service';
import { IdentityService } from '../../services/identity.service';

@Component({
  selector: 'app-jar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-5">
      <h1 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-3"
          style="text-shadow: 2px 2px 4px rgba(255, 105, 180, 0.2);">
        {{ t().jar_title }}
      </h1>
      <p class="text-lg mb-2 text-center text-gray-400 max-w-[500px] leading-relaxed">
        {{ t().jar_subtitle }}
      </p>

      <!-- Written count -->
      @if (jarService.writtenCount() > 0) {
        <p class="text-romantic-pink/50 text-xs font-serif italic mb-6">
          {{ t().jar_written_for }} {{ jarService.writtenCount() }}
          {{ jarService.writtenCount() === 1 ? t().jar_written_note : t().jar_written_notes }}
          {{ t().jar_written_them }}
        </p>
      } @else {
        <div class="mb-6"></div>
      }

      <!-- CSS Jar -->
      <div
        (click)="drawNote()"
        class="relative w-[140px] h-[180px] mx-auto mb-16 cursor-pointer group"
        [class.pointer-events-none]="isAnimating() || jarService.messages().length === 0"
        style="perspective: 1000px;">

        <!-- Lid -->
        <div class="absolute -top-4 left-[10px] w-[120px] h-[25px] rounded-[5px] z-10 shadow-lg transition-transform duration-400 group-hover:-translate-y-1 group-hover:rotate-3"
             [class.-translate-y-6]="lidOpen()"
             [class.rotate-[15deg]]="lidOpen()"
             style="background: linear-gradient(to right, #6b4423, #8b5a2b, #6b4423);">
        </div>

        <!-- Neck -->
        <div class="absolute top-0 left-[15px] w-[110px] h-[10px] bg-white/20 border-4 border-white/30 border-b-0 rounded-t-[10px] z-[4]"></div>

        <!-- Glass body -->
        <div class="absolute top-[10px] left-0 w-full h-full bg-white/5 border-4 border-white/30 border-t-0 rounded-b-[40px] shadow-[inset_0_0_20px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.5)] overflow-hidden z-[5]">
          <div class="absolute top-[10px] left-[15px] w-[20px] h-[80%] bg-white/15 rounded-[10px] -skew-x-[10deg]"></div>
          <div class="absolute bottom-[15px] left-[20px] w-[35px] h-[25px] bg-[#ffb6c1] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] rotate-[15deg]"></div>
          <div class="absolute bottom-[20px] left-[60px] w-[35px] h-[25px] bg-[#fdf0f4] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] -rotate-[20deg]"></div>
          <div class="absolute bottom-[40px] left-[25px] w-[35px] h-[25px] bg-[#ffc0cb] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] rotate-[45deg]"></div>
          <div class="absolute bottom-[35px] left-[75px] w-[35px] h-[25px] bg-[#fdf0f4] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] -rotate-[35deg]"></div>
          <div class="absolute bottom-[65px] left-[35px] w-[35px] h-[25px] bg-[#ff69b4] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] rotate-[10deg]"></div>
          <div class="absolute bottom-[60px] left-[70px] w-[35px] h-[25px] bg-[#fdf0f4] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] -rotate-[15deg]"></div>
          <div class="absolute bottom-[85px] left-[50px] w-[35px] h-[25px] bg-[#fdf0f4] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] rotate-[30deg]"></div>
          <div class="absolute bottom-[15px] left-[85px] w-[35px] h-[25px] bg-[#ffb6c1] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] -rotate-[10deg]"></div>
        </div>

        <!-- Flying note -->
        <div
          class="absolute top-[60px] left-[55px] w-[30px] h-[20px] bg-white rounded-[2px] shadow-[0_0_10px_rgba(0,0,0,0.3)] z-[6] opacity-0 pointer-events-none"
          [class.animate-fly-out]="flyingNote()">
        </div>

        <!-- Label -->
        <div class="absolute -bottom-11 left-1/2 -translate-x-1/2 font-romantic text-romantic-coral text-2xl whitespace-nowrap"
             style="text-shadow: 1px 1px 3px rgba(255, 105, 180, 0.3);">
          @if (jarService.messages().length === 0) {
            <span class="text-romantic-text/55 text-sm font-serif italic">{{ t().jar_empty }} {{ otherName() }} {{ t().jar_empty_yet }}</span>
          } @else {
            {{ t().jar_tap }}
          }
        </div>
      </div>

      <!-- Drawn note -->
      @if (currentNote()) {
        <div class="bg-white/[0.03] border border-romantic-pink/30 border-l-4 border-l-romantic-pink rounded-lg px-10 py-8 mx-5 max-w-[550px] text-center font-romantic text-3xl text-romantic-text-light shadow-[0_10px_25px_rgba(0,0,0,0.5)] leading-relaxed animate-fade-in">
          "{{ currentNote() }}"
        </div>
      }
    </div>

    <!-- Floating write button -->
    <button (click)="openWriteSheet()"
      class="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-romantic-pink text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral active:scale-95">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    </button>

    <!-- Write note sheet -->
    @if (writeSheetOpen()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeWriteSheet()"></div>
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4 max-h-[80dvh]">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1 shrink-0"></div>
          <h3 class="text-romantic-coral font-romantic text-2xl text-center shrink-0">{{ t().jar_write_title }}</h3>

          <p class="text-romantic-text/60 text-xs font-serif text-center -mt-2">
            for {{ otherName() }} 💕
          </p>

          <textarea [(ngModel)]="noteInput" rows="6"
            [placeholder]="t().jar_write_placeholder"
            class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/50 resize-none leading-relaxed"></textarea>

          <button (click)="saveNote()" [disabled]="!noteInput.trim() || savingNote()"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shrink-0">
            {{ savingNote() ? t().jar_write_saving : t().jar_write_save }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes flyOut {
      0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
      50% { transform: translateY(-80px) scale(1.5) rotate(20deg); opacity: 1; }
      100% { transform: translateY(-120px) scale(3) rotate(0deg); opacity: 0; }
    }
    .animate-fly-out { animation: flyOut 1s ease-in-out forwards; }
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(15px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 1.2s ease forwards; }
  `]
})
export class JarComponent implements OnInit {
  jarService = inject(JarService);
  private langService = inject(LanguageService);
  private identityService = inject(IdentityService);

  readonly t = this.langService.t;

  currentNote = signal<string | null>(null);
  isAnimating = signal(false);
  lidOpen = signal(false);
  flyingNote = signal(false);
  writeSheetOpen = signal(false);
  savingNote = signal(false);
  noteInput = '';

  private lastIndex = -1;

  otherName = computed(() =>
    this.identityService.user() === 'jesse' ? 'Abigail' : 'Jesse'
  );

  ngOnInit(): void {
    this.jarService.loadAll();
  }

  drawNote(): void {
    if (this.isAnimating()) return;
    const messages = this.jarService.messages();
    if (messages.length === 0) return;

    this.isAnimating.set(true);
    this.currentNote.set(null);
    this.lidOpen.set(true);
    this.flyingNote.set(true);

    setTimeout(() => {
      let idx: number;
      do { idx = Math.floor(Math.random() * messages.length); }
      while (idx === this.lastIndex && messages.length > 1);
      this.lastIndex = idx;
      this.currentNote.set(messages[idx].message);
      this.lidOpen.set(false);
      this.flyingNote.set(false);
      this.isAnimating.set(false);
    }, 800);
  }

  openWriteSheet(): void {
    this.noteInput = '';
    this.writeSheetOpen.set(true);
  }

  closeWriteSheet(): void {
    this.writeSheetOpen.set(false);
  }

  async saveNote(): Promise<void> {
    if (!this.noteInput.trim()) return;
    this.savingNote.set(true);
    await this.jarService.write(this.noteInput.trim());
    this.savingNote.set(false);
    this.closeWriteSheet();
  }
}
