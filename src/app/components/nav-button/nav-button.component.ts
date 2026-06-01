import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav-button',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a
      [routerLink]="route()"
      class="block w-full px-5 py-3 cursor-pointer bg-transparent border border-romantic-coral text-romantic-coral rounded-md transition-all duration-300 font-serif text-base text-center hover:bg-romantic-coral hover:text-white"
      [class.special-btn]="special()">
      {{ label() }}
    </a>
  `,
  styles: [`
    .special-btn {
      border-width: 2px;
      border-color: #ff69b4;
      background: rgba(255, 105, 180, 0.1);
      color: #ffebf0;
      font-weight: bold;
      animation: heartbeat 2s infinite;
    }
    .special-btn:hover {
      background: #ff69b4;
      color: white;
      box-shadow: 0 0 15px rgba(255, 105, 180, 0.6);
    }
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `]
})
export class NavButtonComponent {
  route = input.required<string>();
  label = input.required<string>();
  special = input<boolean>(false);
}
