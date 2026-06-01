import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DreamsService } from '../../../services/dreams.service';
import { DreamGoal } from '../../../models';

type Category = 'short_term' | 'long_term' | 'forever';

const CATEGORY_LABELS: Record<Category, string> = {
  short_term: 'This Year',
  long_term: 'Our Future',
  forever: 'Forever & Always',
};

@Component({
  selector: 'app-admin-dreams',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <h2 class="text-romantic-coral font-romantic text-2xl">Dreams & Goals</h2>

      <!-- Add form -->
      <div class="flex flex-col gap-3 border border-romantic-pink/20 rounded-xl p-4 bg-white/3">
        <h3 class="text-romantic-text/70 text-sm font-serif font-semibold">Add new dream</h3>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-romantic-text/50 text-xs font-serif">Category</label>
            <select [(ngModel)]="formCategory"
              class="bg-white/5 border border-romantic-pink/20 rounded-lg px-3 py-2 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]">
              @for (cat of categoryKeys; track cat) {
                <option [value]="cat">{{ CATEGORY_LABELS[cat] }}</option>
              }
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-romantic-text/50 text-xs font-serif">Emoji</label>
            <input type="text" [(ngModel)]="formEmoji" maxlength="2" placeholder="🌟"
              class="bg-white/5 border border-romantic-pink/20 rounded-lg px-3 py-2 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25" />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-romantic-text/50 text-xs font-serif">Title</label>
          <input type="text" [(ngModel)]="formTitle" placeholder="Dream title..."
            class="bg-white/5 border border-romantic-pink/20 rounded-lg px-3 py-2 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-romantic-text/50 text-xs font-serif">Description <span class="text-romantic-text/25">(optional)</span></label>
          <textarea [(ngModel)]="formDescription" rows="2" placeholder="More details..."
            class="bg-white/5 border border-romantic-pink/20 rounded-lg px-3 py-2 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25 resize-none"></textarea>
        </div>

        <button (click)="add()" [disabled]="!formTitle.trim() || adding()"
          class="self-end px-5 py-2 rounded-lg bg-romantic-pink text-white text-sm font-serif transition-all disabled:opacity-40">
          {{ adding() ? 'Adding…' : 'Add dream' }}
        </button>
      </div>

      <!-- Goal list by category -->
      @for (cat of categoryKeys; track cat) {
        <div class="flex flex-col gap-2">
          <h3 class="text-romantic-text/60 text-xs font-serif uppercase tracking-widest">
            {{ CATEGORY_LABELS[cat] }}
          </h3>

          @for (goal of goalsFor(cat); track goal.id) {
            <div class="border border-romantic-pink/15 rounded-xl px-4 py-3 flex items-start gap-3 bg-white/2">
              <span class="text-lg shrink-0 mt-0.5">{{ goal.emoji || '🌟' }}</span>
              <div class="flex-1 min-w-0">
                @if (editingId() !== goal.id) {
                  <p class="text-romantic-text text-sm font-serif" [class]="goal.completed ? 'line-through opacity-50' : ''">
                    {{ goal.title }}
                  </p>
                  @if (goal.description) {
                    <p class="text-romantic-text/50 text-xs font-serif mt-0.5">{{ goal.description }}</p>
                  }
                  <div class="flex items-center gap-3 mt-2">
                    <span class="text-[10px] font-serif px-2 py-0.5 rounded-full"
                          [class]="goal.completed ? 'bg-romantic-pink/20 text-romantic-pink' : 'bg-white/5 text-romantic-text/30'">
                      {{ goal.completed ? 'achieved' : 'pending' }}
                    </span>
                  </div>
                } @else {
                  <!-- Inline edit form -->
                  <div class="flex flex-col gap-2">
                    <div class="grid grid-cols-4 gap-2">
                      <input type="text" [(ngModel)]="editEmoji" maxlength="2" placeholder="🌟"
                        class="col-span-1 bg-white/5 border border-romantic-pink/20 rounded-lg px-2 py-1.5 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25" />
                      <select [(ngModel)]="editCategory"
                        class="col-span-3 bg-white/5 border border-romantic-pink/20 rounded-lg px-2 py-1.5 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]">
                        @for (c of categoryKeys; track c) {
                          <option [value]="c">{{ CATEGORY_LABELS[c] }}</option>
                        }
                      </select>
                    </div>
                    <input type="text" [(ngModel)]="editTitle"
                      class="bg-white/5 border border-romantic-pink/20 rounded-lg px-3 py-1.5 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60" />
                    <textarea [(ngModel)]="editDescription" rows="2"
                      class="bg-white/5 border border-romantic-pink/20 rounded-lg px-3 py-1.5 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 resize-none"></textarea>
                    <div class="flex gap-2">
                      <button (click)="saveEdit(goal.id)" [disabled]="!editTitle.trim() || saving()"
                        class="px-3 py-1 rounded-lg bg-romantic-pink text-white text-xs font-serif disabled:opacity-40">
                        {{ saving() ? 'Saving…' : 'Save' }}
                      </button>
                      <button (click)="editingId.set(null)"
                        class="px-3 py-1 rounded-lg border border-romantic-text/20 text-romantic-text/50 text-xs font-serif">
                        Cancel
                      </button>
                    </div>
                  </div>
                }
              </div>

              @if (editingId() !== goal.id) {
                <div class="flex flex-col gap-1.5 shrink-0">
                  <button (click)="startEdit(goal)"
                    class="text-romantic-text/30 hover:text-romantic-pink text-xs font-serif transition-colors">
                    edit
                  </button>
                  <button (click)="toggleComplete(goal)"
                    class="text-romantic-text/30 hover:text-romantic-coral text-xs font-serif transition-colors">
                    {{ goal.completed ? 'undo' : 'done' }}
                  </button>
                  @if (confirmDeleteId() === goal.id) {
                    <button (click)="remove(goal.id)"
                      class="text-red-400 text-xs font-serif">
                      confirm
                    </button>
                    <button (click)="confirmDeleteId.set(null)"
                      class="text-romantic-text/30 text-xs font-serif">
                      cancel
                    </button>
                  } @else {
                    <button (click)="confirmDeleteId.set(goal.id)"
                      class="text-romantic-text/20 hover:text-red-400 text-xs font-serif transition-colors">
                      delete
                    </button>
                  }
                </div>
              }
            </div>
          }

          @if (goalsFor(cat).length === 0) {
            <p class="text-romantic-text/25 text-xs font-serif italic text-center py-2">No dreams in this category yet.</p>
          }
        </div>
      }
    </div>
  `,
})
export class AdminDreamsComponent implements OnInit {
  private dreamsService = inject(DreamsService);

  readonly CATEGORY_LABELS = CATEGORY_LABELS;
  readonly categoryKeys: Category[] = ['short_term', 'long_term', 'forever'];

  adding = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);
  confirmDeleteId = signal<string | null>(null);

  formCategory: Category = 'short_term';
  formTitle = '';
  formDescription = '';
  formEmoji = '';

  editCategory: Category = 'short_term';
  editTitle = '';
  editDescription = '';
  editEmoji = '';

  ngOnInit(): void {
    this.dreamsService.loadAll();
  }

  goalsFor(category: Category): DreamGoal[] {
    return this.dreamsService.goals().filter(g => g.category === category);
  }

  async add(): Promise<void> {
    if (!this.formTitle.trim()) return;
    this.adding.set(true);
    await this.dreamsService.create({
      title: this.formTitle.trim(),
      description: this.formDescription.trim() || null,
      category: this.formCategory,
      emoji: this.formEmoji.trim() || null,
    });
    this.adding.set(false);
    this.formTitle = '';
    this.formDescription = '';
    this.formEmoji = '';
  }

  startEdit(goal: DreamGoal): void {
    this.editingId.set(goal.id);
    this.editTitle = goal.title;
    this.editDescription = goal.description ?? '';
    this.editEmoji = goal.emoji ?? '';
    this.editCategory = goal.category;
  }

  async saveEdit(id: string): Promise<void> {
    if (!this.editTitle.trim()) return;
    this.saving.set(true);
    await this.dreamsService.update(id, {
      title: this.editTitle.trim(),
      description: this.editDescription.trim() || null,
      emoji: this.editEmoji.trim() || null,
      category: this.editCategory,
    });
    this.saving.set(false);
    this.editingId.set(null);
  }

  async toggleComplete(goal: DreamGoal): Promise<void> {
    await this.dreamsService.toggleComplete(goal.id, !goal.completed);
  }

  async remove(id: string): Promise<void> {
    await this.dreamsService.delete(id);
    this.confirmDeleteId.set(null);
  }
}
