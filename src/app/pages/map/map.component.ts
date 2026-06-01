import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

declare const L: any;

interface MapLocation {
  lat: number;
  lng: number;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center w-full p-5">
      <h1 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-1"
          style="text-shadow: 2px 2px 4px rgba(255, 105, 180, 0.2);">
        Our World
      </h1>
      <p class="text-lg mb-6 text-center text-gray-400">Every coordinate where our story unfolded.</p>

      <div class="w-full max-w-[800px] flex flex-col items-center">
        <div id="map" class="w-full h-[60vh] min-h-[400px] rounded-lg border-2 border-romantic-pink shadow-[0_10px_25px_rgba(0,0,0,0.5)] z-[1]"></div>
      </div>

      <a routerLink="/"
         class="mt-5 px-5 py-3 cursor-pointer bg-transparent border border-romantic-coral text-romantic-coral rounded-md transition-all duration-300 font-serif hover:bg-romantic-coral hover:text-white no-underline">
        Back
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
  private map: any;

  private readonly locations: MapLocation[] = [
    {
      lat: 45.4215,
      lng: -75.6972,
      title: "Ottawa, Ontario, Canada",
      desc: "Where we first met."
    }
  ];

  ngAfterViewInit(): void {
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

    const heartIcon = L.divIcon({
      html: '\u2764\uFE0F',
      className: 'heart-pin',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -10]
    });

    this.locations.forEach(loc => {
      L.marker([loc.lat, loc.lng], { icon: heartIcon })
        .addTo(this.map)
        .bindPopup(`<b>${loc.title}</b><p>${loc.desc}</p>`);
    });
  }
}
