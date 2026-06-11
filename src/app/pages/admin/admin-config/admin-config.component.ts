import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <h2 class="text-xl text-romantic-coral font-semibold">Countdown & Milestone</h2>

      @if (configService.config(); as config) {
        <div class="flex flex-col gap-4">
          <p class="text-gray-400 text-sm">
            The next reunion or milestone shown on the home screen. (Also editable from the home page.)
          </p>

          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light">Event name</label>
            <input
              type="text"
              [(ngModel)]="eventName"
              placeholder="e.g. Our reunion, Anniversary…"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink placeholder:text-gray-500" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light">Target date</label>
            <input
              type="date"
              [(ngModel)]="targetDate"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink [color-scheme:dark]" />
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

          <p class="text-gray-500 text-xs mt-2 pt-4 border-t border-white/10">
            Together since {{ formatDate(config.start_date) }} · passcode and start date are fixed.
          </p>
        </div>
      } @else {
        <p class="text-gray-400">Loading configuration...</p>
      }
    </div>
  `,
})
export class AdminConfigComponent implements OnInit {
  configService = inject(ConfigService);

  eventName = '';
  targetDate = '';
  saving = signal(false);
  successMessage = signal('');

  ngOnInit(): void {
    const config = this.configService.config();
    if (config) {
      this.eventName = config.event_name ?? '';
      this.targetDate = config.target_date ?? '';
    }
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.successMessage.set('');

    await this.configService.update({
      target_date: this.targetDate,
      event_name: this.eventName.trim() || null,
    });

    this.saving.set(false);
    this.successMessage.set('Saved!');
    setTimeout(() => this.successMessage.set(''), 3000);
  }
}
