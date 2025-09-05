import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { ValidateCacheService } from './validate-cache.service';
import { ToPromiseService } from './to-promise.service';
import { environment } from '../../../environments/environment';

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
      providers: [ValidateCacheService, { provide: ToPromiseService, useValue: toPromiseServiceMock }, { provide: SwUpdate, useValue: swUpdateMock }]
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

    // Mock caches API
    Object.defineProperty(window, 'caches', {
      value: {
        keys: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue(true),
        open: jest.fn().mockResolvedValue({
          keys: jest.fn().mockResolvedValue([]),
          delete: jest.fn().mockResolvedValue(true)
        })
      },
      configurable: true
    });
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

  it('should request update when local version is null', async () => {
    const newVersion = '1.1.0';
    localStorage.removeItem('lastVersionValidated');
    (mockToPromiseService.get as jest.Mock).mockResolvedValue({ data: { simple_value: newVersion } });
    const requestUpdateSpy = jest.spyOn(service, 'requeestUpdateFrontVersion').mockResolvedValue(undefined);

    await service.validateVersions();

    expect(requestUpdateSpy).toHaveBeenCalled();
    expect(localStorage.getItem('lastVersionValidated')).toBe(newVersion);
  });

  it('should request update when versions are different and local exists', async () => {
    const oldVersion = '1.0.0';
    const newVersion = '1.1.0';
    localStorage.setItem('lastVersionValidated', oldVersion);
    (mockToPromiseService.get as jest.Mock).mockResolvedValue({ data: { simple_value: newVersion } });
    const requestUpdateSpy = jest.spyOn(service, 'requeestUpdateFrontVersion').mockResolvedValue(undefined);

    await service.validateVersions();

    expect(requestUpdateSpy).toHaveBeenCalled();
    expect(localStorage.getItem('lastVersionValidated')).toBe(newVersion);
  });

  it('should not request update when versions are the same and local version exists', async () => {
    const version = '1.0.0';
    localStorage.setItem('lastVersionValidated', version);
    (mockToPromiseService.get as jest.Mock).mockResolvedValue({ data: { simple_value: version } });
    const requestUpdateSpy = jest.spyOn(service, 'requeestUpdateFrontVersion').mockResolvedValue(undefined);

    await service.validateVersions();

    expect(requestUpdateSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem('lastVersionValidated')).toBe(version);
  });

  it('should handle case where localStorage returns empty string', async () => {
    const newVersion = '1.1.0';
    localStorage.setItem('lastVersionValidated', '');
    (mockToPromiseService.get as jest.Mock).mockResolvedValue({ data: { simple_value: newVersion } });
    const requestUpdateSpy = jest.spyOn(service, 'requeestUpdateFrontVersion').mockResolvedValue(undefined);

    await service.validateVersions();

    expect(requestUpdateSpy).toHaveBeenCalled();
    expect(localStorage.getItem('lastVersionValidated')).toBe(newVersion);
  });

  it('should handle case where new version is empty string and local version exists', async () => {
    const oldVersion = '1.0.0';
    const newVersion = '';
    localStorage.setItem('lastVersionValidated', oldVersion);
    (mockToPromiseService.get as jest.Mock).mockResolvedValue({ data: { simple_value: newVersion } });
    const requestUpdateSpy = jest.spyOn(service, 'requeestUpdateFrontVersion').mockResolvedValue(undefined);

    await service.validateVersions();

    expect(requestUpdateSpy).toHaveBeenCalled();
    expect(localStorage.getItem('lastVersionValidated')).toBe(newVersion);
  });

  describe('clearImageCaches', () => {
    beforeEach(() => {
      // Mock caches API with more detailed behavior
      const mockCache = {
        keys: jest
          .fn()
          .mockResolvedValue([
            { url: 'https://example.com/image.png' },
            { url: 'https://example.com/image.jpg' },
            { url: 'https://example.com/image.jpeg' },
            { url: 'https://example.com/image.gif' },
            { url: 'https://example.com/image.svg' },
            { url: 'https://example.com/image.webp' },
            { url: 'https://example.com/image.ico' },
            { url: 'https://example.com/image.bmp' },
            { url: 'https://example.com/script.js' }
          ]),
        delete: jest.fn().mockResolvedValue(true)
      };

      Object.defineProperty(window, 'caches', {
        value: {
          keys: jest.fn().mockResolvedValue(['cache1', 'cache2']),
          open: jest.fn().mockResolvedValue(mockCache),
          delete: jest.fn().mockResolvedValue(true)
        },
        configurable: true
      });
    });

    it('should clear image caches successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await (service as any).clearImageCaches();

      expect(window.caches.keys).toHaveBeenCalled();
      expect(window.caches.open).toHaveBeenCalledWith('cache1');
      expect(window.caches.open).toHaveBeenCalledWith('cache2');
      expect(consoleSpy).toHaveBeenCalledWith('Image caches cleared successfully');

      consoleSpy.mockRestore();
    });

    it('should handle error when clearing image caches', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Cache error');

      (window.caches.keys as jest.Mock).mockRejectedValue(error);

      await (service as any).clearImageCaches();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error clearing image caches:', error);

      consoleErrorSpy.mockRestore();
    });

    it('should do nothing if caches API is not available', async () => {
      Object.defineProperty(window, 'caches', { value: undefined, configurable: true });

      await expect((service as any).clearImageCaches()).resolves.not.toThrow();
    });
  });

  describe('requeestUpdateFrontVersion', () => {
    beforeEach(() => {
      jest.spyOn(service as any, 'clearAllCaches').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'clearImageCaches').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'updateServiceWorker').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'forceReload').mockImplementation();
    });

    it('should execute update process successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await service.requeestUpdateFrontVersion();

      expect(consoleSpy).toHaveBeenCalledWith('New version available, updating application...');
      expect(service as any).toHaveProperty('clearAllCaches');
      expect(service as any).toHaveProperty('clearImageCaches');
      expect(service as any).toHaveProperty('updateServiceWorker');
      expect(service as any).toHaveProperty('forceReload');

      consoleSpy.mockRestore();
    });

    it('should handle error and show alert', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      const error = new Error('Update error');

      jest.spyOn(service as any, 'clearAllCaches').mockRejectedValue(error);

      await service.requeestUpdateFrontVersion();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating front version:', error);
      expect(alertSpy).toHaveBeenCalledWith('A new version is available, please refresh the page manually');

      consoleErrorSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('clearAllCaches', () => {
    it('should clear all caches successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const cacheNames = ['cache1', 'cache2', 'cache3'];

      Object.defineProperty(window, 'caches', {
        value: {
          keys: jest.fn().mockResolvedValue(cacheNames),
          delete: jest.fn().mockResolvedValue(true)
        },
        configurable: true
      });

      await (service as any).clearAllCaches();

      expect(window.caches.keys).toHaveBeenCalled();
      expect(window.caches.delete).toHaveBeenCalledTimes(3);
      expect(consoleSpy).toHaveBeenCalledWith('All caches cleared successfully');

      consoleSpy.mockRestore();
    });

    it('should handle error when clearing all caches', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Clear cache error');

      Object.defineProperty(window, 'caches', {
        value: {
          keys: jest.fn().mockRejectedValue(error)
        },
        configurable: true
      });

      await (service as any).clearAllCaches();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error clearing caches:', error);

      consoleErrorSpy.mockRestore();
    });

    it('should do nothing if caches API is not available', async () => {
      Object.defineProperty(window, 'caches', { value: undefined, configurable: true });

      await expect((service as any).clearAllCaches()).resolves.not.toThrow();
    });
  });

  describe('updateServiceWorker', () => {
    it('should update service worker when update is available', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockSwUpdate.isEnabled = true;
      mockSwUpdate.checkForUpdate = jest.fn().mockResolvedValue(true);
      mockSwUpdate.activateUpdate = jest.fn().mockResolvedValue(undefined);

      await (service as any).updateServiceWorker();

      expect(mockSwUpdate.checkForUpdate).toHaveBeenCalled();
      expect(mockSwUpdate.activateUpdate).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Service worker update available, activating...');
      expect(consoleSpy).toHaveBeenCalledWith('Service worker updated successfully');

      consoleSpy.mockRestore();
    });

    it('should handle case when no update is available', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockSwUpdate.isEnabled = true;
      mockSwUpdate.checkForUpdate = jest.fn().mockResolvedValue(false);

      await (service as any).updateServiceWorker();

      expect(mockSwUpdate.checkForUpdate).toHaveBeenCalled();
      expect(mockSwUpdate.activateUpdate).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('No service worker update available');

      consoleSpy.mockRestore();
    });

    it('should handle service worker error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Service worker error');
      mockSwUpdate.isEnabled = true;
      mockSwUpdate.checkForUpdate = jest.fn().mockRejectedValue(error);

      await (service as any).updateServiceWorker();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating service worker:', error);

      consoleErrorSpy.mockRestore();
    });

    it('should log warning when service worker is not enabled', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockSwUpdate.isEnabled = false;

      await (service as any).updateServiceWorker();

      expect(mockSwUpdate.checkForUpdate).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Service worker not enabled');

      consoleSpy.mockRestore();
    });
  });

  describe('forceReload', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      Object.defineProperty(window, 'location', {
        value: { reload: jest.fn() },
        configurable: true
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should force page reload after 1 second', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const reloadSpy = jest.spyOn(window.location, 'reload');

      (service as any).forceReload();

      expect(consoleSpy).toHaveBeenCalledWith('Forcing page reload in 1 second...');
      expect(reloadSpy).not.toHaveBeenCalled();

      // Fast-forward time
      jest.advanceTimersByTime(1000);

      expect(reloadSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getConfiguration', () => {
    it('should call tp.get with correct parameters', () => {
      service.getConfiguration();

      expect(mockToPromiseService.get).toHaveBeenCalledWith(`configuration/${environment.frontVersionKey}`, { noAuthInterceptor: true });
    });
  });
});
