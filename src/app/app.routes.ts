import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'unlock',
    loadComponent: () => import('./pages/unlock/unlock.component').then(m => m.UnlockComponent)
  },
  {
    path: 'gallery',
    loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent)
  },
  {
    path: 'songs',
    loadComponent: () => import('./pages/songs/songs.component').then(m => m.SongsComponent)
  },
  {
    path: 'story',
    loadComponent: () => import('./pages/story/story.component').then(m => m.StoryComponent)
  },
  {
    path: 'jar',
    loadComponent: () => import('./pages/jar/jar.component').then(m => m.JarComponent)
  },
  {
    path: 'map',
    loadComponent: () => import('./pages/map/map.component').then(m => m.MapComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
