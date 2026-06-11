import { Component, inject, OnInit } from '@angular/core';
import { TimelineService } from '../../../services/timeline.service';

@Component({
  selector: 'app-admin-timeline',
  standalone: true,
  template: `
    <div class="flex flex-col gap-4">
      <h2 class="text-xl text-romantic-coral font-semibold">History ({{ timelineService.events().length }})</h2>
      <p class="text-gray-400 text-sm">Milestones on the timeline, oldest first.</p>

      <div class="max-h-[480px] overflow-y-auto flex flex-col gap-2">
        @for (event of timelineService.events(); track event.id) {
          <div class="flex items-start justify-between gap-3 p-3 bg-white/5 border border-romantic-pink/20 rounded">
            <div class="flex items-start gap-2 flex-1 min-w-0">
              <span class="text-lg shrink-0">{{ event.emoji || '⭐' }}</span>
              <div class="flex flex-col min-w-0">
                <span class="text-xs text-gray-400">{{ formatDate(event.event_date) }} · {{ event.author === 'jesse' ? 'Jesse' : 'Abigail' }}
                  @if (event.journal_entry_id) { <span class="text-gray-500">· 📖 from journal</span> }
                </span>
                <span class="text-white text-sm font-semibold">{{ event.title }}</span>
                @if (event.description) { <span class="text-gray-300 text-sm break-words line-clamp-2">{{ event.description }}</span> }
              </div>
            </div>
            <button (click)="delete(event.id)"
              class="px-2 py-1 text-xs border border-red-500 text-red-500 rounded hover:bg-red-500/20 transition-colors shrink-0">
              Delete
            </button>
          </div>
        } @empty {
          <p class="text-gray-500 text-sm italic">No milestones yet.</p>
        }
      </div>
    </div>
  `,
})
export class AdminTimelineComponent implements OnInit {
  timelineService = inject(TimelineService);

  ngOnInit(): void { this.timelineService.loadAll(); }

  formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async delete(id: string): Promise<void> {
    if (confirm('Delete this milestone?')) await this.timelineService.delete(id);
  }
}
