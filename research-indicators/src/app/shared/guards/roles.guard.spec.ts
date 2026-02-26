import { TestBed } from '@angular/core/testing';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { rolesGuard } from './roles.guard';
import { CacheService } from '@services/cache/cache.service';
import { cacheServiceMock } from 'src/app/testing/mock-services.mock';

const mockUrlTree = {} as UrlTree;
const mockRouter = {
  url: '/projects',
  createUrlTree: jest.fn().mockReturnValue(mockUrlTree)
};

// Mock the entire @angular/core module
jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  inject: jest.fn()
}));

describe('rolesGuard', () => {
  let mockCacheService: jest.Mocked<CacheService>;
  let mockRoute: any;
  let injectMock: jest.MockedFunction<any>;

  beforeEach(() => {
    mockCacheService = { ...cacheServiceMock } as jest.Mocked<CacheService>;
    mockCacheService.isLoggedIn.set(false);

    // Get the mocked inject function
    const { inject } = require('@angular/core');
    injectMock = inject as jest.MockedFunction<any>;
    injectMock.mockImplementation((token: unknown) => {
      if (token === Router) return mockRouter;
      return mockCacheService;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  describe('when route data has isLoggedIn: true', () => {
    beforeEach(() => {
      mockRoute = {
        data: { isLoggedIn: true }
      };
    });

    it('should return true when user is logged in', () => {
      mockCacheService.isLoggedIn.set(true);
      const result = rolesGuard(mockRoute, []);
      expect(result).toBe(true);
    });

    it('should return UrlTree to /login with returnUrl when user is not logged in', () => {
      mockCacheService.isLoggedIn.set(false);
      const segments = [{ path: 'projects', parameters: {} }];
      const result = rolesGuard(mockRoute, segments);
      expect(result).toBe(mockUrlTree);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/projects' } });
    });
  });

  describe('when route data has isLoggedIn: false', () => {
    beforeEach(() => {
      mockRoute = {
        data: { isLoggedIn: false }
      };
    });

    it('should return true when user is not logged in', () => {
      mockCacheService.isLoggedIn.set(false);
      const result = rolesGuard(mockRoute, []);
      expect(result).toBe(true);
    });

    it('should return false when user is logged in', () => {
      mockCacheService.isLoggedIn.set(true);
      const result = rolesGuard(mockRoute, []);
      expect(result).toBe(false);
    });
  });

  describe('when route data has no isLoggedIn property', () => {
    beforeEach(() => {
      mockRoute = {
        data: {}
      };
    });

    it('should return false when user is logged in', () => {
      mockCacheService.isLoggedIn.set(true);
      const result = rolesGuard(mockRoute, []);
      expect(result).toBe(false);
    });

    it('should return true when user is not logged in', () => {
      mockCacheService.isLoggedIn.set(false);
      const result = rolesGuard(mockRoute, []);
      expect(result).toBe(false);
    });
  });

  describe('when route data is undefined', () => {
    beforeEach(() => {
      mockRoute = {
        data: undefined
      };
    });

    it('should return false when user is logged in', () => {
      mockCacheService.isLoggedIn.set(true);
      const result = rolesGuard(mockRoute, []);
      expect(result).toBe(false);
    });

    it('should return false when user is not logged in', () => {
      mockCacheService.isLoggedIn.set(false);
      const result = rolesGuard(mockRoute, []);
      expect(result).toBe(false);
    });
  });

  describe('when route data is null', () => {
    beforeEach(() => {
      mockRoute = {
        data: null
      };
    });

    it('should return false when user is logged in', () => {
      mockCacheService.isLoggedIn.set(true);
      const result = rolesGuard(mockRoute, []);
      expect(result).toBe(false);
    });

    it('should return false when user is not logged in', () => {
      mockCacheService.isLoggedIn.set(false);
      const result = rolesGuard(mockRoute, []);
      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle route with no data property', () => {
      mockRoute = {};
      mockCacheService.isLoggedIn.set(false);
      const result = rolesGuard(mockRoute, []);
      expect(result).toBe(false);
    });

    it('should handle route with isLoggedIn as string "true"', () => {
      mockRoute = {
        data: { isLoggedIn: 'true' }
      };
      mockCacheService.isLoggedIn.set(true);
      const result = rolesGuard(mockRoute, []);
      expect(result).toBe(false);
    });

    it('should handle route with isLoggedIn as string "false"', () => {
      mockRoute = {
        data: { isLoggedIn: 'false' }
      };
      mockCacheService.isLoggedIn.set(false);
      const result = rolesGuard(mockRoute, []);
      expect(result).toBe(false);
    });
  });

  describe('function type validation', () => {
    it('should be a CanMatchFn', () => {
      expect(typeof rolesGuard).toBe('function');
      const canMatchFn: CanMatchFn = rolesGuard;
      expect(canMatchFn).toBeDefined();
    });
  });
});
