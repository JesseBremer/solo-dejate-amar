import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <h2 class="text-xl text-romantic-coral font-semibold">Site Configuration</h2>

      @if (configService.config(); as config) {
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light">Passcode</label>
            <input
              type="text"
              [(ngModel)]="passcode"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light">Start Date</label>
            <input
              type="date"
              [(ngModel)]="startDate"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light">Target Date</label>
            <input
              type="date"
              [(ngModel)]="targetDate"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light">Spicy Score (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              [(ngModel)]="spicyScore"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light">Welcome Message</label>
            <textarea
              [(ngModel)]="welcomeMessage"
              rows="5"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink resize-y"></textarea>
          </div>

          <button
            (click)="save()"
            [disabled]="saving()"
            class="self-start px-6 py-2 bg-romantic-pink text-white rounded hover:bg-romantic-pink/80 transition-colors disabled:opacity-50">
            {{ saving() ? 'Saving...' : 'Save Changes' }}
          </button>

          @if (successMessage()) {
            <p class="text-green-400">{{ successMessage() }}</p>
          }
        </div>
      } @else {
        <p class="text-gray-400">Loading configuration...</p>
      }
    </div>
  `,
})
export class AdminConfigComponent implements OnInit {
  configService = inject(ConfigService);

  passcode = '';
  startDate = '';
  targetDate = '';
  spicyScore = 5;
  welcomeMessage = '';
  saving = signal(false);
  successMessage = signal('');

  ngOnInit(): void {
    this.loadValues();
  }

  private loadValues(): void {
    const config = this.configService.config();
    if (config) {
      this.passcode = config.passcode;
      this.startDate = config.start_date;
      this.targetDate = config.target_date;
      this.spicyScore = config.spicy_score;
      this.welcomeMessage = config.welcome_message;
    }
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.successMessage.set('');

    await this.configService.update({
      passcode: this.passcode,
      start_date: this.startDate,
      target_date: this.targetDate,
      spicy_score: this.spicyScore,
      welcome_message: this.welcomeMessage,
    });

    this.saving.set(false);
    this.successMessage.set('Configuration saved successfully!');

    setTimeout(() => this.successMessage.set(''), 3000);
  }
}
