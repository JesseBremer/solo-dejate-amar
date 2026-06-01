import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocationsService } from '../../../services/locations.service';
import { MapLocation } from '../../../models';

@Component({
  selector: 'app-admin-locations',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <h2 class="text-xl text-romantic-coral font-semibold">Manage Map Locations</h2>

      <!-- Add/Edit Form -->
      <div class="flex flex-col gap-4 p-4 border border-romantic-pink/30 rounded-lg">
        <h3 class="text-lg text-romantic-text-light">{{ editingId() ? 'Edit Location' : 'Add New Location' }}</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="text-romantic-text-light text-sm">Title</label>
            <input
              type="text"
              [(ngModel)]="title"
              placeholder="e.g., Ottawa, Ontario, Canada"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="text-romantic-text-light text-sm">Description</label>
            <textarea
              [(ngModel)]="description"
              rows="2"
              placeholder="e.g., Where we first met."
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink resize-y"></textarea>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light text-sm">Latitude</label>
            <input
              type="number"
              step="0.0000001"
              [(ngModel)]="lat"
              placeholder="e.g., 45.4215"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light text-sm">Longitude</label>
            <input
              type="number"
              step="0.0000001"
              [(ngModel)]="lng"
              placeholder="e.g., -75.6972"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-romantic-text-light text-sm">Visit Date (optional)</label>
            <input
              type="date"
              [(ngModel)]="visitDate"
              class="px-3 py-2 bg-white/10 border border-romantic-pink/50 rounded text-white focus:outline-none focus:border-romantic-pink" />
          </div>
        </div>

        <div class="flex gap-2">
          <button
            (click)="save()"
            class="px-4 py-2 bg-romantic-pink text-white rounded hover:bg-romantic-pink/80 transition-colors">
            {{ editingId() ? 'Update' : 'Add Location' }}
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

      <!-- Locations List -->
      <div class="flex flex-col gap-3">
        <h3 class="text-lg text-romantic-text-light">Locations ({{ locationsService.locations().length }})</h3>

        @for (loc of locationsService.locations(); track loc.id) {
          <div class="flex items-start justify-between gap-3 p-3 bg-white/5 border border-romantic-pink/20 rounded">
            <div class="flex flex-col">
              <span class="text-white font-medium">{{ loc.title }}</span>
              <span class="text-gray-400 text-sm">{{ loc.description }}</span>
              <span class="text-gray-500 text-xs mt-1">{{ loc.lat }}, {{ loc.lng }}</span>
              @if (loc.visit_date) {
                <span class="text-gray-500 text-xs">Visited: {{ loc.visit_date }}</span>
              }
            </div>
            <div class="flex gap-2 shrink-0">
              <button
                (click)="edit(loc)"
                class="px-3 py-1 text-sm border border-jesse-blue text-jesse-blue rounded hover:bg-jesse-blue/20 transition-colors">
                Edit
              </button>
              <button
                (click)="delete(loc.id)"
                class="px-3 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-500/20 transition-colors">
                Delete
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminLocationsComponent implements OnInit {
  locationsService = inject(LocationsService);

  title = '';
  description = '';
  lat = 0;
  lng = 0;
  visitDate = '';
  editingId = signal<string | null>(null);

  ngOnInit(): void {
    this.locationsService.loadAll();
  }

  async save(): Promise<void> {
    if (!this.title || !this.description) return;

    const locData = {
      title: this.title,
      description: this.description,
      lat: this.lat,
      lng: this.lng,
      visit_date: this.visitDate || null,
      address: null,
      pin_type: null,
    };

    if (this.editingId()) {
      await this.locationsService.update(this.editingId()!, locData);
    } else {
      await this.locationsService.create(locData);
    }

    this.resetForm();
  }

  edit(loc: MapLocation): void {
    this.editingId.set(loc.id);
    this.title = loc.title;
    this.description = loc.description ?? '';
    this.lat = loc.lat;
    this.lng = loc.lng;
    this.visitDate = loc.visit_date ?? '';
  }

  cancelEdit(): void {
    this.resetForm();
  }

  async delete(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this location?')) {
      await this.locationsService.delete(id);
    }
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.title = '';
    this.description = '';
    this.lat = 0;
    this.lng = 0;
    this.visitDate = '';
  }
}
