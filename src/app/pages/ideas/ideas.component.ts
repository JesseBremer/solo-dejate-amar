import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IdeaService } from '../../services/idea.service';
import { DreamsService } from '../../services/dreams.service';
import { TimelineService } from '../../services/timeline.service';
import { LanguageService } from '../../services/language.service';
import { IdentityService } from '../../services/identity.service';
import { Idea } from '../../models';

const PARTNER = (me: string) => me === 'jesse' ? 'Abigail' : 'Jesse';

@Component({
  selector: 'app-ideas',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (menuOpenId()) {
      <div class="fixed inset-0 z-10" (click)="menuOpenId.set(null)"></div>
    }
    @if (notNowOpen() || suggestOpen()) {
      <div class="fixed inset-0 z-[49]" (click)="closeActionSheets()"></div>
    }

    <div class="flex flex-col items-center w-full px-4 pt-8 pb-6 max-w-[600px] mx-auto">
      <h1 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-1">{{ t().ideas_title }}</h1>
      <p class="text-romantic-text/60 text-sm font-serif italic mb-8 text-center">{{ t().ideas_subtitle }}</p>

      @if (ideaService.ideas().length === 0) {
        <div class="flex flex-col items-center gap-3 mt-16 text-center">
          <span class="text-5xl">💡</span>
          <p class="text-romantic-text/60 font-serif italic text-sm" [innerHTML]="t().ideas_empty.replace('\\n','<br>')"></p>
        </div>
      }

      <!-- For You (incoming pending) -->
      @if (incoming().length > 0) {
        <div class="w-full mb-7">
          <div class="flex items-baseline gap-2 mb-3">
            <span class="text-romantic-coral text-xs font-serif uppercase tracking-widest">{{ t().ideas_for_you }}</span>
            <span class="text-romantic-text/35 text-xs font-serif">{{ incoming().length }}</span>
          </div>
          <div class="flex flex-col gap-3">
            @for (idea of incoming(); track idea.id) {
              <div class="rounded-2xl border border-romantic-coral/30 bg-romantic-coral/5 px-4 py-4 flex flex-col gap-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="text-romantic-text font-serif text-sm font-semibold leading-snug">{{ idea.title }}</p>
                    @if (idea.note) {
                      <p class="text-romantic-text/60 font-serif text-xs mt-1 leading-relaxed">{{ idea.note }}</p>
                    }
                    <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                      @if (idea.suggested_date) {
                        <span class="text-romantic-coral/70 text-[11px] font-serif">📅 {{ formatDateTime(idea.suggested_date, idea.suggested_time) }}</span>
                      }
                      @if (idea.is_dream) {
                        <span class="text-romantic-pink/70 text-[11px] font-serif">{{ t().ideas_dream_badge }}</span>
                      }
                      @if (idea.rescheduled) {
                        <span class="text-romantic-text/40 text-[11px] font-serif">{{ t().ideas_rescheduled_badge }}</span>
                      }
                    </div>
                  </div>
                  <span class="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                        [class]="idea.author === 'jesse' ? 'bg-jesse-blue' : 'bg-romantic-pink'"></span>
                </div>
                <div class="flex flex-col gap-2">
                  <button (click)="accept(idea.id)"
                    class="w-full py-3 rounded-xl bg-romantic-pink text-white font-serif transition-all active:scale-[0.98]">
                    {{ t().ideas_accept }}
                  </button>
                  <div class="flex gap-2">
                    <button (click)="openSuggestSheet(idea.id)"
                      class="flex-1 py-2.5 rounded-xl border border-romantic-text/20 text-romantic-text/55 text-sm font-serif transition-all active:scale-[0.98]">
                      {{ t().ideas_suggest }}
                    </button>
                    <button (click)="openNotNowSheet(idea.id)"
                      class="flex-1 py-2.5 rounded-xl border border-romantic-text/20 text-romantic-text/55 text-sm font-serif transition-all active:scale-[0.98]">
                      {{ t().ideas_not_now }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Plans (accepted) -->
      @if (accepted().length > 0) {
        <div class="w-full mb-7">
          <div class="flex items-baseline gap-2 mb-3">
            <span class="text-romantic-text/50 text-xs font-serif uppercase tracking-widest">{{ t().ideas_plans }}</span>
            <span class="text-romantic-text/35 text-xs font-serif">{{ accepted().length }}</span>
          </div>
          <div class="flex flex-col gap-3">
            @for (idea of accepted(); track idea.id) {
              <div class="relative rounded-2xl border border-jesse-blue/20 bg-jesse-blue/5 px-4 py-4">
                <div class="flex items-start justify-between gap-2 mb-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-romantic-text font-serif text-sm font-semibold leading-snug pr-6">{{ idea.title }}</p>
                    @if (idea.note) {
                      <p class="text-romantic-text/60 font-serif text-xs mt-1 leading-relaxed">{{ idea.note }}</p>
                    }
                    <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                      @if (idea.suggested_date) {
                        <span class="text-jesse-blue/70 text-[11px] font-serif">📅 {{ formatDateTime(idea.suggested_date, idea.suggested_time) }}</span>
                      }
                      @if (idea.is_dream) {
                        <span class="text-romantic-pink/70 text-[11px] font-serif">{{ t().ideas_dream_badge }}</span>
                      }
                    </div>
                  </div>
                  <!-- Kebab -->
                  <button (click)="toggleMenu(idea.id)"
                    class="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-romantic-text/40 hover:text-romantic-text/70 hover:bg-white/5 transition-all duration-200">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>
                    </svg>
                  </button>
                  @if (menuOpenId() === idea.id) {
                    <div class="absolute top-10 right-3 z-20 w-36 rounded-xl border border-romantic-pink/20 bg-[#1a0810]/95 backdrop-blur-md overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
                      <button (click)="deleteIdea(idea.id)"
                        class="w-full px-4 py-2.5 text-left text-sm font-serif text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-2">
                        🗑️ Remove
                      </button>
                    </div>
                  }
                </div>
                <div class="flex gap-2">
                  <button (click)="markDone(idea.id)"
                    class="flex-1 py-2.5 rounded-xl border border-jesse-blue/30 text-jesse-blue text-sm font-serif transition-all active:scale-[0.98] hover:bg-jesse-blue/10">
                    {{ t().ideas_mark_done }}
                  </button>
                  <button (click)="resetToPending(idea.id)"
                    class="flex-1 py-2.5 rounded-xl border border-romantic-text/20 text-romantic-text/50 text-sm font-serif transition-all active:scale-[0.98] hover:border-romantic-text/35">
                    {{ t().ideas_reschedule }}
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Sent (outgoing pending) -->
      @if (outgoing().length > 0) {
        <div class="w-full mb-7">
          <div class="flex items-baseline gap-2 mb-3">
            <span class="text-romantic-text/50 text-xs font-serif uppercase tracking-widest">{{ t().ideas_sent }}</span>
            <span class="text-romantic-text/35 text-xs font-serif">{{ outgoing().length }}</span>
          </div>
          <div class="flex flex-col gap-3">
            @for (idea of outgoing(); track idea.id) {
              <div class="relative rounded-2xl border border-romantic-pink/15 bg-romantic-pink/3 px-4 py-4">
                <p class="text-romantic-text font-serif text-sm font-semibold leading-snug pr-8">{{ idea.title }}</p>
                @if (idea.note) {
                  <p class="text-romantic-text/55 font-serif text-xs mt-1 leading-relaxed">{{ idea.note }}</p>
                }
                <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                  @if (idea.suggested_date) {
                    <span class="text-romantic-text/45 text-[11px] font-serif">📅 {{ formatDateTime(idea.suggested_date, idea.suggested_time) }}</span>
                  }
                  @if (idea.is_dream) {
                    <span class="text-romantic-pink/60 text-[11px] font-serif">💫 Dream</span>
                  }
                  @if (!idea.suggestion) {
                    <span class="text-romantic-text/35 text-[11px] font-serif italic">{{ t().ideas_waiting_on }} {{ partnerName() }}…</span>
                  }
                </div>
                @if (idea.suggestion) {
                  <div class="rounded-xl bg-romantic-pink/8 border border-romantic-pink/20 overflow-hidden">
                    <div class="px-3 pt-2.5 pb-2">
                      <p class="text-romantic-pink/80 text-[11px] font-serif font-semibold mb-0.5">{{ partnerName() }} {{ t().ideas_partner_suggested }}</p>
                      @if (idea.suggested_date || idea.suggested_time) {
                        <p class="text-romantic-text/60 text-[11px] font-serif">📅 {{ formatDateTime(idea.suggested_date, idea.suggested_time) }}</p>
                      }
                      <p class="text-romantic-text/65 text-xs font-serif mt-0.5 italic">"{{ idea.suggestion }}"</p>
                    </div>
                    <div class="flex border-t border-romantic-pink/15">
                      <button (click)="acceptSuggestion(idea.id)"
                        class="flex-1 py-2.5 text-xs font-serif text-romantic-pink hover:bg-romantic-pink/10 transition-colors">
                        {{ t().ideas_accept_suggestion }}
                      </button>
                      <div class="w-px bg-romantic-pink/15"></div>
                      <button (click)="dismissSuggestion(idea.id)"
                        class="flex-1 py-2.5 text-xs font-serif text-romantic-text/45 hover:bg-white/5 transition-colors">
                        {{ t().ideas_dismiss }}
                      </button>
                    </div>
                  </div>
                } @else {
                  <button (click)="openEdit(idea)"
                    class="w-full py-2.5 rounded-xl border border-romantic-pink/20 text-romantic-text/50 text-sm font-serif transition-all active:scale-[0.98] hover:border-romantic-pink/40 hover:text-romantic-text/70">
                    {{ idea.rescheduled ? t().ideas_propose_new_time : t().ideas_update_details }}
                  </button>
                }
                <button (click)="toggleMenu(idea.id)"
                  class="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-romantic-text/40 hover:text-romantic-text/70 hover:bg-white/5 transition-all duration-200">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>
                  </svg>
                </button>
                @if (menuOpenId() === idea.id) {
                  <div class="absolute top-10 right-3 z-20 w-36 rounded-xl border border-romantic-pink/20 bg-[#1a0810]/95 backdrop-blur-md overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
                    <button (click)="deleteIdea(idea.id)"
                      class="w-full px-4 py-2.5 text-left text-sm font-serif text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-2">
                      {{ t().ideas_cancel_idea }}
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Done -->
      @if (done().length > 0) {
        <div class="w-full">
          <div class="flex items-baseline gap-2 mb-3">
            <span class="text-romantic-text/35 text-xs font-serif uppercase tracking-widest">{{ t().ideas_done_section }}</span>
          </div>
          <div class="flex flex-col gap-3">
            @for (idea of done(); track idea.id) {
              <div class="rounded-2xl border border-white/8 bg-white/3 px-4 py-3.5">
                <p class="text-romantic-text/50 font-serif text-sm leading-snug line-through">{{ idea.title }}</p>

                <!-- Timeline prompt -->
                @if (pendingTimelineId() === idea.id) {
                  <div class="mt-3 flex items-center gap-2 pt-3 border-t border-white/8">
                    <span class="text-romantic-text/60 text-xs font-serif flex-1">{{ t().ideas_timeline_prompt }}</span>
                    <button (click)="addToTimeline(idea)"
                      class="px-3 py-1.5 rounded-lg bg-romantic-pink/80 text-white text-xs font-serif hover:bg-romantic-pink transition-colors active:scale-95">
                      {{ t().ideas_timeline_yes }}
                    </button>
                    <button (click)="pendingTimelineId.set(null)"
                      class="px-3 py-1.5 rounded-lg border border-white/15 text-romantic-text/45 text-xs font-serif hover:border-white/25 transition-colors">
                      {{ t().ideas_timeline_skip }}
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- FAB -->
    <button (click)="openSheet()"
      class="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-romantic-pink text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral active:scale-95">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>
      </svg>
    </button>

    <!-- Add sheet -->
    @if (sheetOpen()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeSheet()"></div>
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4 max-h-[92dvh] overflow-y-auto">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1 shrink-0"></div>
          <h3 class="text-romantic-coral font-romantic text-2xl text-center shrink-0">
            {{ editingId() ? t().ideas_edit_title : t().ideas_new_title }}
          </h3>

          <!-- Author (create only) -->
          @if (!editingId()) {
          <div class="grid grid-cols-2 gap-2 shrink-0">
            <button (click)="author.set('jesse')"
              [class]="author() === 'jesse' ? 'border-jesse-blue bg-jesse-blue/15 text-jesse-blue' : 'border-romantic-text/20 text-romantic-text/60'"
              class="py-2.5 rounded-xl border text-sm font-serif transition-all duration-200">Jesse</button>
            <button (click)="author.set('abigail')"
              [class]="author() === 'abigail' ? 'border-romantic-pink bg-romantic-pink/15 text-romantic-pink' : 'border-romantic-text/20 text-romantic-text/60'"
              class="py-2.5 rounded-xl border text-sm font-serif transition-all duration-200">Abigail</button>
          </div>
          }

          <!-- Title -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().ideas_what_label }}</label>
            <input type="text" [(ngModel)]="formTitle" [placeholder]="t().ideas_what_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/50" />
          </div>

          <!-- Note -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().ideas_note_label }} <span class="text-romantic-text/35">{{ t().ideas_optional }}</span></label>
            <textarea [(ngModel)]="formNote" rows="2" [placeholder]="t().ideas_note_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/50 resize-none leading-relaxed"></textarea>
          </div>

          <!-- Suggested date + time -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().ideas_when_label }} <span class="text-romantic-text/35">{{ t().ideas_optional }}</span></label>
            <div class="flex gap-2">
              <input type="date" [(ngModel)]="formDate"
                class="flex-1 bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]" />
              <input type="time" [(ngModel)]="formTime" [disabled]="!formDate"
                class="w-32 bg-white/5 border border-romantic-pink/20 rounded-xl px-3 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark] disabled:opacity-35" />
            </div>
          </div>

          <!-- Dream toggle -->
          <button (click)="formIsDream = !formIsDream"
            class="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200"
            [class]="formIsDream ? 'border-romantic-pink/40 bg-romantic-pink/8' : 'border-romantic-text/15 bg-white/3'">
            <span class="text-lg">💫</span>
            <div class="flex-1 text-left">
              <p class="text-romantic-text/80 text-sm font-serif">{{ t().ideas_dream_toggle_label }}</p>
              <p class="text-romantic-text/40 text-xs font-serif">{{ t().ideas_dream_toggle_sub }}</p>
            </div>
            <div class="w-10 h-6 rounded-full transition-all duration-200 relative shrink-0"
                 [class]="formIsDream ? 'bg-romantic-pink' : 'bg-white/15'">
              <div class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                   [class]="formIsDream ? 'left-5' : 'left-1'"></div>
            </div>
          </button>

          <!-- Dream category (shown when dream toggle is on) -->
          @if (formIsDream) {
            <div class="flex flex-col gap-2">
              <label class="text-romantic-text/50 text-xs font-serif">{{ t().ideas_dream_category }}</label>
              <div class="grid grid-cols-3 gap-2">
                <button (click)="formDreamCategory = 'short_term'"
                  [class]="formDreamCategory === 'short_term' ? 'border-romantic-coral/60 bg-romantic-coral/10 text-romantic-coral' : 'border-romantic-text/15 text-romantic-text/60'"
                  class="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-serif transition-all duration-200">
                  <span class="text-lg">🌸</span>{{ t().ideas_dream_this_year }}
                </button>
                <button (click)="formDreamCategory = 'long_term'"
                  [class]="formDreamCategory === 'long_term' ? 'border-romantic-pink/60 bg-romantic-pink/10 text-romantic-pink' : 'border-romantic-text/15 text-romantic-text/60'"
                  class="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-serif transition-all duration-200">
                  <span class="text-lg">✨</span>{{ t().ideas_dream_future }}
                </button>
                <button (click)="formDreamCategory = 'forever'"
                  [class]="formDreamCategory === 'forever' ? 'border-jesse-blue/60 bg-jesse-blue/10 text-jesse-blue' : 'border-romantic-text/15 text-romantic-text/60'"
                  class="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-serif transition-all duration-200">
                  <span class="text-lg">💫</span>{{ t().ideas_dream_forever }}
                </button>
              </div>
            </div>
          }

          <button (click)="save()" [disabled]="!formTitle.trim() || saving()"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shrink-0">
            {{ saving() ? t().ideas_saving : editingId() ? t().ideas_save : t().ideas_send }}
          </button>
        </div>
      </div>
    }

    <!-- Not Now sheet -->
    @if (notNowOpen()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeActionSheets()"></div>
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1"></div>
          <h3 class="text-romantic-text font-romantic text-2xl text-center">{{ t().ideas_not_now_title }}</h3>
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().ideas_postpone_label }} <span class="text-romantic-text/35">{{ t().ideas_optional }}</span></label>
            <input type="date" [(ngModel)]="notNowDate"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]" />
          </div>
          <button (click)="postpone(activeIdeaId()!)"
            class="w-full py-3.5 rounded-xl bg-jesse-blue text-white font-serif transition-all active:scale-[0.98]">
            {{ notNowDate ? t().ideas_postpone_with_date : t().ideas_postpone_no_date }}
          </button>
          <button (click)="removeIdea(activeIdeaId()!)"
            class="w-full py-3.5 rounded-xl border border-red-500/30 text-red-400 font-serif transition-all active:scale-[0.98] hover:bg-red-500/10">
            {{ t().ideas_remove }}
          </button>
        </div>
      </div>
    }

    <!-- Suggest sheet -->
    @if (suggestOpen()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeActionSheets()"></div>
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1"></div>
          <h3 class="text-romantic-coral font-romantic text-2xl text-center">{{ t().ideas_suggest_title }}</h3>
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().ideas_suggest_date_label }} <span class="text-romantic-text/35">{{ t().ideas_optional }}</span></label>
            <div class="flex gap-2">
              <input type="date" [(ngModel)]="suggestDate"
                class="flex-1 bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]" />
              <input type="time" [(ngModel)]="suggestTime" [disabled]="!suggestDate"
                class="w-32 bg-white/5 border border-romantic-pink/20 rounded-xl px-3 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark] disabled:opacity-35" />
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().ideas_suggest_message_label }} <span class="text-romantic-text/35">{{ t().ideas_optional }}</span></label>
            <input type="text" [(ngModel)]="suggestNote" [placeholder]="t().ideas_suggest_message_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/40" />
          </div>
          <button (click)="submitSuggestion(activeIdeaId()!)"
            [disabled]="!suggestNote.trim() && !suggestDate && !suggestTime"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif transition-all active:scale-[0.98] disabled:opacity-40">
            {{ t().ideas_send_suggestion }}
          </button>
        </div>
      </div>
    }
  `,
})
export class IdeasComponent implements OnInit {
  ideaService = inject(IdeaService);
  private dreamsService = inject(DreamsService);
  private timelineService = inject(TimelineService);
  private langService = inject(LanguageService);
  private identityService = inject(IdentityService);

  readonly t = this.langService.t;
  private me = computed(() => this.identityService.user());
  partnerName = computed(() => PARTNER(this.me()));

  sheetOpen = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);
  menuOpenId = signal<string | null>(null);
  pendingTimelineId = signal<string | null>(null);
  activeIdeaId = signal<string | null>(null);
  notNowOpen = signal(false);
  suggestOpen = signal(false);
  notNowDate = '';
  suggestDate = '';
  suggestTime = '';
  suggestNote = '';

  author = signal<'jesse' | 'abigail'>(this.identityService.user());
  formTitle = '';
  formNote = '';
  formDate = '';
  formTime = '';
  formIsDream = false;
  formDreamCategory: 'short_term' | 'long_term' | 'forever' = 'short_term';

  incoming = computed(() =>
    this.ideaService.ideas()
      .filter(i => i.status === 'pending' && i.author !== this.me())
  );

  outgoing = computed(() =>
    this.ideaService.ideas()
      .filter(i => i.status === 'pending' && i.author === this.me())
  );

  accepted = computed(() =>
    this.ideaService.ideas()
      .filter(i => i.status === 'accepted')
      .sort((a, b) => {
        if (a.suggested_date && b.suggested_date) return a.suggested_date.localeCompare(b.suggested_date);
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      })
  );

  done = computed(() =>
    this.ideaService.ideas()
      .filter(i => i.status === 'done')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  );

  ngOnInit(): void {
    this.ideaService.loadAll();
    this.dreamsService.loadAll();
  }

  formatDate(dateStr: string): string {
    const locale = this.langService.lang() === 'es' ? 'es-ES' : 'en-US';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  }

  formatDateTime(dateStr: string | null, timeStr: string | null): string {
    const date = dateStr ? this.formatDate(dateStr) : '';
    if (!timeStr) return date;
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    const time = `${hour}:${m.toString().padStart(2, '0')} ${period}`;
    return date ? `${date} at ${time}` : time;
  }

  toggleMenu(id: string): void {
    this.menuOpenId.update(current => current === id ? null : id);
  }

  async accept(id: string): Promise<void> {
    await this.ideaService.updateStatus(id, 'accepted');
  }

  openNotNowSheet(id: string): void {
    this.activeIdeaId.set(id);
    this.notNowDate = '';
    this.notNowOpen.set(true);
  }

  openSuggestSheet(id: string): void {
    this.activeIdeaId.set(id);
    this.suggestDate = '';
    this.suggestTime = '';
    this.suggestNote = '';
    this.suggestOpen.set(true);
  }

  closeActionSheets(): void {
    this.notNowOpen.set(false);
    this.suggestOpen.set(false);
    this.activeIdeaId.set(null);
  }

  async acceptSuggestion(id: string): Promise<void> {
    await this.ideaService.updateStatus(id, 'accepted');
    await this.ideaService.clearSuggestion(id);
  }

  async dismissSuggestion(id: string): Promise<void> {
    await this.ideaService.clearSuggestion(id);
  }

  async submitSuggestion(id: string): Promise<void> {
    if (!this.suggestNote.trim() && !this.suggestDate && !this.suggestTime) return;
    await this.ideaService.updateSuggestion(id, this.suggestNote.trim() || null, this.suggestDate || null, this.suggestTime || null);
    this.closeActionSheets();
  }

  async postpone(id: string): Promise<void> {
    await this.ideaService.updateDate(id, this.notNowDate || null);
    this.closeActionSheets();
  }

  async removeIdea(id: string): Promise<void> {
    await this.ideaService.delete(id);
    this.closeActionSheets();
  }

  async resetToPending(id: string): Promise<void> {
    await this.ideaService.reschedule(id);
  }

  async markDone(id: string): Promise<void> {
    await this.ideaService.updateStatus(id, 'done');
    this.pendingTimelineId.set(id);
  }

  async addToTimeline(idea: Idea): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.timelineService.create({
      author: this.me(),
      title: idea.title,
      description: idea.note,
      event_date: today,
      emoji: '🎉',
      journal_entry_id: null,
    });
    this.pendingTimelineId.set(null);
  }

  async deleteIdea(id: string): Promise<void> {
    await this.ideaService.delete(id);
    this.menuOpenId.set(null);
  }

  openSheet(): void {
    this.editingId.set(null);
    this.author.set(this.identityService.user());
    this.formTitle = '';
    this.formNote = '';
    this.formDate = '';
    this.formTime = '';
    this.formIsDream = false;
    this.formDreamCategory = 'short_term';
    this.sheetOpen.set(true);
  }

  openEdit(idea: Idea): void {
    this.menuOpenId.set(null);
    this.editingId.set(idea.id);
    this.formTitle = idea.title;
    this.formNote = idea.note ?? '';
    this.formDate = idea.suggested_date ?? '';
    this.formTime = idea.suggested_time ?? '';
    this.formIsDream = idea.is_dream;
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
    this.editingId.set(null);
    this.formTitle = '';
    this.formNote = '';
    this.formDate = '';
    this.formTime = '';
    this.formIsDream = false;
  }

  async save(): Promise<void> {
    if (!this.formTitle.trim()) return;
    this.saving.set(true);

    const id = this.editingId();
    if (id) {
      const originalIdea = this.ideaService.ideas().find(i => i.id === id);
      await this.ideaService.update(id, {
        title: this.formTitle.trim(),
        note: this.formNote.trim() || null,
        suggested_date: this.formDate || null,
        suggested_time: this.formTime || null,
        is_dream: this.formIsDream,
      });
      // Create dream goal if the toggle was just turned on
      if (this.formIsDream && !originalIdea?.is_dream) {
        await this.dreamsService.create({
          title: this.formTitle.trim(),
          description: this.formNote.trim() || null,
          category: this.formDreamCategory,
          emoji: '💡',
        });
      }
      this.saving.set(false);
      this.closeSheet();
      return;
    }

    const idea = await this.ideaService.create({
      author: this.author(),
      title: this.formTitle.trim(),
      note: this.formNote.trim() || null,
      suggested_date: this.formDate || null,
      suggested_time: this.formTime || null,
      is_dream: this.formIsDream,
    });

    if (idea && this.formIsDream) {
      await this.dreamsService.create({
        title: idea.title,
        description: idea.note,
        category: this.formDreamCategory,
        emoji: '💡',
      });
    }

    this.saving.set(false);
    this.closeSheet();
  }
}
