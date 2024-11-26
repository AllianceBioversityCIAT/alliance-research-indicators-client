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
        loadComponent: () => import('@platform/pages/about-indicators/about-indicators.component'),
        data: {
          title: 'About indicators'
        }
      },
      {
        path: 'load-results',
        loadComponent: () => import('@platform/pages/load-result/load-result.component')
      },
      {
        path: 'result/:id',
        loadComponent: () => import('@platform/pages/result/result.component'),
        children: [
          {
            path: '',
            redirectTo: 'general-information',
            pathMatch: 'full'
          },
          {
            path: 'general-information',
            loadComponent: () => import('@platform/pages/result/pages/general-information/general-information.component'),
            data: {
              title: 'General Information'
            }
          },
          {
            path: 'alliance-alignment',
            loadComponent: () => import('@platform/pages/result/pages/alliance-alignment/alliance-alignment.component'),
            data: {
              title: 'Alliance Alignment'
            }
          },
          {
            path: 'partners',
            loadComponent: () => import('@platform/pages/result/pages/partners/partners.component'),
            data: {
              title: 'Partners'
            }
          },
          {
            path: 'evidence',
            loadComponent: () => import('@platform/pages/result/pages/evidence/evidence.component'),
            data: {
              title: 'Evidence'
            }
          },
          {
            path: 'capacity-sharing',
            loadComponent: () => import('@platform/pages/result/pages/capacity-sharing/capacity-sharing.component'),
            data: {
              title: 'Capacity Sharing'
            }
          },
          {
            path: 'policy-change',
            loadComponent: () => import('@platform/pages/result/pages/policy-change/policy-change.component'),
            data: {
              title: 'Policy Change'
            }
          }
        ]
      },

      {
        path: 'home',
        loadComponent: () => import('@platform/pages/home/home.component')
      },
      {
        path: 'my-projects',
        loadComponent: () => import('@platform/pages/my-projects/my-projects.component'),
        data: {
          title: 'My Projects'
        }
      },
      {
        path: 'project-detail',
        loadComponent: () => import('@platform/pages/project-detail/project-detail.component'),
        data: {
          title: 'Project Detail'
        }
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
  },
  {
    path: '**',
    redirectTo: 'not-found',
    pathMatch: 'full'
  }
];
