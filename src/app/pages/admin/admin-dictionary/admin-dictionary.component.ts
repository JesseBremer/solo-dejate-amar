import { Component, inject, OnInit } from '@angular/core';
import { DictionaryService } from '../../../services/dictionary.service';

@Component({
  selector: 'app-admin-dictionary',
  standalone: true,
  template: `
    <div class="flex flex-col gap-4">
      <h2 class="text-xl text-romantic-coral font-semibold">Our Book ({{ dictionaryService.entries().length }})</h2>
      <p class="text-gray-400 text-sm">Every entry and answered question across both pages.</p>

      <div class="max-h-[480px] overflow-y-auto flex flex-col gap-2">
        @for (entry of dictionaryService.entries(); track entry.id) {
          <div class="flex items-start justify-between gap-3 p-3 bg-white/5 border border-romantic-pink/20 rounded">
            <div class="flex flex-col flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs px-1.5 py-0.5 rounded bg-white/10 text-gray-300">{{ entry.category }}</span>
                <span class="text-xs text-gray-500">about: {{ entry.about }}</span>
              </div>
              <span class="text-white text-sm font-semibold mt-1 break-words">{{ entry.term }}</span>
              @if (entry.translation) { <span class="text-romantic-pink/70 text-xs italic">— {{ entry.translation }}</span> }
              @if (entry.definition) { <span class="text-gray-300 text-sm break-words line-clamp-2">{{ entry.definition }}</span> }
            </div>
            <button (click)="delete(entry.id)"
              class="px-2 py-1 text-xs border border-red-500 text-red-500 rounded hover:bg-red-500/20 transition-colors shrink-0">
              Delete
            </button>
          </div>
        } @empty {
          <p class="text-gray-500 text-sm italic">No entries yet.</p>
        }
      </div>
    </div>
  `,
})
export class AdminDictionaryComponent implements OnInit {
  dictionaryService = inject(DictionaryService);

  ngOnInit(): void { this.dictionaryService.loadAll(); }

  async delete(id: string): Promise<void> {
    if (confirm('Delete this entry?')) await this.dictionaryService.delete(id);
  }
}
