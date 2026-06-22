import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

const ADMIN_SECTIONS = [
  { path: 'config',     label: 'Countdown' },
  { path: 'journal',    label: 'Journal' },
  { path: 'gallery',    label: 'Gallery' },
  { path: 'albums',     label: 'Albums' },
  { path: 'songs',      label: 'Songs' },
  { path: 'ideas',      label: 'Ideas' },
  { path: 'dreams',     label: 'Dreams' },
  { path: 'vault',      label: 'Vault' },
  { path: 'timeline',   label: 'History' },
  { path: 'dictionary', label: 'Our Book' },
  { path: 'jar',        label: 'Jar' },
  { path: 'locations',  label: 'Locations' },
];

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex flex-col w-full max-w-4xl mx-auto p-5">
      <h1 class="text-romantic-coral font-romantic text-3xl md:text-4xl text-center mb-6">
        Admin Dashboard
      </h1>

      <nav class="flex flex-wrap justify-center gap-2 mb-8">
        @for (section of sections; track section.path) {
          <a
            [routerLink]="section.path"
            routerLinkActive="bg-romantic-pink text-white"
            class="px-4 py-2 border border-romantic-pink rounded-md text-romantic-pink hover:bg-romantic-pink/20 transition-colors">
            {{ section.label }}
          </a>
        }
      </nav>

      <div class="bg-white/5 border border-romantic-pink/30 rounded-lg p-6">
        <router-outlet />
      </div>

      <a
        routerLink="/"
        class="mt-6 self-center px-5 py-3 border border-romantic-coral text-romantic-coral rounded-md hover:bg-romantic-coral hover:text-white transition-colors">
        Back to Site
      </a>
    </div>
  `,
})
export class AdminComponent {
  readonly sections = ADMIN_SECTIONS;
}
