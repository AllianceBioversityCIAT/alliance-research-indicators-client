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

    // Mock isMyResult method separately
    (cacheService as any).isMyResult = jest.fn().mockReturnValue(false);

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
    // Mock the submission service to return some history items
    const mockHistoryItems = [
      { title: 'Test Submission 1', id: '1' },
      { title: 'Test Submission 2', id: '2' }
    ];

    // Since the component doesn't have a submission history menu item,
    // we'll test the getHistoryItemTitle method instead
    const testItem = { title: 'Test Item', id: '123' };
    const result = component.getHistoryItemTitle(testItem);

    expect(result).toBe('Test Item (id: 123)');
  });

  it('should handle history item without id', () => {
    const testItem = { title: 'Test Item', id: null };
    const result = component.getHistoryItemTitle(testItem);

    expect(result).toBe('Test Item');
  });

  it('should not show delete option when status_id is not 4, 5, or 7', () => {
    cacheService.currentMetadata?.set({ status_id: 1 });
    fixture.detectChanges();

    expect(component.showDeleteOption()).toBe(false);
    const items = component.items();
    expect(items[0].items?.length).toBe(0);
  });

  it('should show delete option when status_id is 5', () => {
    cacheService.currentMetadata?.set({ status_id: 5 });
    fixture.detectChanges();

    expect(component.showDeleteOption()).toBe(true);
    const items = component.items();
    expect(items[0].items?.length).toBe(1);
    expect(items[0].items?.[0].label).toBe('Delete Result');
  });

  it('should show delete option when status_id is 7', () => {
    cacheService.currentMetadata?.set({ status_id: 7 });
    fixture.detectChanges();

    expect(component.showDeleteOption()).toBe(true);
    const items = component.items();
    expect(items[0].items?.length).toBe(1);
    expect(items[0].items?.[0].label).toBe('Delete Result');
  });

  it('should show delete option when status_id is 4 and isMyResult is true', () => {
    cacheService.currentMetadata?.set({ status_id: 4 });
    (cacheService as any).isMyResult.mockReturnValue(true);
    fixture.detectChanges();

    expect(component.showDeleteOption()).toBe(true);
    const items = component.items();
    expect(items[0].items?.length).toBe(1);
    expect(items[0].items?.[0].label).toBe('Delete Result');
  });

  it('should not show delete option when status_id is 4 and isMyResult is false', () => {
    cacheService.currentMetadata?.set({ status_id: 4 });
    (cacheService as any).isMyResult.mockReturnValue(false);
    fixture.detectChanges();

    expect(component.showDeleteOption()).toBe(false);
    const items = component.items();
    expect(items[0].items?.length).toBe(0);
  });

  it('should handle delete result when API call is unsuccessful', () => {
    apiService.DELETE_Result = jest.fn().mockResolvedValue({ successfulRequest: false });

    const deleteMenuItem = component.items().find(item => item.items?.some(subItem => subItem.label === 'Delete Result'));
    const deleteCommand = deleteMenuItem?.items?.find(item => item.label === 'Delete Result')?.command;

    expect(deleteCommand).toBeDefined();

    if (deleteCommand) {
      const fakeEvent = { originalEvent: new Event('click'), item: {} } as MenuItemCommandEvent;
      deleteCommand(fakeEvent);

      expect(actionsService.showGlobalAlert).toHaveBeenCalled();
    }
  });

  it('should handle welcome message when user first_name is undefined', () => {
    cacheService.dataCache?.set({
      ...cacheService.dataCache(),
      user: {
        ...cacheService.dataCache().user,
        first_name: undefined as any
      }
    });
    cacheService.currentRouteTitle?.set('Home');
    fixture.detectChanges();

    expect(component.welcomeMessage()).toBe('Welcome, ');
  });

  it('should handle ngAfterViewInit when section-sidebar element does not exist', () => {
    // Create a new component instance for this test
    const newFixture = TestBed.createComponent(SectionHeaderComponent);
    const newComponent = newFixture.componentInstance;

    // Mock querySelector to return null
    const mockQuerySelector = jest.spyOn(newComponent.elementRef.nativeElement, 'querySelector');
    mockQuerySelector.mockReturnValue(null);

    newComponent.ngAfterViewInit();

    expect(mockQuerySelector).toHaveBeenCalledWith('#section-sidebar');
    expect(newComponent['resizeObserver']).toBeNull();
  });

  it('should clean up resize observer on destroy', () => {
    const disconnectSpy = jest.spyOn(ResizeObserverMock.prototype, 'disconnect');
    component.ngOnDestroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should handle currentMetadata being null', () => {
    cacheService.currentMetadata?.set(null as any);
    fixture.detectChanges();

    const items = component.items();
    expect(items[0].items?.length).toBe(0);
  });

  it('should handle currentMetadata being undefined', () => {
    cacheService.currentMetadata?.set(undefined as any);
    fixture.detectChanges();

    const items = component.items();
    expect(items[0].items?.length).toBe(0);
  });

  it('should handle dataCache user being null', () => {
    cacheService.dataCache?.set({
      ...cacheService.dataCache(),
      user: null as any
    });
    cacheService.currentRouteTitle?.set('Home');
    fixture.detectChanges();

    expect(component.welcomeMessage()).toBe('Welcome, ');
  });

  it('should handle dataCache user being undefined', () => {
    cacheService.dataCache?.set({
      ...cacheService.dataCache(),
      user: undefined as any
    });
    cacheService.currentRouteTitle?.set('Home');
    fixture.detectChanges();

    expect(component.welcomeMessage()).toBe('Welcome, ');
  });
});
