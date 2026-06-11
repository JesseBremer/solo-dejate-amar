import { Component, inject, OnInit } from '@angular/core';
import { JournalService } from '../../../services/journal.service';
import { JournalEntry } from '../../../models';

@Component({
  selector: 'app-admin-journal',
  standalone: true,
  template: `
    <div class="flex flex-col gap-4">
      <h2 class="text-xl text-romantic-coral font-semibold">Journal ({{ journalService.entries().length }})</h2>
      <p class="text-gray-400 text-sm">Entries are written and edited in the app. Here you can review and remove them.</p>

      <div class="max-h-[480px] overflow-y-auto flex flex-col gap-2">
        @for (entry of journalService.entries(); track entry.id) {
          <div class="flex items-start justify-between gap-3 p-3 bg-white/5 border border-romantic-pink/20 rounded">
            <div class="flex flex-col flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full shrink-0" [class]="entry.author === 'jesse' ? 'bg-jesse-blue' : 'bg-romantic-pink'"></span>
                <span class="text-xs text-gray-400">{{ entry.author === 'jesse' ? 'Jesse' : 'Abigail' }} · {{ formatDate(entry.created_at) }}</span>
                @if (entry.image_path) { <span class="text-xs text-gray-500">📷</span> }
              </div>
              @if (entry.title) { <span class="text-white text-sm font-semibold mt-1">{{ entry.title }}</span> }
              <span class="text-gray-300 text-sm break-words line-clamp-2">{{ entry.content }}</span>
            </div>
            <button (click)="delete(entry.id)"
              class="px-2 py-1 text-xs border border-red-500 text-red-500 rounded hover:bg-red-500/20 transition-colors shrink-0">
              Delete
            </button>
          </div>
        } @empty {
          <p class="text-gray-500 text-sm italic">No journal entries yet.</p>
        }
      </div>
    </div>
  `,
})
export class AdminJournalComponent implements OnInit {
  journalService = inject(JournalService);

  ngOnInit(): void { this.journalService.loadAll(); }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async delete(id: string): Promise<void> {
    if (confirm('Delete this journal entry?')) await this.journalService.delete(id);
  }
}
