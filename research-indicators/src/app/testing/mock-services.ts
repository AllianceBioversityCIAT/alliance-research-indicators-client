// src/app/testing/mock-services.ts
import { CacheService } from '@shared/services/cache/cache.service';
import { ActionsService } from '@shared/services/actions.service';
import { ApiService } from '@shared/services/api.service';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { SubmissionService } from '@shared/services/submission.service';

export const routerEventsSubject = new Subject<any>();

export const cacheServiceMock = {
  windowHeight: signal(0),
  dataCache: signal({
    access_token: 'dummy_token',
    refresh_token: 'dummy_refresh_token',
    user: {
      sec_user_id: 1,
      is_active: true,
      first_name: 'John',
      last_name: 'Doe',
      roleName: 'Admin',
      email: 'john.doe@example.com',
      status_id: 1,
      user_role_list: [
        {
          is_active: true,
          user_id: 1,
          role_id: 1,
          role: {
            is_active: true,
            justification_update: null,
            sec_role_id: 1,
            name: 'Admin',
            focus_id: 0
          }
        }
      ]
    },
    exp: 3600
  }),
  isLoggedIn: signal<boolean>(false),
  currentMetadata: signal({
    status_id: 5
  }),
  currentResultId: signal(123),
  currentRouteTitle: jest.fn().mockReturnValue('Home'),
  showSectionHeaderActions: signal(false),
  isSidebarCollapsed: jest.fn().mockReturnValue(false),
  hasSmallScreen: jest.fn().mockReturnValue(false),
  toggleSidebar: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn()
} as unknown as CacheService;

export const routeMock = {
  snapshot: {
    url: [],
    params: {},
    queryParams: {},
    fragment: null,
    data: {},
    outlet: '',
    component: null,
    routeConfig: null,
    root: {} as any,
    parent: null,
    firstChild: null,
    children: [],
    pathFromRoot: [],
    paramMap: {} as any,
    queryParamMap: {
      get: jest.fn().mockReturnValue(null),
      has: jest.fn().mockReturnValue(false),
      getAll: jest.fn().mockReturnValue([]),
      keys: []
    }
  } as any
};

export const actionsServiceMock = {
  getActions: jest.fn(),
  getAction: jest.fn(),
  createAction: jest.fn(),
  updateAction: jest.fn(),
  deleteAction: jest.fn(),
  getInitials: jest.fn().mockReturnValue('JD')
} as unknown as ActionsService;

export const apiServiceMock = new Proxy(
  {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn()
  },
  {
    get(target, prop) {
      if (typeof prop === 'string' && prop.startsWith('GET_')) {
        return jest.fn().mockResolvedValue({ data: [] });
      }
      return (target as any)[prop];
    }
  }
) as unknown as ApiService;

export const httpClientMock = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn()
} as unknown as HttpClient;

export const routerMock = {
  events: routerEventsSubject.asObservable(),
  navigate: jest.fn().mockResolvedValue(true),
  createUrlTree: jest.fn().mockReturnValue({}),
  serializeUrl: jest.fn().mockReturnValue('')
};

export const submissionServiceMock = {
  statusSelected: signal(null),
  comment: signal(''),
  getSubmissionHistory: jest.fn(),
  setStatus: jest.fn(),
  setComment: jest.fn(),
  submit: jest.fn()
} as unknown as SubmissionService;
