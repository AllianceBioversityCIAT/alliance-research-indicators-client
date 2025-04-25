import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionHeaderComponent } from './section-header.component';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { of } from 'rxjs';
import { CacheService } from '@services/cache/cache.service';
import { signal } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionsService } from '@shared/services/actions.service';
import { ApiService } from '@shared/services/api.service';
import { MenuItemCommandEvent } from 'primeng/api';

// Mock ResizeObserver
class ResizeObserverMock {
  observe(target: Element) {
    // Mock implementation
    console.log('Mock observe called on:', target);
  }
  unobserve(target: Element) {
    // Mock implementation
    console.log('Mock unobserve called on:', target);
  }
  disconnect() {
    // Mock implementation
    console.log('Mock disconnect called');
  }
}

global.ResizeObserver = ResizeObserverMock;

describe('SectionHeaderComponent', () => {
  let component: SectionHeaderComponent;
  let fixture: ComponentFixture<SectionHeaderComponent>;
  let routerSpy: Partial<Router>;
  let cacheService: Partial<CacheService>;
  let actionsService: Partial<ActionsService>;
  let apiService: Partial<ApiService>;

  beforeEach(async () => {
    routerSpy = {
      url: '/test',
      events: of(new NavigationEnd(1, '/test', '/test')),
      navigate: jest.fn()
    };

    cacheService = {
      dataCache: signal({
        user: {
          first_name: 'Test User',
          last_name: 'User',
          is_active: true,
          sec_user_id: 1,
          roleName: 'Admin',
          email: 'testuser@example.com',
          status_id: 1,
          user_role_list: [
            {
              roleName: 'Admin',
              roleId: 1,
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
        access_token: 'dummy_access_token',
        refresh_token: 'dummy_refresh_token',
        exp: 0,
        isLoggedIn: signal<boolean>(false)
      }),
      headerHeight: signal<number>(0),
      navbarHeight: signal<number>(0),
      hasSmallScreen: signal<boolean>(true),
      isLoggedIn: signal<boolean>(false),
      currentUrlPath: signal<string>('/test'),
      showSubmissionHistory: signal<boolean>(false),
      currentRouteTitle: signal<string>('Test Title'),
      showSectionHeaderActions: signal<boolean>(true),
      currentResultId: signal<number>(123),
      currentMetadata: signal({
        status_id: 5
      }),
      isSidebarCollapsed: signal<boolean>(false)
    };

    actionsService = {
      validateToken: jest.fn(),
      logOut: jest.fn(),
      showGlobalAlert: jest.fn()
    };

    apiService = {
      DELETE_Result: jest.fn().mockResolvedValue({ successfulRequest: true })
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, SectionHeaderComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            firstChild: null,
            snapshot: {
              paramMap: new Map(),
              data: { title: 'Test Title' },
              url: [],
              params: {}
            },
            params: of({})
          }
        },
        {
          provide: Router,
          useValue: routerSpy
        },
        {
          provide: CacheService,
          useValue: cacheService
        },
        {
          provide: ActionsService,
          useValue: actionsService
        },
        {
          provide: ApiService,
          useValue: apiService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show welcome message when route is Home', () => {
    cacheService.currentRouteTitle?.set('Home');
    fixture.detectChanges();
    expect(component.welcomeMessage()).toBe('Welcome, Test User');
  });

  it('should show current route title when not on Home', () => {
    cacheService.currentRouteTitle?.set('Test Route');
    fixture.detectChanges();
    expect(component.welcomeMessage()).toBe('Test Route');
  });

  it('should handle delete result action', () => {
    const deleteMenuItem = component.items().find(item => item.items?.some(subItem => subItem.label === 'Delete Result'));
    const deleteCommand = deleteMenuItem?.items?.find(item => item.label === 'Delete Result')?.command;

    expect(deleteCommand).toBeDefined();

    if (deleteCommand) {
      const fakeEvent = { originalEvent: new Event('click'), item: {} } as MenuItemCommandEvent;

      deleteCommand(fakeEvent);

      expect(actionsService.showGlobalAlert).toHaveBeenCalled();
    }
  });

  it('should handle submission history action', () => {
    const historyMenuItem = component.items().find(item => item.items?.some(subItem => subItem.label === 'Submission History'));
    const historyCommand = historyMenuItem?.items?.find(item => item.label === 'Submission History')?.command;

    expect(historyCommand).toBeDefined();

    if (historyCommand) {
      const fakeEvent = { originalEvent: new Event('click'), item: {} } as MenuItemCommandEvent;
      historyCommand(fakeEvent);

      expect(cacheService.showSubmissionHistory?.()).toBe(true);
    }
  });

  it('should clean up resize observer on destroy', () => {
    const disconnectSpy = jest.spyOn(ResizeObserverMock.prototype, 'disconnect');
    component.ngOnDestroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
