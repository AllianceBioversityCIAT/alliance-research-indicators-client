import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VersionSelectorComponent } from './version-selector.component';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { signal } from '@angular/core';

describe('VersionSelectorComponent', () => {
  let component: VersionSelectorComponent;
  let fixture: ComponentFixture<VersionSelectorComponent>;

  // Mocks
  let apiMock: Partial<ApiService>;
  let routerMock: Partial<Router>;
  let routeMock: Partial<ActivatedRoute>;
  let routerEventsSubject: Subject<any>;
  let cacheService: Partial<CacheService>;

  beforeEach(waitForAsync(() => {
    routerEventsSubject = new Subject();

    apiMock = {
      GET_Versions: jest.fn().mockResolvedValue({
        data: {
          live: [],
          versions: []
        }
      })
    };

    cacheService = {
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
      currentResultId: signal(123)
    };

    routerMock = {
      events: routerEventsSubject.asObservable(),
      navigate: jest.fn().mockResolvedValue(true)
    };

    routeMock = {
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

    TestBed.configureTestingModule({
      imports: [VersionSelectorComponent],
      providers: [
        { provide: ApiService, useValue: apiMock },
        { provide: CacheService, useValue: cacheService },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadVersions on navigation end event', () => {
    const spyLoadVersions = jest.spyOn(component as any, 'loadVersions').mockImplementation(() => Promise.resolve());

    routerEventsSubject.next(new NavigationEnd(1, '/result/ABC123', '/result/ABC123'));

    expect(spyLoadVersions).toHaveBeenCalled();
  });

  it('should set selectedResultId if version query param matches', async () => {
    (routeMock.snapshot?.queryParamMap.get as jest.Mock).mockReturnValue('2024');

    const mockResponse = {
      data: {
        live: [{ result_id: 10, result_status_id: 1 }],
        versions: [
          { result_id: 1, report_year_id: '2023', result_status_id: 1 },
          { result_id: 2, report_year_id: '2024', result_status_id: 1 }
        ]
      }
    };
    (apiMock.GET_Versions as jest.Mock).mockResolvedValue(mockResponse);

    await (component as any).loadVersions();

    expect(component.selectedResultId()).toBe(2);
  });

  it('should select live version if no version param and live version exists', async () => {
    (routeMock.snapshot?.queryParamMap.get as jest.Mock).mockReturnValue(null);

    const mockResponse = {
      data: {
        live: [{ result_id: 10, result_status_id: 1 }],
        versions: [{ result_id: 1, report_year_id: '2023', result_status_id: 1 }]
      }
    };
    (apiMock.GET_Versions as jest.Mock).mockResolvedValue(mockResponse);

    await (component as any).loadVersions();

    expect(component.selectedResultId()).toBe(10);
  });

  it('should select first approved version and navigate if no version param and no live version', async () => {
    (routeMock.snapshot?.queryParamMap.get as jest.Mock).mockReturnValue(null);

    const mockResponse = {
      data: {
        live: [],
        versions: [
          { result_id: 1, report_year_id: '2023', result_status_id: 1 },
          { result_id: 2, report_year_id: '2024', result_status_id: 1 }
        ]
      }
    };
    (apiMock.GET_Versions as jest.Mock).mockResolvedValue(mockResponse);

    await (component as any).loadVersions();

    expect(component.selectedResultId()).toBe(1);
    expect(routerMock.navigate).toHaveBeenCalledWith([], {
      relativeTo: routeMock,
      queryParams: { version: '2023' },
      queryParamsHandling: '',
      replaceUrl: true
    });
  });

  it('should select version on selectVersion call and navigate with query param', () => {
    const version = { result_id: 5, report_year_id: 2025, result_status_id: 1, result_official_code: 12345 };
    component.selectVersion(version);

    expect(component.selectedResultId()).toBe(5);
    expect(routerMock.navigate).toHaveBeenCalledWith([], {
      relativeTo: routeMock,
      queryParams: { version: '2025' },
      queryParamsHandling: '',
      replaceUrl: true
    });
  });

  it('should clear query param if live version selected on selectVersion', () => {
    const liveVersion = { result_id: 7, report_year_id: 2027, result_status_id: 1, result_official_code: 123 };
    component['liveVersion'].set(liveVersion);
    component.selectVersion(liveVersion);

    expect(component.selectedResultId()).toBe(7);
    expect(routerMock.navigate).toHaveBeenCalledWith([], {
      relativeTo: routeMock,
      queryParams: {},
      queryParamsHandling: '',
      replaceUrl: true
    });
  });

  it('should handle loadVersions with no data', async () => {
    (apiMock.GET_Versions as jest.Mock).mockResolvedValue({ data: { live: [], versions: [] } });

    await (component as any).loadVersions();

    expect(component.liveVersion()).toBeNull();
    expect(component.approvedVersions()).toEqual([]);
  });

  it('should set hasLiveVersion true only if liveVersion exists and status_id !== 6', () => {
    component['liveVersion'].set({ result_id: 1, result_status_id: 1 } as any);
    expect(component.hasLiveVersion).toBe(true);
    component['liveVersion'].set({ result_id: 1, result_status_id: 6 } as any);
    expect(component.hasLiveVersion).toBe(false);
    component['liveVersion'].set(null);
    expect(component.hasLiveVersion).toBe(false);
  });
});
