import { Component, AfterViewInit, OnDestroy, inject, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocationsService } from '../../services/locations.service';
import { LanguageService } from '../../services/language.service';

declare const L: any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center w-full p-5">
      <h1 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-1"
          style="text-shadow: 2px 2px 4px rgba(255, 105, 180, 0.2);">
        {{ t().map_title }}
      </h1>
      <p class="text-lg mb-6 text-center text-gray-400">{{ t().map_subtitle }}</p>

      <div class="w-full max-w-[800px] flex flex-col items-center">
        <div id="map" class="w-full h-[60vh] min-h-[400px] rounded-lg border-2 border-romantic-pink shadow-[0_10px_25px_rgba(0,0,0,0.5)] z-[1]"></div>
      </div>

      <a routerLink="/"
         class="mt-5 px-5 py-3 cursor-pointer bg-transparent border border-romantic-coral text-romantic-coral rounded-md transition-all duration-300 font-serif hover:bg-romantic-coral hover:text-white no-underline">
        {{ t().map_back }}
      </a>
    </div>
  `,
  styles: [`
    :host ::ng-deep .heart-pin {
      font-size: 24px;
      text-align: center;
      line-height: 24px;
      filter: drop-shadow(0 0 5px rgba(255, 105, 180, 0.8));
      animation: pulse-pin 1.5s infinite alternate;
    }
    @keyframes pulse-pin {
      0% { transform: scale(1); }
      100% { transform: scale(1.2); }
    }
    :host ::ng-deep .leaflet-popup-content-wrapper {
      background: #1a0810;
      color: #e0e0e0;
      border: 1px solid #ff69b4;
      border-radius: 8px;
      font-family: 'Georgia', serif;
    }
    :host ::ng-deep .leaflet-popup-tip {
      background: #1a0810;
    }
    :host ::ng-deep .leaflet-popup-content b {
      color: #ff6b6b;
      font-size: 1.1rem;
    }
    :host ::ng-deep .leaflet-popup-content p {
      margin: 5px 0 0 0;
      font-size: 0.95rem;
    }
    :host ::ng-deep .leaflet-popup-close-button {
      color: #ff6b6b !important;
    }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private locationsService = inject(LocationsService);
  private langService = inject(LanguageService);
  readonly t = this.langService.t;
  private map: any;
  private markers: any[] = [];

  constructor() {
    effect(() => {
      const locations = this.locationsService.locations();
      if (this.map && locations.length > 0) {
        this.updateMarkers();
      }
    });
  }

  ngAfterViewInit(): void {
    this.locationsService.loadAll();
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    if (typeof L === 'undefined') {
      console.error('Leaflet not loaded');
      return;
    }

    this.map = L.map('map').setView([45.4215, -75.6972], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
    }).addTo(this.map);

    this.updateMarkers();
  }

  private updateMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    const locations = this.locationsService.locations();
    if (locations.length === 0) return;

    const heartIcon = L.divIcon({
      html: '\u2764\uFE0F',
      className: 'heart-pin',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -10]
    });

    locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng], { icon: heartIcon })
        .addTo(this.map)
        .bindPopup(`<b>${loc.title}</b><p>${loc.description}</p>`);
      this.markers.push(marker);
    });

    if (locations.length === 1) {
      this.map.setView([locations[0].lat, locations[0].lng], 12);
    } else {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
}
