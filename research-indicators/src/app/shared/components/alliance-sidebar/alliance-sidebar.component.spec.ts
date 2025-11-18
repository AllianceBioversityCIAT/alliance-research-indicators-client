import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllianceSidebarComponent } from './alliance-sidebar.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CacheService } from '@services/cache/cache.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { fakeAsync, tick } from '@angular/core/testing';

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
    await TestBed.configureTestingModule({
      imports: [AllianceSidebarComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() },
            params: of({})
          }
        },
        { provide: CacheService, useValue: mockCacheService },
        { provide: AllModalsService, useValue: mockAllModalsService }
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

  it('should open ask for help modal via options action', () => {
    const modals = TestBed.inject(AllModalsService) as any;
    const action = component.options.find(o => !!o.action)!.action as Function;
    action();
    expect(modals.openModal).toHaveBeenCalledWith('askForHelp');
  });

  it('should toggle sidebar and dispatch resize on toggleSidebarAndResize', fakeAsync(() => {
    const cache = TestBed.inject(CacheService) as any;
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    component.toggleSidebarAndResize();
    expect(cache.toggleSidebar).toHaveBeenCalled();
    tick(150);
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
    dispatchSpy.mockRestore();
  }));
});
