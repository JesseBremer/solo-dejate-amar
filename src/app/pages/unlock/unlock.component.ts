import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-unlock',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-5 box-border">
      <h2 class="text-romantic-coral mb-5 font-romantic text-4xl md:text-5xl font-normal">Unlock My Heart</h2>
      <input
        type="password"
        [(ngModel)]="passcode"
        (keydown.enter)="checkPasscode()"
        class="p-3 text-xl text-center border border-romantic-coral bg-transparent text-romantic-coral rounded-md mb-5 outline-none w-full max-w-[250px] box-border font-serif"
        placeholder="Our special date..." />
      <button
        (click)="checkPasscode()"
        class="mt-0 px-5 py-3 cursor-pointer bg-transparent border border-romantic-coral text-romantic-coral rounded-md transition-all duration-300 font-serif hover:bg-romantic-coral hover:text-white">
        Enter
      </button>
      @if (showError()) {
        <div class="text-romantic-coral mt-3">That's not it, mi amor.</div>
      }
    </div>
  `
})
export class UnlockComponent {
  passcode = '';
  showError = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  checkPasscode(): void {
    if (this.authService.unlock(this.passcode)) {
      this.router.navigate(['/']);
    } else {
      this.showError.set(true);
    }
  }
}
