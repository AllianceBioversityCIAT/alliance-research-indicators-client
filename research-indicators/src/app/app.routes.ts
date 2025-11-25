import { Routes } from '@angular/router';
import { rolesGuard } from '@guards/roles.guard';
import { resultExistsResolver } from '@pages/platform/pages/result/resolvers/result-exists.resolver';

const createResultData = () => ({
  title: 'Result Information'
});

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
    path: 'login',
    loadComponent: () => import('./pages/login/login.component')
  },

  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.component')
  },
  {
    path: 'cache-test',
    loadComponent: () => import('./pages/cache-test/cache-test.component')
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
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'indicator/:id',
        loadComponent: () => import('@platform/pages/indicator/indicator.component'),
        data: {
          title: 'Indicator'
        }
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
        resolve: {
          resultExists: resultExistsResolver
        },
        data: {
          showSectionHeaderActions: true
        },
        children: [
          {
            path: '',
            redirectTo: 'general-information',
            pathMatch: 'full'
          },
          {
            path: 'general-information',
            loadComponent: () => import('@platform/pages/result/pages/general-information/general-information.component'),
            data: createResultData()
          },
          {
            path: 'links-to-result',
            loadComponent: () => import('@platform/pages/result/pages/links-to-result/links-to-result.component'),
            data: createResultData()
          },
          {
            path: 'alliance-alignment',
            loadComponent: () => import('@platform/pages/result/pages/alliance-alignment/alliance-alignment.component'),
            data: createResultData()
          },
          {
            path: 'partners',
            loadComponent: () => import('@platform/pages/result/pages/partners/partners.component'),
            data: createResultData()
          },
          {
            path: 'evidence',
            loadComponent: () => import('@platform/pages/result/pages/evidence/evidence.component'),
            data: createResultData()
          },
          {
            path: 'oicr-details',
            loadComponent: () => import('@platform/pages/result/pages/oicr-details/oicr-details.component'),
            data: createResultData()
          },
          {
            path: 'ip-rights',
            loadComponent: () => import('@platform/pages/result/pages/ip-rights/ip-rights.component'),
            data: createResultData()
          },
          {
            path: 'capacity-sharing',
            loadComponent: () => import('@platform/pages/result/pages/capacity-sharing/capacity-sharing.component'),
            data: createResultData()
          },
          {
            path: 'policy-change',
            loadComponent: () => import('@platform/pages/result/pages/policy-change/policy-change.component'),
            data: createResultData()
          },
          {
            path: 'innovation-details',
            loadComponent: () => import('@platform/pages/result/pages/innovation-details/innovation-details.component'),
            data: createResultData()
          },
          {
            path: 'geographic-scope',
            loadComponent: () => import('@platform/pages/result/pages/geographic-scope/geographic-scope.component'),
            data: createResultData()
          }
        ]
      },

      {
        path: 'home',
        loadComponent: () => import('@platform/pages/home/home.component'),
        data: {
          title: 'Home'
        }
      },
      {
        path: 'projects',
        loadComponent: () => import('@platform/pages/my-projects/my-projects.component'),
        data: {
          title: 'Projects',
          hideBackButton: true
        }
      },
      {
        path: 'results-center',
        loadComponent: () => import('@pages/platform/pages/results-center/results-center.component'),
        data: {
          title: 'Results Center'
        }
      },
      {
        path: 'search-a-result',
        loadComponent: () => import('./pages/platform/pages/search-a-result/search-a-result.component'),
        data: {
          title: 'Results List'
        }
      },
      {
        path: 'project-detail/:id',
        loadComponent: () => import('@platform/pages/project-detail/project-detail.component'),
        data: {
          title: 'Project Detail'
        }
      },
      {
        path: 'about',
        loadComponent: () => import('@platform/pages/about/about.component'),
        data: {
          title: 'About'
        }
      },
      {
        path: 'notifications',
        loadComponent: () => import('@platform/pages/notifications/notifications.component'),
        data: {
          title: 'Notifications'
        }
      },
      {
        path: 'dashboard',
        loadComponent: () => import('@pages/platform/pages/dashboard/dashboard.component'),
        data: {
          title: 'Results Dashboard'
        }
      },
      {
        path: 'profile',
        loadComponent: () => import('@platform/pages/profile/profile.component'),
        data: {
          title: 'Profile'
        }
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
