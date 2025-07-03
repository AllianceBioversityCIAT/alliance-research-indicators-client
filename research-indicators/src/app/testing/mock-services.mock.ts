// src/app/testing/mock-services.ts
import { CacheService } from '@shared/services/cache/cache.service';
import { ActionsService } from '@shared/services/actions.service';
import { ApiService } from '@shared/services/api.service';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { SubmissionService } from '@shared/services/submission.service';
import { ActivatedRouteSnapshot, NavigationEnd, ParamMap } from '@angular/router';

let _routerEventsSubject = new Subject<NavigationEnd>();
export function resetRouterEventsSubject() {
  _routerEventsSubject = new Subject<NavigationEnd>();
}
export const routerEventsSubject = {
  get: () => _routerEventsSubject
};

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
  currentMetadata: jest.fn(() => ({ result_title: 'Test Title' })),
  currentResultId: signal(123),
  currentRouteTitle: jest.fn().mockReturnValue('Home'),
  showSectionHeaderActions: signal(false),
  isSidebarCollapsed: jest.fn().mockReturnValue(false),
  hasSmallScreen: jest.fn().mockReturnValue(false),
  toggleSidebar: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
  currentResultIsLoading: jest.fn().mockReturnValue(false)
} as unknown as CacheService;

const paramMapMock: ParamMap = {
  get: jest.fn().mockReturnValue(null),
  has: jest.fn().mockReturnValue(false),
  getAll: jest.fn().mockReturnValue([]),
  keys: []
};

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
    root: {} as Partial<ActivatedRouteSnapshot>,
    parent: null,
    firstChild: null,
    children: [],
    pathFromRoot: [],
    paramMap: paramMapMock,
    queryParamMap: paramMapMock
  } as Partial<ActivatedRouteSnapshot>
};

export const actionsServiceMock = {
  getActions: jest.fn(),
  getAction: jest.fn(),
  createAction: jest.fn(),
  updateAction: jest.fn(),
  deleteAction: jest.fn(),
  getInitials: jest.fn().mockReturnValue('JD')
} as unknown as ActionsService;

export const mockLatestResults = {
  status: 200,
  description: 'Success',
  timestamp: new Date().toISOString(),
  path: '/api/latest-results',
  successfulRequest: true,
  errorDetail: {
    errors: '',
    detail: '',
    description: ''
  },
  data: [
    {
      updated_at: new Date(),
      is_active: true,
      result_id: 1,
      result_official_code: 101,
      title: 'Test Result 1',
      description: null,
      indicator_id: 1,
      result_status: {
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_active: true,
        result_status_id: 1,
        name: 'Active',
        description: 'Active status'
      },
      result_contracts: {
        is_active: true,
        result_contract_id: 1,
        result_id: 1,
        contract_id: 'C001',
        contract_role_id: 1,
        is_primary: true,
        agresso_contract: {
          is_active: true,
          agreement_id: 'A001',
          contract_status: 'Active',
          description: 'Test Contract',
          division: null,
          donor: 'Test Donor',
          donor_reference: 'DR001',
          endDateGlobal: new Date(),
          endDatefinance: new Date(),
          end_date: new Date(),
          entity: 'Test Entity',
          extension_date: new Date(),
          funding_type: 'Test Funding',
          project: 'Test Project',
          projectDescription: 'Test Description',
          project_lead_description: 'Test Lead',
          short_title: 'Test Title',
          start_date: new Date(),
          ubwClientDescription: 'Test Client',
          unit: null,
          office: null
        }
      },
      indicator: {
        is_active: true,
        indicator_id: 1,
        name: 'Test Indicator',
        other_names: null,
        description: 'Test Description',
        long_description: 'Test Long Description',
        indicator_type_id: 1,
        icon_src: 'test-icon'
      }
    },
    {
      updated_at: new Date(),
      is_active: true,
      result_id: 2,
      result_official_code: 102,
      title: 'Test Result 2',
      description: null,
      indicator_id: 1,
      result_status: {
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_active: true,
        result_status_id: 1,
        name: 'Active',
        description: 'Active status'
      },
      result_contracts: {
        is_active: true,
        result_contract_id: 2,
        result_id: 2,
        contract_id: 'C002',
        contract_role_id: 1,
        is_primary: true,
        agresso_contract: {
          is_active: true,
          agreement_id: 'A002',
          contract_status: 'Active',
          description: 'Test Contract 2',
          division: null,
          donor: 'Test Donor 2',
          donor_reference: 'DR002',
          endDateGlobal: new Date(),
          endDatefinance: new Date(),
          end_date: new Date(),
          entity: 'Test Entity 2',
          extension_date: new Date(),
          funding_type: 'Test Funding 2',
          project: 'Test Project 2',
          projectDescription: 'Test Description 2',
          project_lead_description: 'Test Lead 2',
          short_title: 'Test Title 2',
          start_date: new Date(),
          ubwClientDescription: 'Test Client 2',
          unit: null,
          office: null
        }
      },
      indicator: {
        is_active: true,
        indicator_id: 1,
        name: 'Test Indicator',
        other_names: null,
        description: 'Test Description',
        long_description: 'Test Long Description',
        indicator_type_id: 1,
        icon_src: 'test-icon'
      }
    }
  ]
};

export const mockGreenChecks = {
  status: 200,
  description: 'Success',
  timestamp: new Date().toISOString(),
  path: '/api/green-checks',
  successfulRequest: true,
  errorDetail: {
    errors: '',
    detail: '',
    description: ''
  },
  data: {
    general_information: 1,
    alignment: 1,
    cap_sharing_ip: 1,
    policy_change: 0,
    partners: 1,
    geo_location: 1,
    evidences: 0
  }
};

export const apiServiceMock = {
  GET_LatestResults: jest.fn().mockImplementation(() => Promise.resolve(mockLatestResults)),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  GET_GreenChecks: jest.fn().mockImplementation((_resultCode: number) => Promise.resolve(mockGreenChecks)),
  GET_InstitutionsTypesChildless: jest.fn().mockImplementation(() => Promise.resolve({ data: [] })),
  GET_Countries: jest.fn().mockImplementation(() => Promise.resolve({ data: [] })),
  GET_IndicatorTypes: jest.fn().mockImplementation(() => Promise.resolve({ data: [] })),
  GET_Years: jest.fn().mockImplementation(() => Promise.resolve({ data: [] })),
  GET_Contracts: jest.fn().mockImplementation(() => Promise.resolve({ data: [] })),
  GET_Results: jest.fn().mockImplementation(() => Promise.resolve({ data: [] })),
  GET_IpOwners: jest.fn().mockResolvedValue({ data: [] })
} as unknown as jest.Mocked<ApiService>;

export const httpClientMock = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn()
} as unknown as HttpClient;

export const routerMock = {
  events: routerEventsSubject.get().asObservable(),
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

export const mockResultsStatus = {
  data: [
    { name: 'Status 1', amount_results: 5, result_status_id: 1 },
    { name: 'Status 2', amount_results: 3, result_status_id: 2 },
    { name: 'Status 3', amount_results: 0, result_status_id: 3 }
  ]
};

export const mockIndicatorsResults = {
  data: [
    {
      indicator_id: 1,
      name: 'Indicator 1',
      amount_results: 2,
      icon_src: 'science'
    },
    {
      indicator_id: 2,
      name: 'Indicator 2',
      amount_results: 0,
      icon_src: 'analytics'
    }
  ]
};

export const getMetadataServiceMock = {
  update: jest.fn(),
  formatText: jest.fn(() => ''),
  clearMetadata: jest.fn()
};
