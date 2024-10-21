import { Routes } from '@angular/router';
import { rolesGuard } from './shared/guards/roles.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/platform/platform.component'),
    canMatch: [rolesGuard],
    data: {
      isLoggedIn: true
    },
    children: [
      {
        path: '',
        redirectTo: 'about-indicators',
        pathMatch: 'full'
      },
      {
        path: 'indicator/:id',
        loadComponent: () => import('./pages/platform/pages/indicator/indicator.component')
      },
      {
        path: 'about-indicators',
        loadComponent: () => import('./pages/platform/pages/about-indicators/about-indicators.component')
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/platform/pages/home/home.component')
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/platform/pages/about/about.component')
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/platform/pages/notifications/notifications.component')
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/platform/pages/settings/settings.component')
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/platform/pages/profile/profile.component')
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component'),
    canMatch: [rolesGuard],
    data: {
      isLoggedIn: false
    },
    children: [
      {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'room/:id',
    loadComponent: () => import('./pages/room/room.component')
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/platform/platform.component')
  },
  {
    path: 'fields',
    loadComponent: () => import('./pages/dynamic-fields/dynamic-fields.component')
  },
  {
    path: '**',
    redirectTo: 'not-found',
    pathMatch: 'full'
  }
];
