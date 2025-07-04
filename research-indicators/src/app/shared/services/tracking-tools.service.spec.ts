import { TestBed } from '@angular/core/testing';

import { TrackingToolsService } from './tracking-tools.service';

const cacheMock = {
  currentUrlPath: { set: jest.fn() },
  showSectionHeaderActions: { set: jest.fn() },
  currentRouteTitle: { set: jest.fn() },
  hasSmallScreen: jest.fn().mockReturnValue(false),
  collapseSidebar: jest.fn()
};
const clarityMock = { init: jest.fn(), updateState: jest.fn() };
const hotjarMock = { init: jest.fn(), updateState: jest.fn() };
const bugherdMock = { init: jest.fn() };
const googleAnalyticsMock = { init: jest.fn(), updateState: jest.fn() };

function createRouteMock(data: any = {}, children: any[] = []) {
  return {
    snapshot: { data },
    firstChild: children[0] || null,
    ...(children.length > 0 && { firstChild: children[0] })
  };
}

function createService({
  cache = cacheMock,
  clarity = clarityMock,
  hotjar = hotjarMock,
  bugherd = bugherdMock,
  googleAnalytics = googleAnalyticsMock,
  route = createRouteMock(),
  routerEvents = [] as any[]
} = {}) {
  // @ts-ignore
  const service = Object.create(TrackingToolsService.prototype);
  service.cache = cache;
  service.clarity = clarity;
  service.hotjar = hotjar;
  service.bugherd = bugherd;
  service.googleAnalytics = googleAnalytics;
  service.route = route;
  service.router = { events: { pipe: jest.fn(() => ({ subscribe: jest.fn(fn => routerEvents.forEach(fn)) })) } };
  return service as unknown as TrackingToolsService;
}

describe('TrackingToolsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should be created', () => {
    const service = createService();
    expect(service).toBeTruthy();
  });

  it('init llama a initAllTools y suscribe a eventos de navegación', async () => {
    const url = '/test';
    const navEvent = { urlAfterRedirects: url, constructor: { name: 'NavigationEnd' } } as any;
    const cache = { ...cacheMock, hasSmallScreen: jest.fn().mockReturnValue(true), collapseSidebar: jest.fn() };
    const service = createService({ cache, routerEvents: [navEvent] });
    jest.spyOn(service, 'initAllTools');
    jest.spyOn(service, 'updateAllTools');
    await service.init();
    expect(service.initAllTools).toHaveBeenCalled();
    expect(cache.currentUrlPath.set).toHaveBeenCalledWith(url);
    expect(service.updateAllTools).toHaveBeenCalledWith(url);
    expect(cache.collapseSidebar).toHaveBeenCalled();
    expect(cache.currentRouteTitle.set).toHaveBeenCalled();
  });

  it('getCurrentTitle navega hijos y setea showSectionHeaderActions y currentRouteTitle', () => {
    const child = createRouteMock({ title: 'Hijo', showSectionHeaderActions: true });
    const route = createRouteMock({}, [child]);
    const cache = { ...cacheMock, showSectionHeaderActions: { set: jest.fn() }, currentRouteTitle: { set: jest.fn() } };
    const service = createService({ cache, route });
    // @ts-ignore
    service['getCurrentTitle']();
    expect(cache.showSectionHeaderActions.set).toHaveBeenCalledWith(true);
    expect(cache.currentRouteTitle.set).toHaveBeenCalledWith('Hijo');
  });

  it('isTester retorna true si localStorage tiene isTester', () => {
    localStorage.setItem('isTester', 'true');
    const service = createService();
    expect(service.isTester()).toBe(true);
  });

  it('isTester retorna true si user tiene role_id 8 y recarga', () => {
    localStorage.setItem('data', JSON.stringify({ user: { user_role_list: [{ role_id: 8 }] } }));
    const service = createService();
    expect(service.isTester()).toBe(true);
    expect(localStorage.getItem('isTester')).toBe('true');
  });

  it('isTester retorna false si no es tester', () => {
    localStorage.setItem('data', JSON.stringify({ user: { user_role_list: [{ role_id: 1 }] } }));
    const service = createService();
    expect(service.isTester()).toBe(false);
  });

  it('initAllTools no llama a nada si es tester', () => {
    const service = createService();
    jest.spyOn(service, 'isTester').mockReturnValue(true);
    service.initAllTools();
    expect(service.clarity.init).not.toHaveBeenCalled();
    expect(service.googleAnalytics.init).not.toHaveBeenCalled();
    expect(service.hotjar.init).not.toHaveBeenCalled();
  });

  it('initAllTools llama a todos los inits si no es tester', () => {
    const service = createService();
    jest.spyOn(service, 'isTester').mockReturnValue(false);
    service.initAllTools();
    expect(service.clarity.init).toHaveBeenCalled();
    expect(service.googleAnalytics.init).toHaveBeenCalled();
    expect(service.hotjar.init).toHaveBeenCalled();
  });

  it('updateAllTools no llama a nada si es tester', () => {
    const service = createService();
    jest.spyOn(service, 'isTester').mockReturnValue(true);
    service.updateAllTools('/url');
    expect(service.hotjar.updateState).not.toHaveBeenCalled();
    expect(service.clarity.updateState).not.toHaveBeenCalled();
    expect(service.googleAnalytics.updateState).not.toHaveBeenCalled();
  });

  it('updateAllTools llama a todos los updates si no es tester', () => {
    const service = createService();
    jest.spyOn(service, 'isTester').mockReturnValue(false);
    service.updateAllTools('/url');
    expect(service.hotjar.updateState).toHaveBeenCalledWith('/url');
    expect(service.clarity.updateState).toHaveBeenCalledWith('/url');
    expect(service.googleAnalytics.updateState).toHaveBeenCalledWith('/url');
  });
});
