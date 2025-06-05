import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, RouterOutlet, ActivatedRoute } from '@angular/router';
import { ScrollToTopService } from '@shared/services/scroll-top.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ActionsService } from '@shared/services/actions.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { AllianceNavbarComponent } from '@components/alliance-navbar/alliance-navbar.component';
import { AllianceSidebarComponent } from '@components/alliance-sidebar/alliance-sidebar.component';
import { SectionHeaderComponent } from '@components/section-header/section-header.component';
import { AllModalsComponent } from '../../shared/components/all-modals/all-modals.component';
import PlatformComponent from './platform.component';
import {
  actionsServiceMock,
  apiServiceMock,
  cacheServiceMock,
  httpClientMock,
  routerMock,
  routerEventsSubject,
  submissionServiceMock
} from 'src/app/testing/mock-services';
import { SubmissionService } from '@shared/services/submission.service';

describe('PlatformComponent', () => {
  let component: PlatformComponent;
  let fixture: ComponentFixture<PlatformComponent>;
  let scrollToTopService: ScrollToTopService;

  beforeEach(async () => {
    jest.clearAllMocks();
    class ScrollToTopServiceMock {
      scrollContentToTop = jest.fn();
    }

    await TestBed.configureTestingModule({
      imports: [RouterOutlet, AllianceNavbarComponent, AllianceSidebarComponent, SectionHeaderComponent, AllModalsComponent, PlatformComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        { provide: ScrollToTopService, useClass: ScrollToTopServiceMock },
        { provide: HttpClient, useValue: httpClientMock },
        { provide: ActionsService, useValue: actionsServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: SubmissionService, useValue: submissionServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlatformComponent);
    component = fixture.componentInstance;
    scrollToTopService = TestBed.inject(ScrollToTopService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize router subscription on init', () => {
    fixture.detectChanges();
    expect(component['routerSubscription']).toBeTruthy();
  });

  it('should call scrollContentToTop on NavigationEnd event', () => {
    fixture.detectChanges();
    routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
    expect(scrollToTopService.scrollContentToTop).toHaveBeenCalledWith('content');
  });

  it('should not call scrollContentToTop on other event types', () => {
    fixture.detectChanges();
    routerEventsSubject.next({ type: 'other' });
    expect(scrollToTopService.scrollContentToTop).not.toHaveBeenCalled();
  });

  it('should unsubscribe from router on component destroy', () => {
    fixture.detectChanges();
    const unsubscribeSpy = jest.spyOn(component['routerSubscription'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should handle case when no subscription exists on destroy', () => {
    component['routerSubscription'] = null as unknown as Subscription;
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should handle multiple NavigationEnd events', () => {
    fixture.detectChanges();
    routerEventsSubject.next(new NavigationEnd(1, '/test1', '/test1'));
    routerEventsSubject.next(new NavigationEnd(2, '/test2', '/test2'));
    expect(scrollToTopService.scrollContentToTop).toHaveBeenCalledTimes(2);
  });

  it('should handle navigation events in order', () => {
    fixture.detectChanges();
    const scrollSpy = jest.spyOn(scrollToTopService, 'scrollContentToTop');

    routerEventsSubject.next(new NavigationEnd(1, '/test1', '/test1'));
    expect(scrollSpy).toHaveBeenCalledTimes(1);

    routerEventsSubject.next(new NavigationEnd(2, '/test2', '/test2'));
    expect(scrollSpy).toHaveBeenCalledTimes(2);
  });

  it('should handle error in router subscription', () => {
    fixture.detectChanges();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    routerEventsSubject.error(new Error('Test error'));
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle complete in router subscription', () => {
    fixture.detectChanges();
    routerEventsSubject.complete();
    expect(component['routerSubscription'].closed).toBeTruthy();
  });

  it('should handle multiple destroy calls', () => {
    fixture.detectChanges();
    component.ngOnDestroy();
    // Segunda llamada, no debe lanzar error y la suscripción debe estar cerrada
    expect(() => component.ngOnDestroy()).not.toThrow();
    expect(component['routerSubscription'].closed).toBe(true);
  });

  it('should handle navigation with different URLs', () => {
    jest.clearAllMocks();
    fixture.detectChanges();
    expect(() => {
      routerEventsSubject.next(new NavigationEnd(1, '/test1', '/test1'));
      routerEventsSubject.next(new NavigationEnd(2, '/test2', '/test2'));
    }).not.toThrow();
  });

  it('should handle navigation with same URL', () => {
    jest.clearAllMocks();
    fixture.detectChanges();
    expect(() => {
      routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
      routerEventsSubject.next(new NavigationEnd(2, '/test', '/test'));
    }).not.toThrow();
  });
});
