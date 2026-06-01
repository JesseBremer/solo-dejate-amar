import { Component, computed, inject } from '@angular/core';
import { SpicyMeterComponent } from '../../components/spicy-meter/spicy-meter.component';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-spicy',
  standalone: true,
  imports: [SpicyMeterComponent],
  template: `
    <div class="w-full px-4 pt-12 pb-6 flex flex-col items-center max-w-[600px] mx-auto">
      <app-spicy-meter [score]="spicyScore()" class="w-full" />
    </div>
  `,
})
export class SpicyComponent {
  private configService = inject(ConfigService);
  spicyScore = computed(() => this.configService.config()?.spicy_score ?? 5);
}
