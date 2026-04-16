import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllianceSidebarComponent } from './alliance-sidebar.component';
import { AdministrationNavGroup } from '@interfaces/administration-nav.interface';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CacheService } from '@services/cache/cache.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { RolesService } from '@services/cache/roles.service';
import { ActionsService } from '@services/actions.service';
import { fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

describe('AllianceSidebarComponent', () => {
  let component: AllianceSidebarComponent;
  let fixture: ComponentFixture<AllianceSidebarComponent>;

  beforeEach(async () => {
    const mockCacheService = {
      hasSmallScreen: jest.fn().mockReturnValue(false),
      isSidebarCollapsed: jest.fn().mockReturnValue(false),
      toggleSidebar: jest.fn()
    } as unknown as CacheService;
    const mockAllModalsService = {
      openModal: jest.fn()
    } as unknown as AllModalsService;
    const mockRolesService = {
      canAccessCapacityBulkUpload: jest.fn().mockReturnValue(false)
    } as unknown as RolesService;
    const mockActionsService = {
      logOut: jest.fn()
    } as unknown as ActionsService;
    await TestBed.configureTestingModule({
      imports: [AllianceSidebarComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() },
            params: of({})
          }
        },
        { provide: CacheService, useValue: mockCacheService },
        { provide: AllModalsService, useValue: mockAllModalsService },
        { provide: RolesService, useValue: mockRolesService },
        { provide: ActionsService, useValue: mockActionsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AllianceSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set innerWidth and collapse sidebar on small screen when not collapsed', () => {
    const cache = TestBed.inject(CacheService) as any;
    cache.hasSmallScreen.mockReturnValue(true);
    cache.isSidebarCollapsed.mockReturnValue(false);
    component.ngOnInit();
    expect(component.innerWidth).toBe(window.innerWidth);
    expect(cache.toggleSidebar).toHaveBeenCalled();
  });

  it('should not collapse sidebar if already collapsed', () => {
    const cache = TestBed.inject(CacheService) as any;
    cache.hasSmallScreen.mockReturnValue(true);
    cache.isSidebarCollapsed.mockReturnValue(true);
    (cache.toggleSidebar as jest.Mock).mockClear();
    component.ngOnInit();
    expect(cache.toggleSidebar).not.toHaveBeenCalled();
  });

  it('should not toggle on large screen when hasSmallScreen is false', () => {
    const cache = TestBed.inject(CacheService) as any;
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { value: 1600, configurable: true });
    cache.hasSmallScreen.mockReturnValue(false);
    cache.isSidebarCollapsed.mockReturnValue(false);
    (cache.toggleSidebar as jest.Mock).mockClear();
    component.ngOnInit();
    expect(cache.toggleSidebar).not.toHaveBeenCalled();
    Object.defineProperty(window, 'innerWidth', { value: originalWidth, configurable: true });
  });

  it('should open ask for help modal via account options action', () => {
    const modals = TestBed.inject(AllModalsService) as any;
    const action = component.accountOptions.find(o => !!o.action && o.label === 'Ask for Help')!.action as Function;
    action();
    expect(modals.openModal).toHaveBeenCalledWith('askForHelp');
  });

  it('should toggle sidebar and dispatch resize on toggleSidebarAndResize', fakeAsync(() => {
    const cache = TestBed.inject(CacheService) as any;
    const dispatchSpy = jest.spyOn(globalThis, 'dispatchEvent');
    component.toggleSidebarAndResize();
    expect(cache.toggleSidebar).toHaveBeenCalled();
    tick(150);
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
    dispatchSpy.mockRestore();
  }));

  it('should call logOut when log out account action runs', () => {
    const actions = TestBed.inject(ActionsService) as any;
    const logOutOption = component.accountOptions.find(o => o.logout);
    expect(logOutOption).toBeDefined();
    (logOutOption!.action as () => void)();
    expect(actions.logOut).toHaveBeenCalled();
  });

  it('should toggle administration group expansion state', () => {
    expect(component.isAdministrationGroupExpanded('center-admin')).toBe(true);
    component.toggleAdministrationGroup('center-admin');
    expect(component.isAdministrationGroupExpanded('center-admin')).toBe(false);
    component.toggleAdministrationGroup('center-admin');
    expect(component.isAdministrationGroupExpanded('center-admin')).toBe(true);
  });

  it('should treat unknown group id as expanded until toggled', () => {
    expect(component.isAdministrationGroupExpanded('unknown-id')).toBe(true);
    component.toggleAdministrationGroup('unknown-id');
    expect(component.isAdministrationGroupExpanded('unknown-id')).toBe(false);
  });

  it('should filter hidden children in visibleAdministrationChildren', () => {
    const group: AdministrationNavGroup = {
      id: 'g',
      label: 'G',
      icon: 'pi-test',
      children: [
        { label: 'Hidden', link: '/h', icon: 'pi-x', hide: true },
        { label: 'Visible', link: '/v', icon: 'pi-check' }
      ]
    };
    const visible = component.visibleAdministrationChildren(group);
    expect(visible).toHaveLength(1);
    expect(visible[0].label).toBe('Visible');
  });
});
