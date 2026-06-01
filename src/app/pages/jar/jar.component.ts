import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JarService } from '../../services/jar.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-jar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-5">
      <h1 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-3"
          style="text-shadow: 2px 2px 4px rgba(255, 105, 180, 0.2);">
        {{ t().jar_title }}
      </h1>
      <p class="text-lg mb-8 text-center text-gray-400 max-w-[500px] leading-relaxed">
        {{ t().jar_subtitle }}
      </p>

      <!-- CSS Jar -->
      <div
        (click)="drawNote()"
        class="relative w-[140px] h-[180px] mx-auto mb-16 cursor-pointer group"
        [class.pointer-events-none]="isAnimating()"
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
          <!-- Glass reflection -->
          <div class="absolute top-[10px] left-[15px] w-[20px] h-[80%] bg-white/15 rounded-[10px] -skew-x-[10deg]"></div>

          <!-- Paper notes inside jar -->
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
          {{ t().jar_tap }}
        </div>
      </div>

      <!-- Note display -->
      @if (currentNote()) {
        <div class="bg-white/[0.03] border border-romantic-pink/30 border-l-4 border-l-romantic-pink rounded-lg px-10 py-8 mx-5 max-w-[550px] text-center font-romantic text-3xl text-romantic-text-light shadow-[0_10px_25px_rgba(0,0,0,0.5)] leading-relaxed animate-fade-in">
          "{{ currentNote() }}"
        </div>
      }

      <a routerLink="/"
         class="mt-8 px-5 py-3 cursor-pointer bg-transparent border border-romantic-coral text-romantic-coral rounded-md transition-all duration-300 font-serif hover:bg-romantic-coral hover:text-white no-underline">
        {{ t().jar_back }}
      </a>
    </div>
  `,
  styles: [`
    @keyframes flyOut {
      0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
      50% { transform: translateY(-80px) scale(1.5) rotate(20deg); opacity: 1; }
      100% { transform: translateY(-120px) scale(3) rotate(0deg); opacity: 0; }
    }
    .animate-fly-out {
      animation: flyOut 1s ease-in-out forwards;
    }
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(15px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 1.2s ease forwards;
    }
  `]
})
export class JarComponent implements OnInit {
  private jarService = inject(JarService);
  private langService = inject(LanguageService);
  readonly t = this.langService.t;

  currentNote = signal<string | null>(null);
  isAnimating = signal(false);
  lidOpen = signal(false);
  flyingNote = signal(false);

  private lastIndex = -1;

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
      let randomIndex: number;
      do {
        randomIndex = Math.floor(Math.random() * messages.length);
      } while (randomIndex === this.lastIndex && messages.length > 1);
      this.lastIndex = randomIndex;

      this.currentNote.set(messages[randomIndex].message);
      this.lidOpen.set(false);
      this.flyingNote.set(false);
      this.isAnimating.set(false);
    }, 800);
  }
}
