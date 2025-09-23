import { TestBed } from '@angular/core/testing';
import { runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { resultExistsResolver } from './result-exists.resolver';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { CurrentResultService } from '@shared/services/cache/current-result.service';
import { CacheService } from '@shared/services/cache/cache.service';

describe('resultExistsResolver', () => {
  let metadataService: any;
  let router: any;
  let route: any;
  let injector: any;
  let currentResultService: any;
  let cacheService: any;

  beforeEach(() => {
    const metadataServiceMock = {
      update: jest.fn()
    };

    const routerMock = {
      navigate: jest.fn()
    };

    const routeMock = {
      paramMap: {
        get: jest.fn()
      }
    };

    const currentResultServiceMock = {
      validateOpenResult: jest.fn().mockReturnValue(false),
      openEditRequestdOicrsModal: jest.fn()
    };

    const cacheServiceMock = {
      projectResultsSearchValue: {
        set: jest.fn()
      }
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: GetMetadataService, useValue: metadataServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: CurrentResultService, useValue: currentResultServiceMock },
        { provide: CacheService, useValue: cacheServiceMock }
      ]
    });

    injector = TestBed.inject(TestBed);
    metadataService = TestBed.inject(GetMetadataService);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    currentResultService = TestBed.inject(CurrentResultService);
    cacheService = TestBed.inject(CacheService);
  });

  it('should return true when metadata service update succeeds', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ canOpen: true });

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(route.paramMap.get).toHaveBeenCalledWith('id');
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should navigate to results-center and return false when metadata service update fails', async () => {
    // Arrange
    const id = 456;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ canOpen: false });

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(route.paramMap.get).toHaveBeenCalledWith('id');
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(router.navigate).toHaveBeenCalledWith(['/results-center']);
    expect(result).toBe(false);
  });

  it('should handle string id parameter correctly', async () => {
    // Arrange
    const id = '789';
    route.paramMap.get = jest.fn().mockReturnValue(id);
    metadataService.update = jest.fn().mockResolvedValue({ canOpen: true });

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(789, 'STAR');
    expect(result).toBe(true);
  });

  it('should handle null id parameter', async () => {
    // Arrange
    route.paramMap.get = jest.fn().mockReturnValue(null);
    metadataService.update = jest.fn().mockResolvedValue({ canOpen: false });

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(0, 'STAR');
    expect(router.navigate).toHaveBeenCalledWith(['/results-center']);
    expect(result).toBe(false);
  });

  it('should handle undefined id parameter', async () => {
    // Arrange
    route.paramMap.get = jest.fn().mockReturnValue(undefined);
    metadataService.update = jest.fn().mockResolvedValue({ canOpen: false });

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(NaN, 'STAR');
    expect(router.navigate).toHaveBeenCalledWith(['/results-center']);
    expect(result).toBe(false);
  });

  it('should handle invalid id parameter (non-numeric string)', async () => {
    // Arrange
    const id = 'invalid-id';
    route.paramMap.get = jest.fn().mockReturnValue(id);
    metadataService.update = jest.fn().mockResolvedValue({ canOpen: false });

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(NaN, 'invalid');
    expect(router.navigate).toHaveBeenCalledWith(['/results-center']);
    expect(result).toBe(false);
  });

  it('should handle zero id parameter', async () => {
    // Arrange
    const id = '0';
    route.paramMap.get = jest.fn().mockReturnValue(id);
    metadataService.update = jest.fn().mockResolvedValue({ canOpen: true });

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(0, 'STAR');
    expect(result).toBe(true);
  });

  it('should handle decimal id parameter', async () => {
    // Arrange
    const id = '123.45';
    route.paramMap.get = jest.fn().mockReturnValue(id);
    metadataService.update = jest.fn().mockResolvedValue({ canOpen: false });

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(123.45, 'STAR');
    expect(router.navigate).toHaveBeenCalledWith(['/results-center']);
    expect(result).toBe(false);
  });

  it('should handle metadata service throwing an error', async () => {
    // Arrange
    const id = 999;
    const error = new Error('Service error');
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockRejectedValue(error);

    // Act & Assert
    await expect(runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }))).rejects.toThrow('Service error');
    expect(route.paramMap.get).toHaveBeenCalledWith('id');
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle metadata service returning a promise that resolves to false', async () => {
    // Arrange
    const id = 555;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ canOpen: false });

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(router.navigate).toHaveBeenCalledWith(['/results-center']);
    expect(result).toBe(false);
  });
});
