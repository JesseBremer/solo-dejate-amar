import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Router, NavigationError } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UpdateService {
  private swUpdate = inject(SwUpdate);
  private router = inject(Router);

  // A new version is downloaded and ready — apply it at the next safe moment.
  private updateReady = false;

  init(): void {
    this.installChunkErrorRecovery();

    if (!this.swUpdate.isEnabled) return;

    // New version downloaded → activate it, then apply at a safe moment (see below)
    // so we never reload in the middle of her writing something.
    this.swUpdate.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => {
        this.swUpdate.activateUpdate().then(() => {
          this.updateReady = true;
          // Don't reload now (she may be mid-writing); applied on her next
          // page change or when she returns to the app — see below.
        });
      });

    // Cache is corrupt / can't be recovered — wipe and reload from the network.
    this.swUpdate.unrecoverable.subscribe(() => this.hardRecover());

    // Check for updates on load, periodically, and whenever she returns to the app.
    // A fresh (cold) open already serves the latest version automatically; this refreshes
    // an already-open tab the next time she opens it from the background.
    this.swUpdate.checkForUpdate();
    setInterval(() => this.swUpdate.checkForUpdate(), 15 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.swUpdate.checkForUpdate();
        if (this.updateReady) location.reload();
      }
    });
  }

  // iOS Safari aggressively evicts service-worker caches. When a lazily-loaded page's
  // chunk has been evicted AND the old hashed file no longer exists on the server (after a
  // redeploy), the navigation fails and the page renders blank — e.g. an "add" button never
  // appears. Detect that and self-heal so she never gets stuck on a half-loaded page.
  private installChunkErrorRecovery(): void {
    const isChunkError = (msg: string): boolean =>
      /ChunkLoadError|Loading chunk \d|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(msg);

    const recover = (): void => {
      const KEY = '__sda_chunk_recover';
      const attempts = Number(sessionStorage.getItem(KEY) || 0);
      if (attempts >= 2) return; // give up after 2 tries this session to avoid reload loops
      sessionStorage.setItem(KEY, String(attempts + 1));

      if (attempts === 0) {
        // First try: pull the freshest version, then reload.
        const reload = () => location.reload();
        (this.swUpdate.isEnabled ? this.swUpdate.checkForUpdate().catch(() => {}) : Promise.resolve())
          .then(reload, reload);
      } else {
        // Still failing: wipe caches + the worker so the next load comes straight from network.
        this.hardRecover();
      }
    };

    // The main path: the router reports a failed lazy route load as a NavigationError.
    this.router.events
      .pipe(filter((e): e is NavigationError => e instanceof NavigationError))
      .subscribe((e) => {
        const err: any = e.error;
        if (isChunkError(String(err?.message ?? err ?? ''))) recover();
      });

    // Belt and suspenders: any other failed dynamic import surfaces here.
    window.addEventListener('error', (e) => {
      if (isChunkError(String(e?.message ?? ''))) recover();
    });
    window.addEventListener('unhandledrejection', (e) => {
      const r: any = (e as PromiseRejectionEvent).reason;
      if (isChunkError(String(r?.message ?? r ?? ''))) recover();
    });
  }

  private async hardRecover(): Promise<void> {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
      await Promise.all(regs.map((r) => r.unregister()));
    } catch {
      // ignore — reload anyway
    }
    location.reload();
  }
}
