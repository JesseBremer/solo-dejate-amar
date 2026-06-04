import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { CycleService } from '../../services/cycle.service';
import { LanguageService } from '../../services/language.service';

interface PhaseDef {
  key: string; emoji: string; daysStart: number; daysEnd: number;
  bg: string; border: string; textAccent: string; bgAccent: string;
  name: string; name_es: string; nickname: string; nickname_es: string;
  defaultFeeling: string; defaultFeeling_es: string;
  defaultMissions: string[]; defaultMissions_es: string[];
}

const PHASE_DEFAULTS: PhaseDef[] = [
  {
    key: 'menstrual', emoji: '🌹', daysStart: 1, daysEnd: 5,
    bg: 'bg-[#3d0020]/60', border: 'border-[#c2185b]/40', textAccent: 'text-[#f48fb1]', bgAccent: 'bg-[#c2185b]',
    name: 'Menstrual', name_es: 'Menstrual', nickname: 'Queen Rest 👑', nickname_es: 'Reina en Reposo 👑',
    defaultFeeling: 'Low energy, quiet, and needing rest.',
    defaultFeeling_es: 'Poca energía, tranquila, y necesitando descanso.',
    defaultMissions: ['Give her a coconut oil massage', 'Order her favorite comfort food', 'Hold her close in bed — no pressure', 'Keep things low-key and peaceful', 'Just be present, warm, and quiet'],
    defaultMissions_es: ['Dale un masaje con aceite de coco', 'Pide su comida favorita', 'Abrázala en la cama — sin presión', 'Mantén todo tranquilo y suave', 'Solo estar presente, cálido y silencioso'],
  },
  {
    key: 'follicular', emoji: '🌸', daysStart: 6, daysEnd: 13,
    bg: 'bg-romantic-coral/10', border: 'border-romantic-coral/40', textAccent: 'text-romantic-coral', bgAccent: 'bg-romantic-coral',
    name: 'Follicular', name_es: 'Folicular', nickname: 'The High-Energy Glow ✨', nickname_es: 'El Brillo de Alta Energía ✨',
    defaultFeeling: 'Creative, sharp, and excited about life.',
    defaultFeeling_es: 'Creativa, aguda, y emocionada con la vida.',
    defaultMissions: ['Plan a date or a little adventure', 'Explore somewhere new together', 'Match her playful, active energy', 'Introduce a fun surprise', 'Be spontaneous and lighthearted'],
    defaultMissions_es: ['Planea una cita o aventurita', 'Exploren un lugar nuevo juntos', 'Iguala su energía juguetona y activa', 'Introduce una sorpresa divertida', 'Sé espontáneo y alegre'],
  },
  {
    key: 'ovulatory', emoji: '🔥', daysStart: 14, daysEnd: 17,
    bg: 'bg-romantic-pink/10', border: 'border-romantic-pink/50', textAccent: 'text-romantic-pink', bgAccent: 'bg-romantic-pink',
    name: 'Ovulatory', name_es: 'Ovulatoria', nickname: 'Your Playground 🔥', nickname_es: 'Tu Zona de Juego 🔥',
    defaultFeeling: 'Insatiably passionate, magnetic, and craving you.',
    defaultFeeling_es: 'Apasionada insaciablemente, magnética, y deseándote.',
    defaultMissions: ['Take total control — she wants it', 'Be bold, confident, and dominant', 'Plan your most passionate intimacy', "Tell her she's yours, claim her", 'Enjoy the most magnetic version of her'],
    defaultMissions_es: ['Toma el control total — ella lo quiere', 'Sé audaz, seguro y dominante', 'Planea tu momento íntimo más apasionado', 'Dile que es tuya, reclámala', 'Disfruta la versión más magnética de ella'],
  },
  {
    key: 'luteal', emoji: '🌙', daysStart: 18, daysEnd: 28,
    bg: 'bg-jesse-blue/10', border: 'border-jesse-blue/40', textAccent: 'text-jesse-blue', bgAccent: 'bg-jesse-blue',
    name: 'Luteal', name_es: 'Lútea', nickname: 'The Safe Haven ❤️‍🩹', nickname_es: 'El Refugio Seguro ❤️‍🩹',
    defaultFeeling: 'Sensitive, overthinking, her "saboteur" gets loud.',
    defaultFeeling_es: 'Sensible, piensa demasiado, su "saboteador" se activa.',
    defaultMissions: ["Say \"You are mine — I've got you\"", 'Give her forehead kisses often', 'Soothe her anxieties with calm strength', 'Avoid conflict — be her safe place', 'Reinforce your words, over and over'],
    defaultMissions_es: ['Di "Eres mía — te tengo"', 'Dale besitos en la frente seguido', 'Calma sus ansiedades con fortaleza serena', 'Evita conflictos — sé su lugar seguro', 'Refuerza tus palabras, una y otra vez'],
  },
];

