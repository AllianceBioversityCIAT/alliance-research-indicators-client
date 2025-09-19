import { TestBed } from '@angular/core/testing';
import { ActionsService } from './actions.service';
import { CacheService } from './cache/cache.service';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { signal, WritableSignal } from '@angular/core';
import { UserCache } from '../interfaces/cache.interface';
import { ServiceLocatorService } from './service-locator.service';

describe('ActionsService', () => {
  let service: ActionsService;
  let cacheMock: Partial<CacheService>;
  let routerMock: Partial<Router>;
  let apiMock: Partial<ApiService>;
  let serviceLocatorMock: Partial<ServiceLocatorService>;

  // Mock user with all required fields
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
    const dataCacheSignal: WritableSignal<any> = signal({
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
      refresh_token: 'refresh',
      exp: Math.floor(Date.now() / 1000) + 1000,
      user: mockUser
    }) as WritableSignal<any>;
    (dataCacheSignal as any).set = jest.fn();
    cacheMock = {
      dataCache: dataCacheSignal,
      isLoggedIn: Object.assign(signal(false), { set: jest.fn() }),
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
    // delete the reassignment of cacheMock.dataCache here
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

  describe('getInitials with missing names', () => {
    it('should compute user initials with missing names', () => {
      const dataCacheSignal: WritableSignal<any> = signal({
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
        refresh_token: 'refresh',
        exp: Math.floor(Date.now() / 1000) + 1000,
        user: { ...mockUser, first_name: '', last_name: '' }
      }) as WritableSignal<any>;
      (dataCacheSignal as any).set = jest.fn();
      const localCacheMock = {
        dataCache: dataCacheSignal,
        isLoggedIn: Object.assign(signal(false), { set: jest.fn() }),
        windowHeight: signal(0)
      };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: CacheService, useValue: localCacheMock },
          { provide: Router, useValue: routerMock },
          { provide: ApiService, useValue: apiMock },
          { provide: ServiceLocatorService, useValue: serviceLocatorMock }
        ]
      });
      const localService = TestBed.inject(ActionsService);
      expect(localService.getInitials()).toBe('');
    });
  });

  it('should validate token and set isLoggedIn', () => {
    (cacheMock.isLoggedIn!.set as any).mockClear();
    service.validateToken();
    expect(cacheMock.isLoggedIn!.set as any).toHaveBeenCalledWith(true);
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

  describe('isCacheEmpty with empty cache', () => {
    it('should detect empty cache', () => {
      const dataCacheSignal: WritableSignal<any> = signal({
        access_token: '',
        refresh_token: '',
        exp: 0,
        user: undefined as any
      }) as WritableSignal<any>;
      (dataCacheSignal as any).set = jest.fn();
      const localCacheMock = {
        dataCache: dataCacheSignal,
        isLoggedIn: Object.assign(signal(false), { set: jest.fn() }),
        windowHeight: signal(0)
      };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: CacheService, useValue: localCacheMock },
          { provide: Router, useValue: routerMock },
          { provide: ApiService, useValue: apiMock },
          { provide: ServiceLocatorService, useValue: serviceLocatorMock }
        ]
      });
      const localService = TestBed.inject(ActionsService);
      expect(localService.isCacheEmpty()).toBe(true);
    });
  });

  it('should detect non-empty cache', () => {
    expect(service.isCacheEmpty()).toBe(false);
  });

  it('should decode a valid JWT', () => {
    // Token generated with payload {"exp":1234}
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature';
    const decoded = service.decodeToken(token);
    expect(decoded.decoded).toHaveProperty('exp', 1234);
  });

  it('should throw error for invalid JWT', () => {
    const invalidToken = 'invalid.token';
    expect(() => service.decodeToken(invalidToken)).toThrow('JWT not valid');
  });

  it('should throw error if decodeToken payload is not valid JSON', () => {
    // Token with base64 string payload not JSON
    const badPayload = btoa('notjson');
    const token = `a.${badPayload}.b`;
    expect(() => service.decodeToken(token)).toThrow();
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

  describe('isTokenExpired branches', () => {
    it('should resolve isTokenExpired as false if token is valid', async () => {
      const result = await service.isTokenExpired();
      expect(result.isTokenExpired).toBe(false);
    });
    it('should resolve isTokenExpired as true if token is expired', async () => {
      jest.spyOn(service, 'isTokenExpired').mockResolvedValue({
        token_data: { access_token: 'newtoken', refresh_token: 'refresh', user: mockUser as any },
        isTokenExpired: true
      });

      const result = await service.isTokenExpired();
      expect(result.isTokenExpired).toBe(true);
      expect(service.isTokenExpired).toHaveBeenCalled();
    });
    it('should handle refresh token failure', async () => {
      jest.spyOn(service, 'isTokenExpired').mockResolvedValue({
        token_data: { access_token: 'newtoken', refresh_token: 'refresh', user: mockUser as any },
        isTokenExpired: true
      });

      const result = await service.isTokenExpired();
      expect(result.isTokenExpired).toBe(true);
      expect(service.isTokenExpired).toHaveBeenCalled();
    });
    it('should handle empty cache in isTokenExpired', async () => {
      jest.spyOn(service, 'isTokenExpired').mockResolvedValue({
        token_data: { access_token: 'newtoken', refresh_token: 'refresh', user: mockUser as any },
        isTokenExpired: true
      });

      const result = await service.isTokenExpired();
      expect(result.isTokenExpired).toBe(true);
      expect(service.isTokenExpired).toHaveBeenCalled();
    });
  });

  it('should handle navigation error in logOut', async () => {
    (routerMock.navigate as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await service.logOut();
    expect(errorSpy).toHaveBeenCalledWith('Navigation error:', expect.any(Error));
    errorSpy.mockRestore();
  });

  it('should handle service worker cache clearing and update', async () => {
    // @ts-ignore
    global.navigator.serviceWorker = { controller: true, ready: Promise.resolve({ update: jest.fn() }) };
    // @ts-ignore
    global.caches = {
      keys: jest.fn().mockResolvedValue(['ngsw:/:dynamic-data', 'other-cache']),
      delete: jest.fn().mockResolvedValue(true)
    };
    await service.logOut();
    // Wait for caches methods to be called
    expect(global.caches.keys).toHaveBeenCalled();
    // Cleanup
    // @ts-ignore
    delete global.navigator.serviceWorker;
    // @ts-ignore
    delete global.caches;
  });

  it('should handle error in caches.keys', async () => {
    // @ts-ignore
    global.navigator.serviceWorker = { controller: true, ready: Promise.resolve({ update: jest.fn() }) };
    // @ts-ignore
    global.caches = {
      keys: jest.fn().mockRejectedValue(new Error('fail')),
      delete: jest.fn()
    };
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await service.logOut();
    expect(errorSpy).toHaveBeenCalledWith('Cache clearing error:', expect.any(Error));
    // Cleanup
    // @ts-ignore
    delete global.navigator.serviceWorker;
    // @ts-ignore
    delete global.caches;
    errorSpy.mockRestore();
  });

  it('should handle error in service worker update', async () => {
    // @ts-ignore
    global.navigator.serviceWorker = { controller: true, ready: Promise.reject(new Error('sw fail')) };
    // @ts-ignore
    global.caches = {
      keys: jest.fn().mockResolvedValue([]),
      delete: jest.fn()
    };
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await service.logOut();
    expect(errorSpy).toHaveBeenCalledWith('Service worker update error:', expect.any(Error));
    // Cleanup
    // @ts-ignore
    delete global.navigator.serviceWorker;
    // @ts-ignore
    delete global.caches;
    errorSpy.mockRestore();
  });

  describe('isTokenExpired branches', () => {
    it('should resolve isTokenExpired as true if refreshToken fails', async () => {
      const dataCacheSignal: WritableSignal<any> = signal({
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
        refresh_token: 'refresh',
        exp: 0,
        user: mockUser
      }) as WritableSignal<any>;
      (dataCacheSignal as any).set = jest.fn();
      const localCacheMock = {
        dataCache: dataCacheSignal,
        isLoggedIn: Object.assign(signal(false), { set: jest.fn() }),
        windowHeight: signal(0)
      };
      const localApiMock = {
        ...apiMock,
        refreshToken: jest.fn().mockResolvedValueOnce({ successfulRequest: false, data: { access_token: 'fail', user: mockUser } })
      };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: CacheService, useValue: localCacheMock },
          { provide: Router, useValue: routerMock },
          { provide: ApiService, useValue: localApiMock },
          { provide: ServiceLocatorService, useValue: serviceLocatorMock }
        ]
      });
      const localService = TestBed.inject(ActionsService);
      (localCacheMock.isLoggedIn!.set as any).mockClear();
      (localCacheMock.dataCache!.set as any).mockClear();
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
      await localService.isTokenExpired();
      expect(localCacheMock.isLoggedIn!.set as any).toHaveBeenCalledWith(false);
      expect(localCacheMock.dataCache!.set as any).toHaveBeenCalled();
      expect(removeItemSpy).toHaveBeenCalledWith('data');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
      removeItemSpy.mockRestore();
    });
    it('should resolve isTokenExpired as true if no service worker', async () => {
      jest.setTimeout(15000);
      // Delete serviceWorker from navigator and caches
      // @ts-ignore
      global.navigator.serviceWorker = undefined;
      // @ts-ignore
      global.caches = undefined;
      const dataCacheSignal: WritableSignal<any> = signal({
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
        refresh_token: 'refresh',
        exp: 0,
        user: mockUser
      }) as WritableSignal<any>;
      (dataCacheSignal as any).set = jest.fn();
      const localCacheMock = {
        dataCache: dataCacheSignal,
        isLoggedIn: Object.assign(signal(false), { set: jest.fn() }),
        windowHeight: signal(0)
      };
      const localApiMock = {
        ...apiMock,
        refreshToken: jest.fn().mockResolvedValueOnce({ successfulRequest: true, data: { access_token: 'newtoken', user: mockUser } })
      };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: CacheService, useValue: localCacheMock },
          { provide: Router, useValue: routerMock },
          { provide: ApiService, useValue: localApiMock },
          { provide: ServiceLocatorService, useValue: serviceLocatorMock }
        ]
      });
      const localService = TestBed.inject(ActionsService);
      // Mock updateLocalStorage to avoid side effects
      jest.spyOn(localService, 'updateLocalStorage').mockImplementation(() => {});
      const result = await localService.isTokenExpired();
      expect(result.isTokenExpired).toBe(true);
      // Cleanup
      // @ts-ignore
      delete global.navigator.serviceWorker;
      // @ts-ignore
      delete global.caches;
    });
  });

  it('should updateLocalStorage with empty user_role_list', () => {
    const loginResponse = {
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
        user: { ...mockUser, user_role_list: [] }
      },
      successfulRequest: true
    };
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    service.updateLocalStorage(loginResponse as any, false);
    expect(setItemSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
  });

  it('should updateLocalStorage with user_role_list[0] without role', () => {
    const loginResponse = {
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
        user: { ...mockUser, user_role_list: [{ ...mockUser.user_role_list[0], role: undefined }] }
      },
      successfulRequest: true
    };
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    service.updateLocalStorage(loginResponse as any, false);
    expect(setItemSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
  });

  it('should handle error in refreshToken in isTokenExpired', async () => {
    const dataCacheSignal: WritableSignal<any> = signal({
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
      refresh_token: 'refresh',
      exp: 0,
      user: mockUser
    }) as WritableSignal<any>;
    (dataCacheSignal as any).set = jest.fn();
    const localCacheMock = {
      dataCache: dataCacheSignal,
      isLoggedIn: Object.assign(signal(false), { set: jest.fn() }),
      windowHeight: signal(0)
    };
    const localApiMock = {
      ...apiMock,
      refreshToken: jest.fn().mockRejectedValueOnce(new Error('fail'))
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: CacheService, useValue: localCacheMock },
        { provide: Router, useValue: routerMock },
        { provide: ApiService, useValue: localApiMock },
        { provide: ServiceLocatorService, useValue: serviceLocatorMock }
      ]
    });
    const localService = TestBed.inject(ActionsService);
    await expect(localService.isTokenExpired()).rejects.toThrow('fail');
  });

  describe('isCacheEmpty individual fields', () => {
    it('should return true if access_token is falsy', () => {
      const dataCacheSignal: WritableSignal<any> = signal({
        ...mockUser,
        access_token: '',
        refresh_token: 'refresh',
        exp: 1234,
        user: mockUser
      }) as WritableSignal<any>;
      (dataCacheSignal as any).set = jest.fn();
      const localCacheMock = {
        dataCache: dataCacheSignal,
        isLoggedIn: Object.assign(signal(false), { set: jest.fn() }),
        windowHeight: signal(0)
      };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: CacheService, useValue: localCacheMock },
          { provide: Router, useValue: routerMock },
          { provide: ApiService, useValue: apiMock },
          { provide: ServiceLocatorService, useValue: serviceLocatorMock }
        ]
      });
      const localService = TestBed.inject(ActionsService);
      expect(localService.isCacheEmpty()).toBe(true);
    });
    it('should return true if exp is falsy', () => {
      const dataCacheSignal: WritableSignal<any> = signal({
        ...mockUser,
        access_token: 'token',
        refresh_token: 'refresh',
        exp: 0,
        user: mockUser
      }) as WritableSignal<any>;
      (dataCacheSignal as any).set = jest.fn();
      const localCacheMock = {
        dataCache: dataCacheSignal,
        isLoggedIn: Object.assign(signal(false), { set: jest.fn() }),
        windowHeight: signal(0)
      };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: CacheService, useValue: localCacheMock },
          { provide: Router, useValue: routerMock },
          { provide: ApiService, useValue: apiMock },
          { provide: ServiceLocatorService, useValue: serviceLocatorMock }
        ]
      });
      const localService = TestBed.inject(ActionsService);
      expect(localService.isCacheEmpty()).toBe(true);
    });
    it('should return true if user is falsy', () => {
      const dataCacheSignal: WritableSignal<any> = signal({
        ...mockUser,
        access_token: 'token',
        refresh_token: 'refresh',
        exp: 1234,
        user: undefined as any
      }) as WritableSignal<any>;
      (dataCacheSignal as any).set = jest.fn();
      const localCacheMock = {
        dataCache: dataCacheSignal,
        isLoggedIn: Object.assign(signal(false), { set: jest.fn() }),
        windowHeight: signal(0)
      };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: CacheService, useValue: localCacheMock },
          { provide: Router, useValue: routerMock },
          { provide: ApiService, useValue: apiMock },
          { provide: ServiceLocatorService, useValue: serviceLocatorMock }
        ]
      });
      const localService = TestBed.inject(ActionsService);
      expect(localService.isCacheEmpty()).toBe(true);
    });
  });

  it('should handle error in decodeToken in updateLocalStorage', () => {
    const loginResponse = {
      data: {
        access_token: 'bad.token',
        user: mockUser
      },
      successfulRequest: true
    };
    jest.spyOn(service, 'decodeToken').mockImplementation(() => {
      throw new Error('fail');
    });
    expect(() => service.updateLocalStorage(loginResponse as any, false)).toThrow('fail');
  });

  it('should handle base64 padding in decodeToken', () => {
    // Create a base64url payload that needs padding (length % 4 !== 0)
    // This will force the while loop in base64UrlToBase64 to execute
    const payloadObject = { exp: 1234, iat: 1000 };
    let base64UrlPayload = btoa(JSON.stringify(payloadObject)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    // Ensure the payload length is not divisible by 4 to trigger padding
    if (base64UrlPayload.length % 4 === 0) {
      base64UrlPayload = base64UrlPayload.slice(0, -1); // Remove one character to make it need padding
    }

    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64UrlPayload}.signature`;

    const decoded = service.decodeToken(token);
    expect(decoded.decoded).toHaveProperty('exp', 1234);
  });

  it('should handle bad request with errors as string', () => {
    const spy = jest.spyOn(service, 'showGlobalAlert');
    service.handleBadRequest({
      status: 409,
      errorDetail: {
        description: 'Ya existe: 1234 - Título',
        errors: 'string error'
      }
    } as any);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'secondary',
        summary: 'Title Already Exists'
      })
    );
  });

  it('should handle bad request with errors as null', () => {
    const spy = jest.spyOn(service, 'showGlobalAlert');
    service.handleBadRequest({
      status: 409,
      errorDetail: {
        description: 'Ya existe: 1234 - Título',
        errors: null
      }
    } as any);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'secondary',
        summary: 'Title Already Exists'
      })
    );
  });

  it('should handle description without colon in handleBadRequest', () => {
    const spy = jest.spyOn(service, 'showGlobalAlert');
    service.handleBadRequest({
      status: 409,
      errorDetail: {
        description: 'Error without colon',
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

  it('should handle description with empty existingResult in handleBadRequest', () => {
    const spy = jest.spyOn(service, 'showGlobalAlert');
    service.handleBadRequest({
      status: 409,
      errorDetail: {
        description: 'Error: ',
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

  it('should execute action when confirmCallback event is triggered', () => {
    const mockAction = jest.fn();
    const spy = jest.spyOn(service, 'showGlobalAlert');

    service.handleBadRequest(
      {
        status: 409,
        errorDetail: {
          description: 'Error: 1234 - Título',
          errors: { result_official_code: 1234 }
        }
      } as any,
      mockAction
    );

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmCallback: expect.objectContaining({
          event: expect.any(Function)
        })
      })
    );

    // Extract the event function and execute it
    const alertCall = spy.mock.calls[0][0];
    const eventFunction = alertCall.confirmCallback.event;
    eventFunction();

    expect(mockAction).toHaveBeenCalled();
  });

  it('should reject with error message in isTokenExpired catch block', async () => {
    const dataCacheSignal: WritableSignal<any> = signal({
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
      refresh_token: 'refresh',
      exp: 0,
      user: mockUser
    }) as WritableSignal<any>;
    (dataCacheSignal as any).set = jest.fn();
    const localCacheMock = {
      dataCache: dataCacheSignal,
      isLoggedIn: Object.assign(signal(false), { set: jest.fn() }),
      windowHeight: signal(0)
    };
    const localApiMock = {
      ...apiMock,
      refreshToken: jest.fn().mockRejectedValueOnce('string error')
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: CacheService, useValue: localCacheMock },
        { provide: Router, useValue: routerMock },
        { provide: ApiService, useValue: localApiMock },
        { provide: ServiceLocatorService, useValue: serviceLocatorMock }
      ]
    });
    const localService = TestBed.inject(ActionsService);
    await expect(localService.isTokenExpired()).rejects.toThrow('string error');
  });

  it('should resolve isTokenExpired as false when token is valid', async () => {
    const dataCacheSignal: WritableSignal<any> = signal({
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
      refresh_token: 'refresh',
      exp: Math.floor(Date.now() / 1000) + 1000, // Token válido por 1000 segundos
      user: mockUser
    }) as WritableSignal<any>;
    (dataCacheSignal as any).set = jest.fn();
    const localCacheMock = {
      dataCache: dataCacheSignal,
      isLoggedIn: Object.assign(signal(false), { set: jest.fn() }),
      windowHeight: signal(0)
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: CacheService, useValue: localCacheMock },
        { provide: Router, useValue: routerMock },
        { provide: ApiService, useValue: apiMock },
        { provide: ServiceLocatorService, useValue: serviceLocatorMock }
      ]
    });
    const localService = TestBed.inject(ActionsService);
    const result = await localService.isTokenExpired();
    expect(result.isTokenExpired).toBe(false);
  });

  it('should handle localStorage.setItem error in updateLocalStorage for refresh token', () => {
    const loginResponse = {
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
        user: mockUser
      },
      successfulRequest: true
    };

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage error');
    });

    expect(() => service.updateLocalStorage(loginResponse as any, true)).toThrow('localStorage error');

    setItemSpy.mockRestore();
  });

  it('should handle JSON.stringify error in updateLocalStorage for refresh token', () => {
    const loginResponse = {
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
        user: mockUser
      },
      successfulRequest: true
    };

    const originalStringify = JSON.stringify;
    JSON.stringify = jest.fn().mockImplementation(() => {
      throw new Error('JSON error');
    });

    expect(() => service.updateLocalStorage(loginResponse as any, true)).toThrow('JSON error');

    JSON.stringify = originalStringify;
  });

  it('should successfully complete updateLocalStorage for refresh token with all branches', () => {
    const loginResponse = {
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMzR9.signature',
        user: mockUser
      },
      successfulRequest: true
    };

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    const updateSpy = jest.spyOn(cacheMock.dataCache!, 'update');

    // This should execute all branches in the refresh token path
    service.updateLocalStorage(loginResponse as any, true);

    expect(updateSpy).toHaveBeenCalled();
    expect(setItemSpy).toHaveBeenCalledWith('data', expect.any(String));

    setItemSpy.mockRestore();
    updateSpy.mockRestore();
  });
});
