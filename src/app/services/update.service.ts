import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UpdateService {
  private swUpdate = inject(SwUpdate);

  init(): void {
    if (!this.swUpdate.isEnabled) return;

    // When a new version is downloaded and ready, activate and reload
    this.swUpdate.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => {
        this.swUpdate.activateUpdate().then(() => location.reload());
      });

    // Check for update every time the app is foregrounded
    this.swUpdate.checkForUpdate();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.swUpdate.checkForUpdate();
    });
  }
}
