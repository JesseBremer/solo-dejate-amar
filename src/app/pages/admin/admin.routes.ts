import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin.component').then((m) => m.AdminComponent),
    children: [
      {
        path: '',
        redirectTo: 'config',
        pathMatch: 'full',
      },
      {
        path: 'config',
        loadComponent: () => import('./admin-config/admin-config.component').then((m) => m.AdminConfigComponent),
      },
      {
        path: 'songs',
        loadComponent: () => import('./admin-songs/admin-songs.component').then((m) => m.AdminSongsComponent),
      },
      {
        path: 'jar',
        loadComponent: () => import('./admin-jar/admin-jar.component').then((m) => m.AdminJarComponent),
      },
      {
        path: 'locations',
        loadComponent: () => import('./admin-locations/admin-locations.component').then((m) => m.AdminLocationsComponent),
      },
      {
        path: 'gallery',
        loadComponent: () => import('./admin-gallery/admin-gallery.component').then((m) => m.AdminGalleryComponent),
      },
      {
        path: 'dreams',
        loadComponent: () => import('./admin-dreams/admin-dreams.component').then((m) => m.AdminDreamsComponent),
      },
    ],
  },
];
