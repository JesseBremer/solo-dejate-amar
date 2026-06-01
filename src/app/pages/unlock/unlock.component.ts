import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-unlock',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-6 gap-6">

      <!-- App title — always bilingual on this screen -->
      <div class="text-center">
        <h2 class="text-romantic-coral font-romantic text-4xl md:text-5xl leading-tight">Unlock My Heart</h2>
        <p class="text-romantic-pink/70 font-romantic text-2xl md:text-3xl mt-1">Desbloquea Mi Corazón</p>
      </div>

      <!-- Passcode input -->
      <div class="flex flex-col items-center gap-1 w-full max-w-[280px]">
        <input
          type="password"
          [(ngModel)]="passcode"
          (keydown.enter)="submit('en')"
          class="p-3 text-xl text-center border border-romantic-coral bg-transparent text-romantic-coral rounded-xl outline-none w-full font-serif focus:border-romantic-pink transition-colors placeholder:text-sm"
          placeholder="Our special date · Nuestra fecha especial" />
        @if (showError()) {
          <p class="text-romantic-coral/80 text-sm font-serif text-center mt-1">
            That's not it, my love.<br>
            <span class="text-romantic-pink/70">Eso no es, mi amor.</span>
          </p>
        }
      </div>

      <!-- Language + enter buttons -->
      <div class="flex flex-col items-center gap-2 w-full max-w-[280px]">
        <button
          (click)="submit('en')"
          class="w-full px-6 py-3 cursor-pointer bg-transparent border border-romantic-coral text-romantic-coral rounded-xl font-serif transition-all duration-300 hover:bg-romantic-coral hover:text-white active:scale-95">
          Enter in English
        </button>
        <button
          (click)="submit('es')"
          class="w-full px-6 py-3 cursor-pointer bg-transparent border border-romantic-pink text-romantic-pink rounded-xl font-serif transition-all duration-300 hover:bg-romantic-pink hover:text-white active:scale-95">
          Entrar en Español
        </button>
      </div>

    </div>
  `
})
export class UnlockComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private langService = inject(LanguageService);

  passcode = '';
  showError = signal(false);

  submit(lang: 'en' | 'es'): void {
    if (this.authService.unlock(this.passcode)) {
      this.langService.set(lang);
      this.router.navigate(['/']);
    } else {
      this.showError.set(true);
    }
  }
}
