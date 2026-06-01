import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JarService } from '../../../services/jar.service';
import { JarMessage } from '../../../models';

@Component({
  selector: 'app-admin-jar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <h2 class="text-xl text-romantic-coral font-semibold">Manage Jar Messages</h2>

      <!-- Add Single Message -->
      <div class="flex flex-col gap-4 p-4 border border-romantic-pink/30 rounded-lg">
        <h3 class="text-lg text-romantic-text-light">{{ editingId() ? 'Edit Message' : 'Add Single Message' }}</h3>

        <div class="flex flex-col gap-2">
          <label class="text-romantic-text-light text-sm">Message</label>
          <textarea
            [(ngModel)]="message"
            rows="2"
            class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink resize-y"></textarea>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-romantic-text-light text-sm">Category (optional)</label>
          <select
            [(ngModel)]="category"
            class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink">
            <option value="">None</option>
            <option value="romantic">Romantic</option>
            <option value="playful">Playful</option>
            <option value="future">Future</option>
            <option value="intimate">Intimate</option>
          </select>
        </div>

        <div class="flex gap-2">
          <button
            (click)="saveSingle()"
            class="px-4 py-2 bg-romantic-pink text-white rounded hover:bg-romantic-pink/80 transition-colors">
            {{ editingId() ? 'Update' : 'Add Message' }}
          </button>
          @if (editingId()) {
            <button
              (click)="cancelEdit()"
              class="px-4 py-2 border border-gray-500 text-gray-400 rounded hover:bg-gray-500/20 transition-colors">
              Cancel
            </button>
          }
        </div>
      </div>

      <!-- Bulk Import -->
      <div class="flex flex-col gap-4 p-4 border border-romantic-pink/30 rounded-lg">
        <h3 class="text-lg text-romantic-text-light">Bulk Import</h3>
        <p class="text-gray-400 text-sm">Add multiple messages at once (one per line)</p>

        <textarea
          [(ngModel)]="bulkMessages"
          rows="5"
          placeholder="Enter one message per line..."
          class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink resize-y"></textarea>

        <button
          (click)="bulkImport()"
          class="self-start px-4 py-2 bg-jesse-blue text-white rounded hover:bg-jesse-blue/80 transition-colors">
          Import Messages
        </button>
      </div>

      <!-- Messages List -->
      <div class="flex flex-col gap-3">
        <h3 class="text-lg text-romantic-text-light">Messages ({{ jarService.messages().length }})</h3>

        <div class="max-h-[400px] overflow-y-auto flex flex-col gap-2">
          @for (msg of jarService.messages(); track msg.id) {
            <div class="flex items-start justify-between gap-3 p-3 bg-white/5 border border-romantic-pink/20 rounded">
              <div class="flex flex-col flex-1 min-w-0">
                <span class="text-white text-sm break-words">{{ msg.message }}</span>
                @if (msg.category) {
                  <span class="text-gray-500 text-xs mt-1">{{ msg.category }}</span>
                }
              </div>
              <div class="flex gap-2 shrink-0">
                <button
                  (click)="edit(msg)"
                  class="px-2 py-1 text-xs border border-jesse-blue text-jesse-blue rounded hover:bg-jesse-blue/20 transition-colors">
                  Edit
                </button>
                <button
                  (click)="delete(msg.id)"
                  class="px-2 py-1 text-xs border border-red-500 text-red-500 rounded hover:bg-red-500/20 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminJarComponent implements OnInit {
  jarService = inject(JarService);

  message = '';
  category = '';
  bulkMessages = '';
  editingId = signal<string | null>(null);

  ngOnInit(): void {
    this.jarService.loadAll();
  }

  async saveSingle(): Promise<void> {
    if (!this.message.trim()) return;

    const msgData = {
      message: this.message.trim(),
      category: this.category || null,
      written_by: null as null,
    };

    if (this.editingId()) {
      await this.jarService.update(this.editingId()!, msgData);
    } else {
      await this.jarService.create(msgData);
    }

    this.resetForm();
  }

  edit(msg: JarMessage): void {
    this.editingId.set(msg.id);
    this.message = msg.message;
    this.category = msg.category ?? '';
  }

  cancelEdit(): void {
    this.resetForm();
  }

  async delete(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this message?')) {
      await this.jarService.delete(id);
    }
  }

  async bulkImport(): Promise<void> {
    const messages = this.bulkMessages
      .split('\n')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    if (messages.length === 0) return;

    await this.jarService.bulkCreate(messages);
    this.bulkMessages = '';
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.message = '';
    this.category = '';
  }
}
