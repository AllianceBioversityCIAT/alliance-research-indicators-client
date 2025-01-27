import { TestBed } from '@angular/core/testing';
import { ClarityService } from './clarity.service';
import { Router, NavigationEnd } from '@angular/router';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

describe('ClarityService', () => {
  let service: ClarityService;
  let routerMock: Partial<Router>;

  beforeEach(() => {
    routerMock = {
      events: of(new NavigationEnd(1, '/', '/'))
    };

    TestBed.configureTestingModule({
      providers: [ClarityService, { provide: Router, useValue: routerMock }]
    });
    service = TestBed.inject(ClarityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not initialize Clarity in development mode', () => {
    spyOn(console, 'log');
    environment.production = false;
    service.init();
    expect(console.log).toHaveBeenCalledWith('Clarity tracking disabled in development mode');
  });

  it('should initialize Clarity in production mode', () => {
    environment.production = true;
    const mockClarity = {
      init: jasmine.createSpy('init'),
      consent: jasmine.createSpy('consent'),
      setTag: jasmine.createSpy('setTag'),
      event: jasmine.createSpy('event'),
      upgrade: jasmine.createSpy('upgrade')
    };

    (window as any).clarity = mockClarity;
    service.init();

    expect(mockClarity.init).toHaveBeenCalled();
    expect(mockClarity.consent).toHaveBeenCalled();
  });

  it('should track events in production mode', () => {
    environment.production = true;
    const mockClarity = {
      event: jasmine.createSpy('event'),
      setTag: jasmine.createSpy('setTag')
    };

    (window as any).clarity = mockClarity;
    service.trackEvent('test-event', { key: 'value' });

    expect(mockClarity.event).toHaveBeenCalledWith('test-event');
    expect(mockClarity.setTag).toHaveBeenCalledWith('key', 'value');
  });

  it('should not track events in development mode', () => {
    environment.production = false;
    const mockClarity = {
      event: jasmine.createSpy('event'),
      setTag: jasmine.createSpy('setTag')
    };

    (window as any).clarity = mockClarity;
    service.trackEvent('test-event', { key: 'value' });

    expect(mockClarity.event).not.toHaveBeenCalled();
    expect(mockClarity.setTag).not.toHaveBeenCalled();
  });

  it('should set tags in production mode', () => {
    environment.production = true;
    const mockClarity = {
      setTag: jasmine.createSpy('setTag')
    };

    (window as any).clarity = mockClarity;
    service.setTags({ key: 'value' });

    expect(mockClarity.setTag).toHaveBeenCalledWith('key', 'value');
  });

  it('should not set tags in development mode', () => {
    environment.production = false;
    const mockClarity = {
      setTag: jasmine.createSpy('setTag')
    };

    (window as any).clarity = mockClarity;
    service.setTags({ key: 'value' });

    expect(mockClarity.setTag).not.toHaveBeenCalled();
  });

  it('should handle cookie consent in production mode', () => {
    environment.production = true;
    const mockClarity = {
      consent: jasmine.createSpy('consent')
    };

    (window as any).clarity = mockClarity;
    service.setCookieConsent(true);

    expect(mockClarity.consent).toHaveBeenCalledWith(true);
  });

  it('should handle session upgrade in production mode', () => {
    environment.production = true;
    const mockClarity = {
      upgrade: jasmine.createSpy('upgrade')
    };

    (window as any).clarity = mockClarity;
    service.upgradeSession('test-reason');

    expect(mockClarity.upgrade).toHaveBeenCalledWith('test-reason');
  });

  it('should handle errors gracefully', () => {
    environment.production = true;
    spyOn(console, 'error');

    service.init();
    service.trackEvent('test');
    service.setTags({});
    service.setCookieConsent(true);
    service.upgradeSession('test');

    expect(console.error).toHaveBeenCalled();
  });
});
