import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { VaultService } from '../../../services/vault.service';

@Component({
  selector: 'app-admin-vault',
  standalone: true,
  template: `
    <div class="flex flex-col gap-4">
      <h2 class="text-xl text-romantic-coral font-semibold">Vault ({{ vaultService.messages().length }})</h2>
      <p class="text-gray-400 text-sm">Sealed letters stay hidden until their unlock date — even here. Open ones show their contents.</p>

      <div class="max-h-[480px] overflow-y-auto flex flex-col gap-2">
        @for (msg of sorted(); track msg.id) {
          <div class="flex items-start justify-between gap-3 p-3 bg-white/5 border border-romantic-pink/20 rounded">
            <div class="flex flex-col flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full shrink-0" [class]="msg.author === 'jesse' ? 'bg-jesse-blue' : 'bg-romantic-pink'"></span>
                <span class="text-xs text-gray-400">{{ msg.author === 'jesse' ? 'Jesse' : 'Abigail' }}</span>
                @if (isSealed(msg.unlock_at)) {
                  <span class="text-xs text-romantic-coral">🔐 sealed until {{ formatDate(msg.unlock_at) }}</span>
                } @else {
                  <span class="text-xs text-green-400">💌 open</span>
                }
              </div>
              <span class="text-white text-sm font-semibold mt-1">{{ msg.title }}</span>
              @if (!isSealed(msg.unlock_at)) {
                <span class="text-gray-300 text-sm break-words line-clamp-2">{{ msg.content }}</span>
              } @else {
                <span class="text-gray-500 text-sm italic">— contents hidden until unlock —</span>
              }
            </div>
            <button (click)="delete(msg.id)"
              class="px-2 py-1 text-xs border border-red-500 text-red-500 rounded hover:bg-red-500/20 transition-colors shrink-0">
              Delete
            </button>
          </div>
        } @empty {
          <p class="text-gray-500 text-sm italic">No letters yet.</p>
        }
      </div>
    </div>
  `,
})
export class AdminVaultComponent implements OnInit {
  vaultService = inject(VaultService);
  private now = signal(Date.now());

  sorted = computed(() =>
    [...this.vaultService.messages()].sort((a, b) => new Date(a.unlock_at).getTime() - new Date(b.unlock_at).getTime())
  );

  ngOnInit(): void { this.vaultService.loadAll(); }

  isSealed(unlockAt: string): boolean { return new Date(unlockAt).getTime() > this.now(); }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async delete(id: string): Promise<void> {
    if (confirm('Delete this letter? This cannot be undone.')) await this.vaultService.delete(id);
  }
}
