import { Component, computed, inject, input, signal } from '@angular/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-spicy-meter',
  standalone: true,
  template: `
    <div class="mt-4 text-romantic-coral text-center bg-romantic-pink/5 p-4 md:p-6 rounded-lg border border-romantic-pink/20 shadow-lg w-full max-w-[600px] box-border">
      <div class="font-romantic text-2xl mb-2 text-center">
        {{ t().spicy_title }}
        <span
          (click)="toggleGuide()"
          class="cursor-pointer inline-block transition-transform active:scale-90"
          title="Tap to view all levels">
          <span class="text-xl">&#x1F336;&#xFE0F;</span>
        </span>
      </div>

      <div class="flex items-center w-full my-4">
        <div class="min-w-7 w-7 h-7 rounded-full border border-romantic-pink z-[2] -mr-2 relative shadow-lg"
             style="background: radial-gradient(circle at 30% 30%, #ffd085, #ffb347, #d97a15);">
        </div>
        <div class="bg-black/50 rounded-r-lg h-4 flex-grow overflow-hidden border border-romantic-pink border-l-0 z-[1] relative">
          <div class="h-full transition-all duration-700 ease-in-out"
               style="background: linear-gradient(90deg, #ffb347 0%, #ff6b6b 50%, #ff0000 100%);"
               [style.width.%]="fillPercentage()">
          </div>
        </div>
        <div class="font-romantic text-xl min-w-14 text-right ml-4">
          {{ score() }}/10
        </div>
      </div>

      @if (showGuide()) {
        <div class="mt-4 p-4 bg-black/60 border border-romantic-pink rounded-lg text-sm text-left leading-relaxed text-romantic-text-light font-serif">
          <ul class="m-0 pl-5 list-disc">
            <li class="mb-2"><strong>0-3:</strong> {{ t().spicy_0_3 }}</li>
            <li class="mb-2"><strong>4-6:</strong> {{ t().spicy_4_6 }}</li>
            <li class="mb-2"><strong>7-9:</strong> {{ t().spicy_7_9 }}</li>
            <li class="mb-2"><strong>10:</strong> {{ t().spicy_10 }}</li>
          </ul>
        </div>
      }

      <div
        (click)="revealConsequence()"
        class="mt-4 text-base italic text-romantic-text-light leading-relaxed font-serif cursor-pointer bg-black/40 p-3 rounded-md border border-dashed border-romantic-pink transition-colors hover:bg-romantic-pink/20"
        [class.cursor-default]="isRevealed()">
        {{ displayText() }}
      </div>
    </div>
  `
})
export class SpicyMeterComponent {
  score = input<number>(5);

  private langService = inject(LanguageService);
  readonly t = this.langService.t;

  showGuide = signal(false);
  isRevealed = signal(false);

  fillPercentage = computed(() => (this.score() / 10) * 100);

  consequence = computed(() => {
    const s = this.score();
    const t = this.langService.t();
    if (s <= 3) return t.spicy_0_3;
    if (s <= 6) return t.spicy_4_6;
    if (s <= 9) return t.spicy_7_9;
    return t.spicy_10;
  });

  displayText = computed(() =>
    this.isRevealed() ? this.consequence() : this.langService.t().spicy_reveal
  );

  toggleGuide(): void {
    this.showGuide.update(v => !v);
  }

  revealConsequence(): void {
    if (!this.isRevealed()) this.isRevealed.set(true);
  }
}
