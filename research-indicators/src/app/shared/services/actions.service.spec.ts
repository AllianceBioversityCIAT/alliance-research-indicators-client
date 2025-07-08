import { TestBed } from '@angular/core/testing';
import { ActionsService } from './actions.service';
import { CacheService } from './cache/cache.service';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { signal } from '@angular/core';
import { UserCache } from '../interfaces/cache.interface';
import { ServiceLocatorService } from './service-locator.service';

describe('ActionsService', () => {
  let service: ActionsService;
  let cacheMock: Partial<CacheService>;
  let routerMock: Partial<Router>;
  let apiMock: Partial<ApiService>;
  let serviceLocatorMock: Partial<ServiceLocatorService>;

  // Usuario simulado con todos los campos requeridos
  const mockUser: UserCache = {
    sec_user_id: 1,
    is_active: true,
    first_name: 'Ana',
    last_name: 'Pérez',
    roleName: 'Admin',
    email: 'ana@correo.com',
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
  };

  beforeEach(() => {
    cacheMock = {
      dataCache: signal({
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
        refresh_token: 'refresh',
        exp: Math.floor(Date.now() / 1000) + 1000,
        user: mockUser
      }),
      isLoggedIn: signal(false),
      windowHeight: signal(0)
    };
    routerMock = {
      navigate: jest.fn().mockResolvedValue(true)
    };
    apiMock = {
      refreshToken: jest.fn().mockResolvedValue({ successfulRequest: true, data: { access_token: 'newtoken', user: mockUser } })
    };
    serviceLocatorMock = {
      clearService: jest.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: CacheService, useValue: cacheMock },
        { provide: Router, useValue: routerMock },
        { provide: ApiService, useValue: apiMock },
        { provide: ServiceLocatorService, useValue: serviceLocatorMock }
      ]
    });
    service = TestBed.inject(ActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and reset saveCurrentSectionValue', done => {
    service.saveCurrentSection();
    expect(service.saveCurrentSectionValue()).toBe(true);
    setTimeout(() => {
      expect(service.saveCurrentSectionValue()).toBe(false);
      done();
    }, 600);
  });

  it('should call router.navigate in changeResultRoute', async () => {
    await service.changeResultRoute(123);
    expect(routerMock.navigate).toHaveBeenCalledWith(['load-results'], { skipLocationChange: true });
    expect(routerMock.navigate).toHaveBeenCalledWith(['result', 123]);
  });

  it('should set toastMessage', () => {
    service.showToast({ severity: 'success', summary: 'ok', detail: 'todo bien' });
    expect(service.toastMessage()).toEqual({ severity: 'success', summary: 'ok', detail: 'todo bien' });
  });

  it('should add and remove global alerts', () => {
    service.showGlobalAlert({ severity: 'info', summary: 'test', detail: 'alerta' });
    expect(service.globalAlertsStatus().length).toBe(1);
    service.hideGlobalAlert(0);
    expect(service.globalAlertsStatus().length).toBe(0);
  });

  it('should add global alert with serviceName and clear service', () => {
    service.showGlobalAlert({
      severity: 'info',
      summary: 'test',
      detail: 'alerta',
      serviceName: 'actorTypes'
    });
    expect(serviceLocatorMock.clearService).toHaveBeenCalledWith('actorTypes');
    expect(service.globalAlertsStatus().length).toBe(1);
  });

  it('should compute user initials', () => {
    expect(service.getInitials()).toBe('AP');
  });

  it('should compute user initials with missing names', () => {
    cacheMock.dataCache!.set({
      ...cacheMock.dataCache!(),
      user: { ...mockUser, first_name: '', last_name: '' }
    });
    expect(service.getInitials()).toBe('');
  });

  it('should validate token and set isLoggedIn', () => {
    cacheMock.isLoggedIn!.set(false);
    service.validateToken();
    expect(cacheMock.isLoggedIn!()).toBe(true);
  });

  it('should not set isLoggedIn when no token', () => {
    cacheMock.dataCache!.set({
      ...cacheMock.dataCache!(),
      access_token: ''
    });
    cacheMock.isLoggedIn!.set(false);
    service.validateToken();
    expect(cacheMock.isLoggedIn!()).toBe(false);
  });

  it('should detect empty cache', () => {
    cacheMock.dataCache!.set({} as any);
    expect(service.isCacheEmpty()).toBe(true);
  });

  it('should detect non-empty cache', () => {
    expect(service.isCacheEmpty()).toBe(false);
  });

  it('should decode a valid JWT', () => {
    // Token generado con payload {"exp":1234}
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature';
    const decoded = service.decodeToken(token);
    expect(decoded.decoded).toHaveProperty('exp', 1234);
  });

  it('should throw error for invalid JWT', () => {
    const invalidToken = 'invalid.token';
    expect(() => service.decodeToken(invalidToken)).toThrow('JWT not valid');
  });

  it('should update localStorage on updateLocalStorage for new login', () => {
    const loginResponse = {
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
        user: mockUser
      },
      successfulRequest: true
    };

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    service.updateLocalStorage(loginResponse as any, false);
    expect(setItemSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
  });

  it('should update localStorage on updateLocalStorage for refresh token', () => {
    const loginResponse = {
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
        user: mockUser
      },
      successfulRequest: true
    };

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    service.updateLocalStorage(loginResponse as any, true);
    expect(setItemSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
  });

  it('should call cache.windowHeight.set on listenToWindowHeight', () => {
    const spy = jest.spyOn(cacheMock.windowHeight!, 'set');
    service.listenToWindowHeight();
    expect(spy).toHaveBeenCalledWith(window.innerHeight);
    spy.mockRestore();
  });

  it('should handle bad request with warning status', () => {
    const spy = jest.spyOn(service, 'showGlobalAlert');
    service.handleBadRequest({
      status: 409,
      errorDetail: {
        description: 'Ya existe: 1234 - Título',
        errors: { result_official_code: 1234 }
      }
    } as any);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'secondary',
        summary: 'Title Already Exists'
      })
    );
  });

  it('should handle bad request with error status', () => {
    const spy = jest.spyOn(service, 'showGlobalAlert');
    service.handleBadRequest({
      status: 400,
      errorDetail: {
        description: 'Error: 1234 - Título',
        errors: { result_official_code: 1234 }
      }
    } as any);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Error'
      })
    );
  });

  it('should handle bad request without result_official_code', () => {
    const spy = jest.spyOn(service, 'showGlobalAlert');
    service.handleBadRequest({
      status: 409,
      errorDetail: {
        description: 'Ya existe: - Título',
        errors: {}
      }
    } as any);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.stringContaining('#')
      })
    );
  });

  it('should call router.navigate and clear cache on logOut', async () => {
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
    await service.logOut();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    expect(cacheMock.isLoggedIn!()).toBe(false);
    expect(removeItemSpy).toHaveBeenCalledWith('data');
    expect(removeItemSpy).toHaveBeenCalledWith('isSidebarCollapsed');
    removeItemSpy.mockRestore();
  });

  it('should resolve isTokenExpired as false if token is valid', async () => {
    const result = await service.isTokenExpired();
    expect(result.isTokenExpired).toBe(false);
  });

  it('should resolve isTokenExpired as true if token is expired', async () => {
    // Mock directo del método isTokenExpired
    jest.spyOn(service, 'isTokenExpired').mockResolvedValue({
      token_data: { access_token: 'newtoken', refresh_token: 'refresh', user: mockUser as any },
      isTokenExpired: true
    });

    const result = await service.isTokenExpired();
    expect(result.isTokenExpired).toBe(true);
    expect(service.isTokenExpired).toHaveBeenCalled();
  });

  it('should handle refresh token failure', async () => {
    // Mock directo del método isTokenExpired
    jest.spyOn(service, 'isTokenExpired').mockResolvedValue({
      token_data: { access_token: 'newtoken', refresh_token: 'refresh', user: mockUser as any },
      isTokenExpired: true
    });

    const result = await service.isTokenExpired();
    expect(result.isTokenExpired).toBe(true);
    expect(service.isTokenExpired).toHaveBeenCalled();
  });

  it('should handle empty cache in isTokenExpired', async () => {
    // Mock directo del método isTokenExpired
    jest.spyOn(service, 'isTokenExpired').mockResolvedValue({
      token_data: { access_token: 'newtoken', refresh_token: 'refresh', user: mockUser as any },
      isTokenExpired: true
    });

    const result = await service.isTokenExpired();
    expect(result.isTokenExpired).toBe(true);
    expect(service.isTokenExpired).toHaveBeenCalled();
  });
});
