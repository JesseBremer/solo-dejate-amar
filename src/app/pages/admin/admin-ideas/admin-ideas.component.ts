import { Component, inject, OnInit } from '@angular/core';
import { IdeaService } from '../../../services/idea.service';

const STATUS_LABEL: Record<string, string> = {
  pending: '⏳ pending', accepted: '✓ accepted', done: '✅ done', declined: '✗ declined',
};

@Component({
  selector: 'app-admin-ideas',
  standalone: true,
  template: `
    <div class="flex flex-col gap-4">
      <h2 class="text-xl text-romantic-coral font-semibold">Ideas ({{ ideaService.ideas().length }})</h2>
      <p class="text-gray-400 text-sm">All ideas across every status.</p>

      <div class="max-h-[480px] overflow-y-auto flex flex-col gap-2">
        @for (idea of ideaService.ideas(); track idea.id) {
          <div class="flex items-start justify-between gap-3 p-3 bg-white/5 border border-romantic-pink/20 rounded">
            <div class="flex flex-col flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="w-2 h-2 rounded-full shrink-0" [class]="idea.author === 'jesse' ? 'bg-jesse-blue' : 'bg-romantic-pink'"></span>
                <span class="text-xs text-gray-400">{{ idea.author === 'jesse' ? 'Jesse' : 'Abigail' }}</span>
                <span class="text-xs text-gray-300">{{ statusLabel(idea.status) }}</span>
                @if (idea.is_dream) { <span class="text-xs text-romantic-pink">💫 dream</span> }
                @if (idea.suggested_date) { <span class="text-xs text-gray-500">📅 {{ idea.suggested_date }}</span> }
              </div>
              <span class="text-white text-sm font-semibold mt-1">{{ idea.title }}</span>
              @if (idea.note) { <span class="text-gray-300 text-sm break-words">{{ idea.note }}</span> }
              @if (idea.suggestion) { <span class="text-romantic-pink/80 text-xs italic mt-0.5">suggestion: {{ idea.suggestion }}</span> }
            </div>
            <button (click)="delete(idea.id)"
              class="px-2 py-1 text-xs border border-red-500 text-red-500 rounded hover:bg-red-500/20 transition-colors shrink-0">
              Delete
            </button>
          </div>
        } @empty {
          <p class="text-gray-500 text-sm italic">No ideas yet.</p>
        }
      </div>
    </div>
  `,
})
export class AdminIdeasComponent implements OnInit {
  ideaService = inject(IdeaService);

  ngOnInit(): void { this.ideaService.loadAll(); }

  statusLabel(status: string): string { return STATUS_LABEL[status] ?? status; }

  async delete(id: string): Promise<void> {
    if (confirm('Delete this idea?')) await this.ideaService.delete(id);
  }
}
