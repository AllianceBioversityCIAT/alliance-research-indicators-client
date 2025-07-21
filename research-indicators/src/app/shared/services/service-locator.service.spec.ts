import { Injector } from '@angular/core';
import { ServiceLocatorService } from './service-locator.service';

describe('ServiceLocatorService', () => {
  let service: ServiceLocatorService;
  let injectorMock: any;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      list: { set: jest.fn() },
      main: jest.fn()
    };
    injectorMock = {
      get: jest.fn().mockReturnValue(serviceMock)
    };
    service = new ServiceLocatorService(injectorMock as Injector);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getService returns from getPrimaryServices', () => {
    jest.spyOn(service as any, 'getPrimaryServices').mockReturnValue('primary');
    expect(service.getService('actorTypes')).toBe('primary');
  });

  it('getService returns from getSecondaryServices', () => {
    jest.spyOn(service as any, 'getPrimaryServices').mockReturnValue(null);
    jest.spyOn(service as any, 'getSecondaryServices').mockReturnValue('secondary');
    expect(service.getService('countries')).toBe('secondary');
  });

  it('getService returns from getTertiaryServices', () => {
    jest.spyOn(service as any, 'getPrimaryServices').mockReturnValue(null);
    jest.spyOn(service as any, 'getSecondaryServices').mockReturnValue(null);
    jest.spyOn(service as any, 'getTertiaryServices').mockReturnValue('tertiary');
    expect(service.getService('policyTypes')).toBe('tertiary');
  });

  it('getService returns from getQuaternaryServices', () => {
    jest.spyOn(service as any, 'getPrimaryServices').mockReturnValue(null);
    jest.spyOn(service as any, 'getSecondaryServices').mockReturnValue(null);
    jest.spyOn(service as any, 'getTertiaryServices').mockReturnValue(null);
    jest.spyOn(service as any, 'getQuaternaryServices').mockReturnValue('quaternary');
    expect(service.getService('regions')).toBe('quaternary');
  });

  it('getService returns from getOtherServices', () => {
    jest.spyOn(service as any, 'getPrimaryServices').mockReturnValue(null);
    jest.spyOn(service as any, 'getSecondaryServices').mockReturnValue(null);
    jest.spyOn(service as any, 'getTertiaryServices').mockReturnValue(null);
    jest.spyOn(service as any, 'getQuaternaryServices').mockReturnValue(null);
    jest.spyOn(service as any, 'getOtherServices').mockReturnValue('other');
    expect(service.getService('ipOwners')).toBe('other');
  });

  it('clearService calls list.set and main if present', () => {
    const spy = jest.spyOn(service, 'getService').mockReturnValue(serviceMock);
    service.clearService('actorTypes');
    expect(serviceMock.list.set).toHaveBeenCalledWith([]);
    expect(serviceMock.main).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('clearService does nothing if service not found', () => {
    const spy = jest.spyOn(service, 'getService').mockReturnValue(null);
    expect(() => service.clearService('actorTypes')).not.toThrow();
    spy.mockRestore();
  });

  it('clearService only calls list.set if main not present', () => {
    const partialApiMock = { TP: {}, cache: {}, clCache: {}, signalEndpoint: jest.fn() };
    const partialMock = {
      list: { set: jest.fn() },
      loading: false,
      isOpenSearch: false,
      severity: '',
      main: undefined,
      api: partialApiMock
    } as unknown as any;
    const spy = jest.spyOn(service, 'getService').mockReturnValue(partialMock);
    service.clearService('actorTypes');
    expect(partialMock.list.set).toHaveBeenCalledWith([]);
    spy.mockRestore();
  });

  it('clearService only calls main if list not present', () => {
    const partialApiMock2 = { TP: {}, cache: {}, clCache: {}, signalEndpoint: jest.fn() };
    const partialMock2 = {
      main: jest.fn(),
      loading: false,
      isOpenSearch: false,
      severity: '',
      list: undefined,
      api: partialApiMock2
    } as unknown as any;
    const spy2 = jest.spyOn(service, 'getService').mockReturnValue(partialMock2);
    service.clearService('actorTypes');
    expect(partialMock2.main).toHaveBeenCalled();
    spy2.mockRestore();
  });

  describe('getPrimaryServices', () => {
    it('calls main(true) for countriesWithSubnational', () => {
      const svc = { main: jest.fn() };
      injectorMock.get.mockReturnValue(svc);
      const result = (service as any).getPrimaryServices('countriesWithSubnational');
      expect(svc.main).toHaveBeenCalledWith(true);
      expect(result).toBe(svc);
    });
    it('calls main(false) for countriesWithoutSubnational', () => {
      const svc = { main: jest.fn() };
      injectorMock.get.mockReturnValue(svc);
      const result = (service as any).getPrimaryServices('countriesWithoutSubnational');
      expect(svc.main).toHaveBeenCalledWith(false);
      expect(result).toBe(svc);
    });
    it('returns null for unknown', () => {
      expect((service as any).getPrimaryServices('unknown')).toBeNull();
    });
  });

  describe('getSecondaryServices', () => {
    it('returns null for unknown', () => {
      expect((service as any).getSecondaryServices('unknown')).toBeNull();
    });
  });

  describe('getTertiaryServices', () => {
    it('returns null for unknown', () => {
      expect((service as any).getTertiaryServices('unknown')).toBeNull();
    });
  });

  describe('getQuaternaryServices', () => {
    it('returns null for unknown', () => {
      expect((service as any).getQuaternaryServices('unknown')).toBeNull();
    });
  });

  describe('getOtherServices', () => {
    it('returns null and warns for unknown', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      expect((service as any).getOtherServices('unknown')).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