@Component({
  selector: 'app-cycle',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="w-full px-4 pt-8 pb-28 flex flex-col items-center gap-6 max-w-[600px] mx-auto">

      <!-- Header -->
      <div class="w-full text-center">
        <h1 class="text-romantic-pink font-romantic text-4xl md:text-5xl animate-pulse-glow">
          {{ lang() === 'es' ? 'Su Energía' : 'Her Energy' }}
        </h1>
        <p class="text-romantic-text/60 text-sm font-serif italic mt-1">
          {{ lang() === 'es' ? 'Guía del ciclo de Abigail' : "Abigail's cycle guide for Jesse" }}
        </p>
      </div>

      @if (!cycleStartDate()) {
        <div class="w-full rounded-2xl border border-dashed border-romantic-pink/20 px-6 py-10 flex flex-col items-center gap-3 text-center">
          <span class="text-4xl">🌙</span>
          <p class="text-romantic-text/50 font-serif text-sm">
            {{ lang() === 'es' ? 'Establece la fecha de inicio del ciclo para ver la fase actual' : 'Set the cycle start date to see the current phase' }}
          </p>
          <button (click)="openSettings()"
            class="mt-2 px-5 py-2.5 rounded-xl bg-romantic-pink text-white font-serif text-sm active:scale-95 transition-all">
            {{ lang() === 'es' ? 'Configurar ciclo' : 'Set up cycle' }}
          </button>
        </div>

      } @else {

        <!-- Phase tabs — tappable -->
        <div class="w-full grid grid-cols-4 gap-1.5">
          @for (phase of allPhases; track phase.key) {
            <button (click)="selectedPhaseKey.set(phase.key)"
              class="flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all duration-200 active:scale-95 relative"
              [class]="selectedPhaseKey() === phase.key ? phase.border + ' ' + phase.bg : 'border-transparent bg-white/3'">
              <span class="text-xl">{{ phase.emoji }}</span>
              <span class="text-[11px] font-serif text-center leading-tight"
                    [class]="selectedPhaseKey() === phase.key ? phase.textAccent : 'text-romantic-text/55'">
                {{ phaseName(phase) }}
              </span>
              @if (currentPhase()?.key === phase.key) {
                <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-romantic-pink border border-[#1a0810]"></span>
              }
            </button>
          }
        </div>

        @if (selectedPhase()) {
          <!-- Selected phase card -->
          <div class="w-full rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-300"
               [class]="selectedPhase()!.border + ' ' + selectedPhase()!.bg">

            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <p class="text-romantic-text/60 text-[11px] font-serif uppercase tracking-widest">
                    {{ lang() === 'es' ? 'Fase' : 'Phase' }}
                  </p>
                  @if (isCurrentPhase()) {
                    <span class="text-[11px] font-serif px-1.5 py-0.5 rounded-full bg-romantic-pink/20 text-romantic-pink">
                      {{ lang() === 'es' ? 'ahora · día' : 'now · day' }} {{ cycleDay() }}
                    </span>
                  }
                </div>
                <h2 class="font-romantic text-2xl leading-tight" [class]="selectedPhase()!.textAccent">
                  {{ phaseName(selectedPhase()!) }}
                </h2>
                <p class="text-romantic-text/50 text-xs font-serif italic mt-0.5">{{ phaseNickname(selectedPhase()!) }}</p>
              </div>
              <div class="text-right">
                <p class="text-4xl">{{ selectedPhase()!.emoji }}</p>
                <p class="text-romantic-text/58 text-[11px] font-serif mt-1">
                  {{ lang() === 'es' ? 'Días' : 'Days' }} {{ selectedPhase()!.daysStart }}–{{ selectedPhase()!.daysEnd }}
                </p>
              </div>
            </div>

            <!-- Progress bar — only for current phase -->
            @if (isCurrentPhase()) {
              <div class="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700"
                     [class]="selectedPhase()!.bgAccent"
                     [style.width.%]="cycleProgress()"></div>
              </div>
            }

            <!-- How she feels — editable -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <p class="text-romantic-text/60 text-[11px] font-serif uppercase tracking-widest">
                  {{ lang() === 'es' ? 'Cómo se siente' : 'How she feels' }}
                </p>
                <button (click)="openEdit(selectedPhase()!.key)"
                  class="text-romantic-text/50 hover:text-romantic-pink text-[11px] font-serif transition-colors">
                  ✏️ {{ lang() === 'es' ? 'editar' : 'edit' }}
                </button>
              </div>
              <p class="text-romantic-text/80 font-serif text-sm leading-relaxed italic">
                "{{ selectedFeeling() }}"
              </p>
            </div>
          </div>

          <!-- Mission checklist -->
          <div class="w-full flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <p class="text-romantic-text/60 text-xs font-serif uppercase tracking-widest">
                {{ lang() === 'es' ? 'Tu Misión' : 'Your Mission' }}
              </p>
              <div class="flex items-center gap-3">
                @if (isCurrentPhase()) {
                  <span class="text-romantic-text/50 text-[11px] font-serif">{{ checkedCount() }}/{{ selectedMissions().length }}</span>
                }
                <button (click)="openEdit(selectedPhase()!.key)"
                  class="text-romantic-text/50 hover:text-romantic-pink text-[11px] font-serif transition-colors">
                  ✏️ {{ lang() === 'es' ? 'editar' : 'edit' }}
                </button>
              </div>
            </div>

            @for (mission of selectedMissions(); track $index) {
              <button (click)="isCurrentPhase() ? toggleMission($index) : null"
                class="w-full rounded-2xl border px-4 py-3.5 flex items-center gap-3 text-left transition-all duration-200"
                [class]="isCurrentPhase()
                  ? (checkedMissions().has($index) ? selectedPhase()!.border + ' bg-white/5 opacity-60' : 'border-white/8 bg-white/3 hover:border-romantic-pink/20 active:scale-[0.99]')
                  : 'border-white/8 bg-white/3'">
                @if (isCurrentPhase()) {
                  <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                       [class]="checkedMissions().has($index) ? 'border-transparent bg-romantic-pink/70 text-white' : 'border-romantic-text/20'">
                    @if (checkedMissions().has($index)) {
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    }
                  </div>
                } @else {
                  <div class="w-2 h-2 rounded-full bg-romantic-text/20 shrink-0 ml-2"></div>
                }
                <p class="text-romantic-text font-serif text-sm leading-snug flex-1"
                   [class]="isCurrentPhase() && checkedMissions().has($index) ? 'line-through text-romantic-text/60' : ''">
                  {{ mission }}
                </p>
              </button>
            }

            @if (isCurrentPhase() && checkedCount() > 0) {
              <button (click)="resetMissions()"
                class="text-romantic-text/45 text-xs font-serif text-center hover:text-romantic-text/60 transition-colors">
                {{ lang() === 'es' ? 'Reiniciar misiones' : 'Reset missions' }}
              </button>
            }
          </div>
        }

        <button (click)="openSettings()"
          class="text-romantic-text/45 text-xs font-serif hover:text-romantic-text/60 transition-colors">
          ⚙️ {{ lang() === 'es' ? 'Actualizar inicio del ciclo' : 'Update cycle start date' }}
        </button>
      }
    </div>

    <!-- Edit phase sheet -->
    @if (editingPhaseKey()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeEdit()"></div>
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4 max-h-[92dvh] overflow-y-auto">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1 shrink-0"></div>

          <h3 class="text-romantic-coral font-romantic text-xl text-center shrink-0">
            {{ editingPhaseDef()?.emoji }} {{ editingPhaseDef() ? phaseName(editingPhaseDef()!) : '' }}
          </h3>

          <!-- Feeling -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">
              {{ lang() === 'es' ? 'Cómo se siente' : 'How she feels' }}
            </label>
            <textarea [(ngModel)]="editFeeling" rows="3"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 resize-none leading-relaxed"></textarea>
          </div>

          <!-- Missions -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label class="text-romantic-text/50 text-xs font-serif">
                {{ lang() === 'es' ? 'Misiones para Jesse' : 'Missions for Jesse' }}
              </label>
              <button (click)="addMission()" class="text-romantic-pink text-xs font-serif">
                {{ lang() === 'es' ? '+ agregar' : '+ add' }}
              </button>
            </div>
            @for (mission of editMissions; track $index) {
              <div class="flex gap-2">
                <input type="text" [(ngModel)]="editMissions[$index]"
                  class="flex-1 bg-white/5 border border-romantic-pink/20 rounded-xl px-3 py-2 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60" />
                <button (click)="removeMission($index)"
                  class="text-romantic-text/55 hover:text-red-400 text-sm px-2 transition-colors">✕</button>
              </div>
            }
          </div>

          <button (click)="saveEdit()" [disabled]="savingEdit()"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 active:scale-[0.98] shrink-0">
            {{ savingEdit() ? (lang() === 'es' ? 'Guardando…' : 'Saving…') : (lang() === 'es' ? 'Guardar cambios' : 'Save changes') }}
          </button>
        </div>
      </div>
    }

    <!-- Settings sheet -->
    @if (settingsOpen()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="settingsOpen.set(false)"></div>
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1"></div>
          <h3 class="text-romantic-coral font-romantic text-2xl text-center">
            {{ lang() === 'es' ? 'Configurar Ciclo' : 'Cycle Settings' }}
          </h3>
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ lang() === 'es' ? 'Último período empezó' : 'Last period started' }}</label>
            <input type="date" [(ngModel)]="editCycleStart"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ lang() === 'es' ? 'Duración promedio (días)' : 'Average cycle length (days)' }}</label>
            <input type="number" [(ngModel)]="editCycleLength" min="21" max="35"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60" />
          </div>
          <button (click)="saveSettings()" [disabled]="!editCycleStart || savingSettings()"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base disabled:opacity-40 active:scale-[0.98]">
            {{ savingSettings() ? '…' : (lang() === 'es' ? 'Guardar' : 'Save') }}
          </button>
        </div>
      </div>
    }
  `,
})
export class CycleComponent implements OnInit {
  private configService = inject(ConfigService);
  private cycleService = inject(CycleService);
  private langService = inject(LanguageService);

  readonly allPhases = PHASE_DEFAULTS;
  readonly lang = this.langService.lang;

  // Cycle settings
  settingsOpen = signal(false);
  savingSettings = signal(false);
  editCycleStart = '';
  editCycleLength = 28;

  selectedPhaseKey = signal<string | null>(null);

  selectedPhase = computed<PhaseDef | null>(() => {
    const key = this.selectedPhaseKey() ?? this.currentPhase()?.key;
    return PHASE_DEFAULTS.find(p => p.key === key) ?? null;
  });

  isCurrentPhase = computed(() =>
    this.selectedPhaseKey() === null || this.selectedPhaseKey() === this.currentPhase()?.key
  );

  selectedFeeling = computed(() => {
    const phase = this.selectedPhase();
    if (!phase) return '';
    return this.cycleService.getPhase(phase.key)?.feeling ?? this.defaultFeelingFor(phase);
  });

  selectedMissions = computed(() => {
    const phase = this.selectedPhase();
    if (!phase) return [];
    return this.cycleService.getPhase(phase.key)?.missions ?? this.defaultMissionsFor(phase);
  });

  private defaultFeelingFor(phase: PhaseDef): string {
    return this.lang() === 'es' ? phase.defaultFeeling_es : phase.defaultFeeling;
  }

  private defaultMissionsFor(phase: PhaseDef): string[] {
    return this.lang() === 'es' ? phase.defaultMissions_es : phase.defaultMissions;
  }

  phaseName(phase: PhaseDef): string {
    return this.lang() === 'es' ? phase.name_es : phase.name;
  }

  phaseNickname(phase: PhaseDef): string {
    return this.lang() === 'es' ? phase.nickname_es : phase.nickname;
  }

  // Edit phase
  editingPhaseKey = signal<string | null>(null);
  savingEdit = signal(false);
  editFeeling = '';
  editMissions: string[] = [];

  // Missions checklist
  checkedMissions = signal<Set<number>>(new Set());

  cycleStartDate = computed(() => this.configService.config()?.cycle_start_date ?? null);
  cycleLength = computed(() => this.configService.config()?.cycle_length ?? 28);

  cycleDay = computed(() => {
    const start = this.cycleStartDate();
    if (!start) return 1;
    const diff = Math.floor((Date.now() - new Date(start + 'T00:00:00').getTime()) / 86400000);
    return (diff % this.cycleLength()) + 1;
  });

  currentPhase = computed<PhaseDef | null>(() => {
    const day = this.cycleDay();
    const len = this.cycleLength();
    return PHASE_DEFAULTS.find((p, i) => {
      const end = i === PHASE_DEFAULTS.length - 1 ? len : p.daysEnd;
      return day >= p.daysStart && day <= end;
    }) ?? null;
  });

  nextPhase = computed<PhaseDef | null>(() => {
    const current = this.currentPhase();
    if (!current) return null;
    const idx = PHASE_DEFAULTS.findIndex(p => p.key === current.key);
    return PHASE_DEFAULTS[(idx + 1) % PHASE_DEFAULTS.length];
  });

  daysUntilNext = computed(() => {
    const current = this.currentPhase();
    if (!current) return 0;
    const end = PHASE_DEFAULTS.indexOf(current) === PHASE_DEFAULTS.length - 1
      ? this.cycleLength() : current.daysEnd;
    return end - this.cycleDay() + 1;
  });

  cycleProgress = computed(() => {
    const current = this.currentPhase();
    if (!current) return 0;
    const end = PHASE_DEFAULTS.indexOf(current) === PHASE_DEFAULTS.length - 1
      ? this.cycleLength() : current.daysEnd;
    const phaseLen = end - current.daysStart + 1;
    const dayInPhase = this.cycleDay() - current.daysStart + 1;
    return Math.min(100, Math.round((dayInPhase / phaseLen) * 100));
  });

  editingPhaseDef = computed(() =>
    PHASE_DEFAULTS.find(p => p.key === this.editingPhaseKey()) ?? null
  );

  checkedCount = computed(() => this.checkedMissions().size);

  ngOnInit(): void {
    this.cycleService.loadAll();
  }

  toggleMission(index: number): void {
    this.checkedMissions.update(set => {
      const next = new Set(set);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  resetMissions(): void {
    this.checkedMissions.set(new Set());
  }

  openEdit(phaseKey: string): void {
    const def = PHASE_DEFAULTS.find(p => p.key === phaseKey)!;
    const custom = this.cycleService.getPhase(phaseKey);
    this.editFeeling = custom?.feeling ?? this.defaultFeelingFor(def);
    this.editMissions = [...(custom?.missions ?? this.defaultMissionsFor(def))];
    this.editingPhaseKey.set(phaseKey);
  }

  closeEdit(): void {
    this.editingPhaseKey.set(null);
  }

  addMission(): void {
    this.editMissions = [...this.editMissions, ''];
  }

  removeMission(index: number): void {
    this.editMissions = this.editMissions.filter((_, i) => i !== index);
  }

  async saveEdit(): Promise<void> {
    const key = this.editingPhaseKey();
    if (!key) return;
    this.savingEdit.set(true);
    await this.cycleService.save(key, {
      feeling: this.editFeeling.trim(),
      missions: this.editMissions.map(m => m.trim()).filter(Boolean),
    });
    this.savingEdit.set(false);
    this.closeEdit();
    this.resetMissions();
  }

  openSettings(): void {
    this.editCycleStart = this.cycleStartDate() ?? '';
    this.editCycleLength = this.cycleLength();
    this.settingsOpen.set(true);
  }

  async saveSettings(): Promise<void> {
    if (!this.editCycleStart) return;
    this.savingSettings.set(true);
    await this.configService.update({
      cycle_start_date: this.editCycleStart,
      cycle_length: Number(this.editCycleLength) || 28,
    });
    this.savingSettings.set(false);
    this.settingsOpen.set(false);
    this.selectedPhaseKey.set(null);
    this.resetMissions();
  }
}
