import { Routes } from '@angular/router';
import { rolesGuard } from '@guards/roles.guard';

export const routes: Routes = [
  {
    path: 'room/:id',
    loadComponent: () => import('./pages/room/room.component')
  },
  {
    path: 'fields',
    loadComponent: () => import('./pages/dynamic-fields/dynamic-fields.component')
  },
  {
    path: '**',
    redirectTo: 'not-found',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.component')
  },
  {
    path: '',
    loadComponent: () => import('@platform/platform.component'),
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
        loadComponent: () => import('@platform/pages/indicator/indicator.component')
      },
      {
        path: 'about-indicators',
        loadComponent: () => import('@platform/pages/about-indicators/about-indicators.component')
      },
      {
        path: 'home',
        loadComponent: () => import('@platform/pages/home/home.component')
      },
      {
        path: 'about',
        loadComponent: () => import('@platform/pages/about/about.component')
      },
      {
        path: 'notifications',
        loadComponent: () => import('@platform/pages/notifications/notifications.component')
      },
      {
        path: 'settings',
        loadComponent: () => import('@platform/pages/settings/settings.component')
      },
      {
        path: 'profile',
        loadComponent: () => import('@platform/pages/profile/profile.component')
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('@landing/landing.component'),
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
  }
];
