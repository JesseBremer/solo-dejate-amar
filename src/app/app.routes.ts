import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'unlock',
    loadComponent: () => import('./pages/unlock/unlock.component').then((m) => m.UnlockComponent),
  },
  {
    path: 'gallery',
    loadComponent: () => import('./pages/gallery/gallery.component').then((m) => m.GalleryComponent),
  },
  {
    path: 'songs',
    loadComponent: () => import('./pages/songs/songs.component').then((m) => m.SongsComponent),
  },
  {
    path: 'journal',
    loadComponent: () => import('./pages/journal/journal.component').then((m) => m.JournalComponent),
  },
  {
    path: 'story',
    redirectTo: 'journal',
  },
  {
    path: 'jar',
    loadComponent: () => import('./pages/jar/jar.component').then((m) => m.JarComponent),
  },
  {
    path: 'map',
    loadComponent: () => import('./pages/map/map.component').then((m) => m.MapComponent),
  },
  {
    path: 'dreams',
    loadComponent: () => import('./pages/dreams/dreams.component').then((m) => m.DreamsComponent),
  },
  {
    path: 'vault',
    loadComponent: () => import('./pages/vault/vault.component').then((m) => m.VaultComponent),
  },
  {
    path: 'ideas',
    loadComponent: () => import('./pages/ideas/ideas.component').then((m) => m.IdeasComponent),
  },
  {
    path: 'timeline',
    loadComponent: () => import('./pages/timeline/timeline.component').then((m) => m.TimelineComponent),
  },
  {
    path: 'dictionary',
    loadComponent: () => import('./pages/dictionary/dictionary.component').then((m) => m.DictionaryComponent),
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then((m) => m.adminRoutes),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
