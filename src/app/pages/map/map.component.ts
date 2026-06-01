import { Component, AfterViewInit, OnDestroy, inject, signal, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocationsService } from '../../services/locations.service';
import { LanguageService } from '../../services/language.service';
import { MapLocation, PinType } from '../../models';

declare const L: any;

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const PIN_TYPES: { key: PinType; emoji: string; label: string; color: string }[] = [
  { key: 'first_meeting', emoji: '💕', label: 'Where We Met',    color: '#ff69b4' },
  { key: 'first_date',    emoji: '💏', label: 'First Date',      color: '#ff6b6b' },
  { key: 'trip',          emoji: '✈️', label: 'Trip',            color: '#4da8da' },
  { key: 'home',          emoji: '🏠', label: 'Home',            color: '#9b59b6' },
  { key: 'special',       emoji: '⭐', label: 'Special Moment',  color: '#f39c12' },
  { key: 'food',          emoji: '🍽️', label: 'Food & Drinks',   color: '#e74c3c' },
  { key: 'music',         emoji: '🎵', label: 'Music & Events',  color: '#1abc9c' },
  { key: 'adventure',     emoji: '🌿', label: 'Adventure',       color: '#27ae60' },
];

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Full-screen map -->
    <div id="map" class="fixed inset-0 z-0" style="top: 0; bottom: 56px;"></div>

    <!-- Floating add button -->
    <button (click)="openAdd()"
      class="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-romantic-pink text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral active:scale-95">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>
      </svg>
    </button>

    <!-- Location count chip -->
    @if (locationsService.locations().length > 0) {
      <div class="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-[#1a0810]/90 backdrop-blur-md border border-romantic-pink/20 rounded-full px-4 py-1.5 flex items-center gap-2">
        <span class="text-romantic-pink text-sm font-romantic">{{ t().map_title }}</span>
        <span class="text-romantic-text/40 text-xs font-serif">· {{ locationsService.locations().length }}</span>
      </div>
    }

    <!-- Detail sheet -->
    @if (selectedLocation()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0" (click)="selectedLocation.set(null)"></div>
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-3 max-h-[60dvh] overflow-y-auto">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1 shrink-0"></div>

          <!-- Pin type badge -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ pinMeta(selectedLocation()!.pin_type)?.emoji ?? '📍' }}</span>
              <span class="text-xs font-serif px-2.5 py-1 rounded-full border border-romantic-pink/30 text-romantic-pink/70">
                {{ pinMeta(selectedLocation()!.pin_type)?.label ?? 'Place' }}
              </span>
            </div>
            <div class="flex gap-2">
              <button (click)="openEdit(selectedLocation()!)"
                class="text-romantic-text/30 hover:text-romantic-pink text-xs font-serif transition-colors px-2 py-1">
                ✏️ edit
              </button>
              @if (confirmingDelete()) {
                <button (click)="deleteLocation()"
                  class="text-red-400 text-xs font-serif px-2 py-1">confirm</button>
                <button (click)="confirmingDelete.set(false)"
                  class="text-romantic-text/30 text-xs font-serif px-2 py-1">cancel</button>
              } @else {
                <button (click)="confirmingDelete.set(true)"
                  class="text-romantic-text/20 hover:text-red-400 text-xs font-serif transition-colors px-2 py-1">
                  🗑️
                </button>
              }
            </div>
          </div>

          <!-- Title -->
          <h2 class="text-romantic-text font-romantic text-2xl leading-snug">{{ selectedLocation()!.title }}</h2>

          <!-- Address -->
          @if (selectedLocation()!.address) {
            <p class="text-romantic-text/40 text-xs font-serif flex items-center gap-1.5">
              <span>📍</span>{{ selectedLocation()!.address }}
            </p>
          }

          <!-- Date -->
          @if (selectedLocation()!.visit_date) {
            <p class="text-romantic-text/40 text-xs font-serif flex items-center gap-1.5">
              <span>📅</span>{{ formatDate(selectedLocation()!.visit_date!) }}
            </p>
          }

          <!-- Description -->
          @if (selectedLocation()!.description) {
            <p class="text-romantic-text/70 font-serif text-sm leading-relaxed whitespace-pre-wrap">
              {{ selectedLocation()!.description }}
            </p>
          }
        </div>
      </div>
    }

    <!-- Add / Edit sheet -->
    @if (sheetOpen()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeSheet()"></div>
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4 max-h-[92dvh] overflow-y-auto">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1 shrink-0"></div>
          <h3 class="text-romantic-coral font-romantic text-2xl text-center shrink-0">
            {{ editingId() ? t().map_edit_title : t().map_add_title }}
          </h3>

          <!-- Location search -->
          @if (!editingId()) {
            <div class="flex flex-col gap-2">
              <label class="text-romantic-text/50 text-xs font-serif">Location</label>
              <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()"
                [placeholder]="t().map_search_placeholder"
                class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25" />

              @if (searching()) {
                <p class="text-romantic-text/30 text-xs font-serif text-center animate-pulse">{{ t().map_searching }}</p>
              }

              @if (searchResults().length > 0) {
                <div class="flex flex-col rounded-xl border border-romantic-pink/15 overflow-hidden">
                  @for (result of searchResults(); track result.place_id) {
                    <button (click)="selectResult(result)"
                      class="px-4 py-3 text-left text-romantic-text/70 text-xs font-serif hover:bg-romantic-pink/10 border-b border-romantic-pink/10 last:border-0 transition-colors">
                      {{ result.display_name }}
                    </button>
                  }
                </div>
              }

              @if (formLat !== null) {
                <p class="text-romantic-pink/60 text-[10px] font-serif flex items-center gap-1">
                  ✓ {{ formAddress || 'Location selected' }}
                </p>
              }
            </div>
          }

          <!-- Pin type -->
          <div class="flex flex-col gap-2">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().map_pin_type_label }}</label>
            <div class="grid grid-cols-4 gap-2">
              @for (pt of pinTypes; track pt.key) {
                <button (click)="formPinType.set(pt.key)"
                  class="flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-serif transition-all duration-200"
                  [class]="formPinType() === pt.key
                    ? 'border-romantic-pink/60 bg-romantic-pink/10 text-romantic-pink'
                    : 'border-romantic-text/15 text-romantic-text/40'">
                  <span class="text-lg leading-none">{{ pt.emoji }}</span>
                  <span class="leading-tight text-center px-1">{{ pt.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Event name -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().map_event_name }}</label>
            <input type="text" [(ngModel)]="formTitle" [placeholder]="t().map_event_name_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25" />
          </div>

          <!-- Date -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().map_event_date }} <span class="text-romantic-text/25">(optional)</span></label>
            <input type="date" [(ngModel)]="formDate"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]" />
          </div>

          <!-- Description -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/50 text-xs font-serif">{{ t().map_description_label }} <span class="text-romantic-text/25">(optional)</span></label>
            <textarea [(ngModel)]="formDescription" rows="3" placeholder="What happened here?"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/25 resize-none leading-relaxed"></textarea>
          </div>

          <!-- Save -->
          <button (click)="save()" [disabled]="!canSave() || saving()"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shrink-0">
            {{ saving() ? t().map_saving : editingId() ? t().map_save_edit : t().map_save }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    :host ::ng-deep .custom-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      font-size: 16px;
      border: 2px solid rgba(255,255,255,0.3);
    }
    :host ::ng-deep .custom-pin span {
      transform: rotate(45deg);
      line-height: 1;
    }
    :host ::ng-deep .leaflet-popup-content-wrapper {
      background: #1a0810;
      color: #e0e0e0;
      border: 1px solid #ff69b4;
      border-radius: 8px;
      font-family: Georgia, serif;
    }
    :host ::ng-deep .leaflet-popup-tip { background: #1a0810; }
    :host ::ng-deep .leaflet-popup-close-button { color: #ff6b6b !important; }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  locationsService = inject(LocationsService);
  private langService = inject(LanguageService);
  private ngZone = inject(NgZone);

  readonly t = this.langService.t;
  readonly pinTypes = PIN_TYPES;

  private map: any;
  private markers: any[] = [];
  private searchDebounce: any;

  // Detail sheet
  selectedLocation = signal<MapLocation | null>(null);
  confirmingDelete = signal(false);

  // Add/edit sheet
  sheetOpen = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  searching = signal(false);
  searchResults = signal<NominatimResult[]>([]);
  formPinType = signal<PinType>('special');
  searchQuery = '';
  formTitle = '';
  formDescription = '';
  formDate = '';
  formAddress = '';
  formLat: number | null = null;
  formLng: number | null = null;

  canSave() {
    if (this.editingId()) return !!this.formTitle.trim();
    return !!this.formTitle.trim() && this.formLat !== null;
  }

  ngAfterViewInit(): void {
    this.locationsService.loadAll().then(() => this.initMap());
  }

  ngOnDestroy(): void {
    this.map?.remove();
    clearTimeout(this.searchDebounce);
  }

  private initMap(): void {
    if (typeof L === 'undefined') return;

    this.map = L.map('map', { zoomControl: false }).setView([30, -30], 3);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomleft' }).addTo(this.map);

    this.updateMarkers();

    // Subscribe to location changes
    let prev = this.locationsService.locations().length;
    const interval = setInterval(() => {
      const current = this.locationsService.locations();
      if (current.length !== prev) {
        prev = current.length;
        this.updateMarkers();
      }
    }, 500);
    (this as any)._interval = interval;
  }

  private updateMarkers(): void {
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const locations = this.locationsService.locations();
    if (!this.map || locations.length === 0) return;

    locations.forEach(loc => {
      const meta = this.pinMeta(loc.pin_type);
      const color = meta?.color ?? '#ff69b4';
      const emoji = meta?.emoji ?? '📍';

      const icon = L.divIcon({
        html: `<div class="custom-pin" style="background:${color}"><span>${emoji}</span></div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(this.map);
      marker.on('click', () => {
        this.ngZone.run(() => {
          this.selectedLocation.set(loc);
          this.confirmingDelete.set(false);
        });
      });
      this.markers.push(marker);
    });

    const locs = this.locationsService.locations();
    if (locs.length > 1) {
      const bounds = L.latLngBounds(locs.map((l: MapLocation) => [l.lat, l.lng]));
      this.map.fitBounds(bounds, { padding: [80, 80], maxZoom: 8 });
    }
  }

  pinMeta(type: PinType | null | undefined) {
    return PIN_TYPES.find(p => p.key === type) ?? PIN_TYPES.find(p => p.key === 'special')!;
  }

  formatDate(iso: string): string {
    const lang = this.langService.lang();
    return new Date(iso + 'T00:00:00').toLocaleDateString(
      lang === 'es' ? 'es-ES' : 'en-US',
      { month: 'long', day: 'numeric', year: 'numeric' }
    );
  }

  onSearchChange(): void {
    clearTimeout(this.searchDebounce);
    if (this.searchQuery.trim().length < 3) {
      this.searchResults.set([]);
      return;
    }
    this.searching.set(true);
    this.searchDebounce = setTimeout(() => this.geocode(), 500);
  }

  private async geocode(): Promise<void> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&limit=5`,
        { headers: { 'Accept-Language': this.langService.lang() === 'es' ? 'es' : 'en' } }
      );
      const data: NominatimResult[] = await res.json();
      this.ngZone.run(() => {
        this.searchResults.set(data);
        this.searching.set(false);
      });
    } catch {
      this.ngZone.run(() => this.searching.set(false));
    }
  }

  selectResult(result: NominatimResult): void {
    this.formLat = parseFloat(result.lat);
    this.formLng = parseFloat(result.lon);
    // Use first two parts of display_name as short address
    this.formAddress = result.display_name.split(',').slice(0, 2).join(',').trim();
    this.searchQuery = this.formAddress;
    this.searchResults.set([]);
    // Pan map to selection
    this.map?.setView([this.formLat, this.formLng], 12);
  }

  openAdd(): void {
    this.editingId.set(null);
    this.formTitle = '';
    this.formDescription = '';
    this.formDate = '';
    this.formAddress = '';
    this.formLat = null;
    this.formLng = null;
    this.searchQuery = '';
    this.searchResults.set([]);
    this.formPinType.set('special');
    this.sheetOpen.set(true);
  }

  openEdit(loc: MapLocation): void {
    this.selectedLocation.set(null);
    this.editingId.set(loc.id);
    this.formTitle = loc.title;
    this.formDescription = loc.description ?? '';
    this.formDate = loc.visit_date ?? '';
    this.formAddress = loc.address ?? '';
    this.formLat = loc.lat;
    this.formLng = loc.lng;
    this.formPinType.set(loc.pin_type ?? 'special');
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
    this.editingId.set(null);
    this.searchResults.set([]);
  }

  async save(): Promise<void> {
    if (!this.canSave()) return;
    this.saving.set(true);

    const payload = {
      title: this.formTitle.trim(),
      description: this.formDescription.trim() || null,
      address: this.formAddress.trim() || null,
      lat: this.formLat!,
      lng: this.formLng!,
      visit_date: this.formDate || null,
      pin_type: this.formPinType(),
    };

    const id = this.editingId();
    if (id) {
      await this.locationsService.update(id, payload);
    } else {
      await this.locationsService.create(payload);
    }

    this.saving.set(false);
    this.closeSheet();
    this.updateMarkers();
  }

  async deleteLocation(): Promise<void> {
    const loc = this.selectedLocation();
    if (!loc) return;
    await this.locationsService.delete(loc.id);
    this.selectedLocation.set(null);
    this.confirmingDelete.set(false);
    this.updateMarkers();
  }
}
