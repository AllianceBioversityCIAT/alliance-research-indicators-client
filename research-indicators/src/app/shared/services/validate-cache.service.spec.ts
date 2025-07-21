import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { ValidateCacheService } from './validate-cache.service';
import { ToPromiseService } from './to-promise.service';

describe('ValidateCacheService', () => {
  let service: ValidateCacheService;
  let mockToPromiseService: jest.Mocked<Partial<ToPromiseService>>;
  let mockSwUpdate: jest.Mocked<Partial<SwUpdate>>;

  beforeEach(() => {
    const toPromiseServiceMock = {
      get: jest.fn()
    };

    const swUpdateMock = {
      isEnabled: true,
      checkForUpdate: jest.fn().mockResolvedValue(true),
      activateUpdate: jest.fn().mockResolvedValue(true)
    };

    TestBed.configureTestingModule({
      providers: [
        ValidateCacheService,
        { provide: ToPromiseService, useValue: toPromiseServiceMock },
        { provide: SwUpdate, useValue: swUpdateMock }
      ]
    });

    service = TestBed.inject(ValidateCacheService);
    mockToPromiseService = TestBed.inject(ToPromiseService) as jest.Mocked<Partial<ToPromiseService>>;
    mockSwUpdate = TestBed.inject(SwUpdate) as jest.Mocked<Partial<SwUpdate>>;

    // Mock localStorage
    let store: { [key: string]: string } = {};
    const mockLocalStorage = {
      getItem: (key: string): string | null => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };

    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, configurable: true });
    Object.defineProperty(window, 'location', { value: { reload: jest.fn() }, configurable: true });

    if (!window.caches) {
      Object.defineProperty(window, 'caches', {
        value: { 
          keys: jest.fn().mockResolvedValue([]), 
          delete: jest.fn().mockResolvedValue(true) 
        },
        configurable: true
      });
    } else {
      jest.spyOn(window.caches, 'keys').mockResolvedValue([]);
      jest.spyOn(window.caches, 'delete').mockResolvedValue(true);
    }
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not request update if versions are the same', async () => {
    const version = '1.0.0';
    localStorage.setItem('lastVersionValidated', version);
    (mockToPromiseService.get as jest.Mock).mockResolvedValue({ data: { simple_value: version } });
    const requestUpdateSpy = jest.spyOn(service, 'requeestUpdateFrontVersion');

    await service.validateVersions();

    expect(requestUpdateSpy).not.toHaveBeenCalled();
  });

  it('should request update if versions are different', async () => {
    const oldVersion = '1.0.0';
    const newVersion = '1.1.0';
    localStorage.setItem('lastVersionValidated', oldVersion);
    (mockToPromiseService.get as jest.Mock).mockResolvedValue({ data: { simple_value: newVersion } });
    const requestUpdateSpy = jest.spyOn(service, 'requeestUpdateFrontVersion').mockResolvedValue(undefined);

    await service.validateVersions();

    expect(requestUpdateSpy).toHaveBeenCalled();
    expect(localStorage.getItem('lastVersionValidated')).toBe(newVersion);
  });

  it('should request update if no local version', async () => {
    const newVersion = '1.1.0';
    (mockToPromiseService.get as jest.Mock).mockResolvedValue({ data: { simple_value: newVersion } });
    const requestUpdateSpy = jest.spyOn(service, 'requeestUpdateFrontVersion').mockResolvedValue(undefined);

    await service.validateVersions();

    expect(requestUpdateSpy).toHaveBeenCalled();
    expect(localStorage.getItem('lastVersionValidated')).toBe(newVersion);
  });
});