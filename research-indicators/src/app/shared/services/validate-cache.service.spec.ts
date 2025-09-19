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
    Object.defineProperty(window, 'alert', { value: jest.fn(), configurable: true });
    Object.defineProperty(window, 'confirm', { value: jest.fn().mockReturnValue(true), configurable: true });

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

  describe('validateVersions', () => {
    it('should not request update if versions are the same', async () => {
      const version = '1.0.0';
      localStorage.setItem('lastVersionValidated', version);
      (mockToPromiseService.get as jest.Mock).mockResolvedValue({ data: { simple_value: version } });
      const requestUpdateSpy = jest.spyOn(service, 'requeestUpdateFrontVersion').mockResolvedValue(undefined);

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

      expect(requestUpdateSpy).toHaveBeenCalledWith(newVersion);
    });

    it('should request update if no local version', async () => {
      const newVersion = '1.1.0';
      (mockToPromiseService.get as jest.Mock).mockResolvedValue({ data: { simple_value: newVersion } });
      const requestUpdateSpy = jest.spyOn(service, 'requeestUpdateFrontVersion').mockResolvedValue(undefined);

      await service.validateVersions();

      expect(requestUpdateSpy).toHaveBeenCalledWith(newVersion);
    });

    it('should apply silent update if pending version matches current', async () => {
      const version = '1.1.0';
      localStorage.setItem('pendingUpdateVersion', version);
      localStorage.setItem('lastVersionValidated', '1.0.0');
      (mockToPromiseService.get as jest.Mock).mockResolvedValue({ data: { simple_value: version } });
      const applySilentUpdateSpy = jest.spyOn(service as any, 'applySilentUpdate').mockResolvedValue(undefined);

      await service.validateVersions();

      expect(applySilentUpdateSpy).toHaveBeenCalledWith(version);
    });
  });

  describe('requeestUpdateFrontVersion', () => {
    beforeEach(() => {
      jest.spyOn(service as any, 'downloadUpdatesInBackground').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'performImmediateUpdate').mockResolvedValue(undefined);
    });

    it('should perform immediate update when user confirms', async () => {
      const version = '1.1.0';
      (window.confirm as jest.Mock).mockReturnValue(true);
      const performUpdateSpy = jest.spyOn(service as any, 'performImmediateUpdate');

      await service.requeestUpdateFrontVersion(version);

      expect(window.confirm).toHaveBeenCalledWith(
        '🔄 New changes are available. Do you want to update the application now?\n\nThis will clear the cache and reload the page.'
      );
      expect(performUpdateSpy).toHaveBeenCalledWith(version);
    });

    it('should download in background when user cancels', async () => {
      const version = '1.1.0';
      (window.confirm as jest.Mock).mockReturnValue(false);
      const downloadSpy = jest.spyOn(service as any, 'downloadUpdatesInBackground');

      await service.requeestUpdateFrontVersion(version);

      expect(downloadSpy).toHaveBeenCalledWith(version);
    });

    it('should handle error and show alert', async () => {
      const version = '1.1.0';
      const error = new Error('Update error');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(service as any, 'performImmediateUpdate').mockRejectedValue(error);

      await service.requeestUpdateFrontVersion(version);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating front version:', error);
      expect(window.alert).toHaveBeenCalledWith('❌ Update error. Please reload the page manually (Ctrl+F5 or Cmd+Shift+R)');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearStaticResourceCaches', () => {
    beforeEach(() => {
      const mockCache = {
        keys: jest
          .fn()
          .mockResolvedValue([
            { url: 'https://example.com/style.css' },
            { url: 'https://example.com/script.js' },
            { url: 'https://example.com/image.png' },
            { url: 'https://example.com/font.woff2' },
            { url: 'https://example.com/data.json' }
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

    it('should clear static resource caches successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await (service as any).clearStaticResourceCaches();

      expect(window.caches.keys).toHaveBeenCalled();
      expect(window.caches.open).toHaveBeenCalledWith('cache1');
      expect(window.caches.open).toHaveBeenCalledWith('cache2');
      expect(consoleSpy).toHaveBeenCalledWith('Static resource caches (CSS, JS, images) cleared successfully');

      consoleSpy.mockRestore();
    });

    it('should handle error when clearing static resource caches', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Cache error');

      (window.caches.keys as jest.Mock).mockRejectedValue(error);

      await expect((service as any).clearStaticResourceCaches()).rejects.toThrow(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error clearing static resource caches:', error);

      consoleErrorSpy.mockRestore();
    });

    it('should do nothing if caches API is not available', async () => {
      Object.defineProperty(window, 'caches', { value: undefined, configurable: true });

      await expect((service as any).clearStaticResourceCaches()).resolves.not.toThrow();
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
      expect(consoleSpy).toHaveBeenCalledWith('All 3 caches processed successfully');

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

      await expect((service as any).clearAllCaches()).rejects.toThrow(error);
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

      await expect((service as any).updateServiceWorker()).rejects.toThrow(error);
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
    it('should force page reload immediately', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const reloadSpy = jest.spyOn(window.location, 'reload').mockImplementation();

      (service as any).forceReload();

      expect(consoleSpy).toHaveBeenCalledWith('Forcing page reload immediately...');
      expect(window.alert).toHaveBeenCalledWith('✅ Cache cleared successfully. The application will reload now...');
      expect(reloadSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('downloadUpdatesInBackground', () => {
    it('should download updates and set pending version', async () => {
      const version = '1.1.0';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(service as any, 'updateServiceWorker').mockResolvedValue(undefined);

      await (service as any).downloadUpdatesInBackground(version);

      expect(localStorage.getItem('pendingUpdateVersion')).toBe(version);
      expect(consoleSpy).toHaveBeenCalledWith('Downloading updates in background...');
      expect(consoleSpy).toHaveBeenCalledWith(`Version ${version} downloaded and ready for next refresh`);

      consoleSpy.mockRestore();
    });
  });

  describe('performImmediateUpdate', () => {
    it('should perform immediate update and set version', async () => {
      const version = '1.1.0';
      jest.spyOn(service as any, 'clearAllCaches').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'clearStaticResourceCaches').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'clearApplicationCache').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'updateServiceWorker').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'forceReload').mockImplementation();

      await (service as any).performImmediateUpdate(version);

      expect(localStorage.getItem('lastVersionValidated')).toBe(version);
      expect(localStorage.getItem('pendingUpdateVersion')).toBeNull();
    });
  });

  describe('applySilentUpdate', () => {
    it('should apply silent update and set version', async () => {
      const version = '1.1.0';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(service as any, 'clearAllCaches').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'clearStaticResourceCaches').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'clearApplicationCache').mockResolvedValue(undefined);

      await (service as any).applySilentUpdate(version);

      expect(localStorage.getItem('lastVersionValidated')).toBe(version);
      expect(localStorage.getItem('pendingUpdateVersion')).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Applying silent update...');
      expect(consoleSpy).toHaveBeenCalledWith(`Silent update applied for version ${version}`);

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
