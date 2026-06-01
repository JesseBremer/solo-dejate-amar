import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER, inject, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { ConfigService } from './services/config.service';
import { UpdateService } from './services/update.service';

function initializeApp(): () => Promise<void> {
  const configService = inject(ConfigService);
  const updateService = inject(UpdateService);
  return () => {
    updateService.init();
    return configService.load();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
    },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
