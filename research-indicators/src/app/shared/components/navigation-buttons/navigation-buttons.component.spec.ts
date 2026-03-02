import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CacheService } from '@shared/services/cache/cache.service';
import { SubmissionService } from '@shared/services/submission.service';
import { NavigationButtonsComponent } from './navigation-buttons.component';

describe('NavigationButtonsComponent', () => {
  let component: NavigationButtonsComponent;
  let fixture: ComponentFixture<NavigationButtonsComponent>;
  let hasSmallScreenSignal: ReturnType<typeof signal<boolean>>;
  let isSidebarCollapsedSignal: ReturnType<typeof signal<boolean>>;

  const RESULT_SIDEBAR_WIDTH = 322;
  const CONTENT_RIGHT_OFFSET = 12;

  beforeEach(async () => {
    hasSmallScreenSignal = signal(false);
    isSidebarCollapsedSignal = signal(false);

    await TestBed.configureTestingModule({
      imports: [NavigationButtonsComponent],
      providers: [
        {
          provide: CacheService,
          useValue: {
            hasSmallScreen: hasSmallScreenSignal,
            isSidebarCollapsed: isSidebarCollapsedSignal
          }
        },
        { provide: SubmissionService, useValue: { isEditableStatus: jest.fn().mockReturnValue(true) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('navLeft', () => {
    it('returns padding 75 + sidebar width when large screen and sidebar collapsed', () => {
      hasSmallScreenSignal.set(false);
      isSidebarCollapsedSignal.set(true);
      fixture.detectChanges();
      expect(component.navLeft()).toBe(75 + RESULT_SIDEBAR_WIDTH);
    });

    it('returns padding 250 + sidebar width when large screen and sidebar expanded', () => {
      hasSmallScreenSignal.set(false);
      isSidebarCollapsedSignal.set(false);
      fixture.detectChanges();
      expect(component.navLeft()).toBe(250 + RESULT_SIDEBAR_WIDTH);
    });

    it('returns padding 64 + sidebar width when small screen and sidebar collapsed', () => {
      hasSmallScreenSignal.set(true);
      isSidebarCollapsedSignal.set(true);
      fixture.detectChanges();
      expect(component.navLeft()).toBe(64 + RESULT_SIDEBAR_WIDTH);
    });

    it('returns padding 250 + sidebar width when small screen and sidebar expanded', () => {
      hasSmallScreenSignal.set(true);
      isSidebarCollapsedSignal.set(false);
      fixture.detectChanges();
      expect(component.navLeft()).toBe(250 + RESULT_SIDEBAR_WIDTH);
    });
  });

  describe('navRight', () => {
    it('returns content right offset', () => {
      expect(component.navRight()).toBe(CONTENT_RIGHT_OFFSET);
    });
  });
});
