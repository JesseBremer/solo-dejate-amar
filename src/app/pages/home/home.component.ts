import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { SpicyMeterComponent } from '../../components/spicy-meter/spicy-meter.component';
import { NavButtonComponent } from '../../components/nav-button/nav-button.component';
import { ConfigService } from '../../services/config.service';

declare const confetti: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SpicyMeterComponent, NavButtonComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#1a0810] to-[#0f0f0f] text-[#e0e0e0] font-serif flex flex-col items-center justify-center p-5 box-border w-full">
      @if (showSplash()) {
        <div class="flex flex-col items-center justify-center w-full transition-opacity duration-1000"
             [class.opacity-0]="fadingSplash()">
          <img
            src="assets/images/PXL_20260514_190927841.jpg"
            alt="Our Love"
            class="w-[250px] h-[250px] object-cover mb-5 heart-mask" />
          <h1 class="font-romantic text-4xl md:text-5xl text-romantic-pink text-center m-0 animate-heartbeat"
              style="text-shadow: 2px 2px 4px rgba(255, 105, 180, 0.4);">
            Te amo my Queen!
          </h1>
        </div>
      } @else {
        <div class="flex flex-col items-center w-full">
          <h1 class="text-3xl md:text-5xl text-romantic-pink m-0 mb-4 text-center font-romantic animate-pulse-glow">
            Welcome home, Abigail.
          </h1>

          <div class="text-lg md:text-xl max-w-[600px] text-center text-romantic-text-light font-romantic leading-relaxed">
            {{ displayedText() }}
          </div>

          <div class="mt-6 text-base text-romantic-coral text-center bg-romantic-pink/5 px-6 md:px-8 py-4 rounded-lg border border-romantic-pink/20 shadow-lg">
            <div class="leading-relaxed">{{ countdownText() }}</div>
          </div>

          <app-spicy-meter [score]="spicyScore()" />

          <div class="flex flex-col gap-3 items-stretch mt-5 w-full max-w-[300px]">
            <app-nav-button route="/gallery" label="Our Memories" />
            <app-nav-button route="/songs" label="Our Songs" />
            <app-nav-button route="/story" label="Mi Rendicion" />
            <app-nav-button route="/jar" label="For When You Miss Me" />
            <app-nav-button route="/map" label="Our Map" />
            <button
              (click)="rainRoses()"
              class="w-full px-5 py-3 cursor-pointer border-2 border-romantic-pink bg-romantic-pink/10 text-[#ffebf0] font-bold rounded-md transition-all duration-300 font-serif animate-heartbeat hover:bg-romantic-pink hover:text-white hover:shadow-[0_0_15px_rgba(255,105,180,0.6)]">
              Claim your King!
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .heart-mask {
      -webkit-mask-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z'/%3E%3C/svg%3E");
      -webkit-mask-size: contain;
      mask-size: contain;
      -webkit-mask-position: center;
      mask-position: center;
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  private configService = inject(ConfigService);

  private readonly fallbackText = "Olvida las millas y el ruido del mundo exterior. Aqui, en este espacio, estas exactamente donde perteneces. Eres el latido de mis dias y la paz en mi alma. He construido este santuario solo para nosotros, para que, sin importar donde estemos, siempre tengas un lugar donde descansar tu corazon contra el mio.";

  showSplash = signal(false);
  fadingSplash = signal(false);
  displayedText = signal('');
  private typingIndex = 0;
  private typingInterval: ReturnType<typeof setInterval> | null = null;

  spicyScore = computed(() => this.configService.config()?.spicy_score ?? 5);

  private startDate = computed(() => {
    const config = this.configService.config();
    return config ? new Date(config.start_date) : new Date("2026-05-05");
  });

  private targetDate = computed(() => {
    const config = this.configService.config();
    return config ? new Date(config.target_date + "T00:00:00") : new Date("2026-06-15T00:00:00");
  });

  private fullText = computed(() => {
    return this.configService.config()?.welcome_message ?? this.fallbackText;
  });

  countdownText = computed(() => {
    const now = new Date();
    const start = this.startDate();
    const target = this.targetDate();

    const daysTogether = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const daysTogetherStr = this.capitalize(this.numberToWords(daysTogether));

    if (daysRemaining > 0) {
      const daysRemainingStr = this.numberToWords(daysRemaining);
      const sunriseWord = daysRemaining === 1 ? 'sunrise' : 'sunrises';
      return `${daysTogetherStr} days since the moment you changed everything, and ${daysRemainingStr} ${sunriseWord} until I finally get to hold mi amor again.`;
    }
    return `${daysTogetherStr} days since the moment you changed everything, and the wait is finally over!`;
  });

  ngOnInit(): void {
    this.startTyping();
  }

  ngOnDestroy(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }

  private startTyping(): void {
    this.typingInterval = setInterval(() => {
      const text = this.fullText();
      if (this.typingIndex < text.length) {
        this.displayedText.update(t => t + text.charAt(this.typingIndex));
        this.typingIndex++;
      } else {
        if (this.typingInterval) clearInterval(this.typingInterval);
      }
    }, 40);
  }

  rainRoses(): void {
    if (typeof confetti !== 'undefined') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        shapes: ['circle'],
        colors: ['#ff0000', '#ff69b4', '#8b0000']
      });
    }

    this.showSplash.set(true);
    this.fadingSplash.set(false);

    setTimeout(() => {
      this.fadingSplash.set(true);
      setTimeout(() => {
        this.showSplash.set(false);
      }, 1000);
    }, 5000);
  }

  private numberToWords(num: number): string {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if (num === 0) return 'zero';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + ones[num % 10] : '');
    return num.toString();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
