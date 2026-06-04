import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { IdentityService } from '../../services/identity.service';

@Component({
  selector: 'app-unlock',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-6 gap-8">

      <!-- App title -->
      <div class="text-center">
        <h2 class="text-romantic-coral font-romantic text-4xl md:text-5xl leading-tight">Solo Déjate Amar</h2>
        <p class="text-romantic-text/60 text-sm font-serif italic mt-2">Jesse & Abigail</p>
      </div>

      <!-- Passcode input -->
      <div class="flex flex-col items-center gap-2 w-full max-w-[280px]">
        <input
          type="password"
          [(ngModel)]="passcode"
          (keydown.enter)="submit('jesse')"
          class="p-3 text-xl text-center border border-romantic-pink/30 bg-white/5 text-romantic-text rounded-xl outline-none w-full font-serif focus:border-romantic-pink transition-colors placeholder:text-sm placeholder:text-romantic-text/50"
          placeholder="Our special date · Nuestra fecha especial" />
        @if (showError()) {
          <p class="text-romantic-coral/80 text-sm font-serif text-center">
            That's not it, my love.<br>
            <span class="text-romantic-pink/70">Eso no es, mi amor.</span>
          </p>
        }
      </div>

      <!-- Identity + language selection -->
      <div class="flex flex-col gap-3 w-full max-w-[280px]">
        <button (click)="submit('jesse')"
          class="w-full px-6 py-4 rounded-2xl border-2 border-jesse-blue/50 bg-jesse-blue/10 text-left flex items-center gap-4 transition-all duration-200 hover:bg-jesse-blue/20 active:scale-95">
          <span class="text-3xl">👨</span>
          <div>
            <p class="text-jesse-blue font-romantic text-xl leading-none">Jesse</p>
            <p class="text-romantic-text/60 text-xs font-serif mt-0.5">Continue in English</p>
          </div>
        </button>

        <button (click)="submit('abigail')"
          class="w-full px-6 py-4 rounded-2xl border-2 border-romantic-pink/50 bg-romantic-pink/10 text-left flex items-center gap-4 transition-all duration-200 hover:bg-romantic-pink/20 active:scale-95">
          <span class="text-3xl">👩</span>
          <div>
            <p class="text-romantic-pink font-romantic text-xl leading-none">Abigail</p>
            <p class="text-romantic-text/60 text-xs font-serif mt-0.5">Continuar en Español</p>
          </div>
        </button>
      </div>

    </div>
  `
})
export class UnlockComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private langService = inject(LanguageService);
  private identityService = inject(IdentityService);

  passcode = '';
  showError = signal(false);

  submit(user: 'jesse' | 'abigail'): void {
    if (this.authService.unlock(this.passcode)) {
      this.identityService.set(user);
      this.langService.set(user === 'jesse' ? 'en' : 'es');
      this.router.navigate(['/']);
    } else {
      this.showError.set(true);
    }
  }
}
