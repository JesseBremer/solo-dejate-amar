import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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
        <a
          routerLink="config"
          routerLinkActive="bg-romantic-pink text-white"
          class="px-4 py-2 border border-romantic-pink rounded-md text-romantic-pink hover:bg-romantic-pink/20 transition-colors">
          Config
        </a>
        <a
          routerLink="songs"
          routerLinkActive="bg-romantic-pink text-white"
          class="px-4 py-2 border border-romantic-pink rounded-md text-romantic-pink hover:bg-romantic-pink/20 transition-colors">
          Songs
        </a>
        <a
          routerLink="jar"
          routerLinkActive="bg-romantic-pink text-white"
          class="px-4 py-2 border border-romantic-pink rounded-md text-romantic-pink hover:bg-romantic-pink/20 transition-colors">
          Jar Messages
        </a>
        <a
          routerLink="locations"
          routerLinkActive="bg-romantic-pink text-white"
          class="px-4 py-2 border border-romantic-pink rounded-md text-romantic-pink hover:bg-romantic-pink/20 transition-colors">
          Locations
        </a>
        <a
          routerLink="gallery"
          routerLinkActive="bg-romantic-pink text-white"
          class="px-4 py-2 border border-romantic-pink rounded-md text-romantic-pink hover:bg-romantic-pink/20 transition-colors">
          Gallery
        </a>
        <a
          routerLink="dreams"
          routerLinkActive="bg-romantic-pink text-white"
          class="px-4 py-2 border border-romantic-pink rounded-md text-romantic-pink hover:bg-romantic-pink/20 transition-colors">
          Dreams
        </a>
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
export class AdminComponent {}
