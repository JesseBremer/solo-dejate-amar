import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="flex flex-col items-center justify-center min-h-screen p-5 box-border">
      <router-outlet />
    </main>
  `
})
export class App {}
