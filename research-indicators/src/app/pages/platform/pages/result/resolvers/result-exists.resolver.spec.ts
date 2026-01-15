import { TestBed } from '@angular/core/testing';
import { runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { resultExistsResolver } from './result-exists.resolver';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { CurrentResultService } from '@shared/services/cache/current-result.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { RolesService } from '@shared/services/cache/roles.service';

describe('resultExistsResolver', () => {
  let metadataService: any;
  let router: any;
  let route: any;
  let injector: any;
  let currentResultService: any;
  let cacheService: any;
  let rolesService: any;

  beforeEach(() => {
    const metadataServiceMock = {
      update: jest.fn()
    };

    const routerMock = {
      navigate: jest.fn(),
      url: ''
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
      },
      dataCache: jest.fn().mockReturnValue({
        user: {
          user_role_list: []
        }
      })
    };

    const rolesServiceMock = {
      isAdmin: jest.fn().mockReturnValue(false)
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: GetMetadataService, useValue: metadataServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: CurrentResultService, useValue: currentResultServiceMock },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: RolesService, useValue: rolesServiceMock }
      ]
    });

    injector = TestBed.inject(TestBed);
    metadataService = TestBed.inject(GetMetadataService);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    currentResultService = TestBed.inject(CurrentResultService);
    cacheService = TestBed.inject(CacheService);
    rolesService = TestBed.inject(RolesService);
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

  it('should handle string ID with dash parsing (TP-123 format)', async () => {
    // Arrange
    const idParam = 'TP-123';
    route.paramMap.get = jest.fn().mockReturnValue(idParam);
    metadataService.update = jest.fn().mockResolvedValue({ canOpen: true });

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(123, 'TP');
    expect(result).toBe(true);
  });

  it('should handle string ID with multiple dashes (PRMS-456-789 format)', async () => {
    // Arrange
    const idParam = 'PRMS-456-789';
    route.paramMap.get = jest.fn().mockReturnValue(idParam);
    metadataService.update = jest.fn().mockResolvedValue({ canOpen: true });

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(789, 'PRMS');
    expect(result).toBe(true);
  });

  it('should handle validateOpenResult returning true and navigate to project-detail', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: 1,
      status_id: 2,
      result_official_code: 3,
      result_contract_id: 456,
      result_title: 'Test Project'
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/some-other-path';

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(1, 2);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', 456]);
    expect(cacheService.projectResultsSearchValue.set).toHaveBeenCalledWith('Test Project');
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(1, 2, 3);
    expect(result).toBe(false);
  });

  it('should handle validateOpenResult returning true but not set cache when already on project-detail', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: 1,
      status_id: 2,
      result_official_code: 3,
      result_contract_id: 456,
      result_title: 'Test Project'
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/project-detail/456';

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(1, 2);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', 456]);
    expect(cacheService.projectResultsSearchValue.set).not.toHaveBeenCalled();
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(1, 2, 3);
    expect(result).toBe(false);
  });

  it('should handle validateOpenResult returning false and return true', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: 1,
      status_id: 2
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(false);

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(1, 2);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should handle metadata service returning null/undefined values', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: null,
      status_id: undefined,
      result_official_code: null,
      result_contract_id: undefined,
      result_title: null
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(false);

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(0, 0);
    expect(result).toBe(true);
  });

  it('should handle metadata service returning null/undefined response', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue(null);

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(router.navigate).toHaveBeenCalledWith(['/results-center']);
    expect(result).toBe(false);
  });

  it('should handle metadata service returning undefined response', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue(undefined);

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(router.navigate).toHaveBeenCalledWith(['/results-center']);
    expect(result).toBe(false);
  });

  it('should handle validateOpenResult returning true with null result_contract_id', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: 1,
      status_id: 2,
      result_official_code: 3,
      result_contract_id: null,
      result_title: 'Test Project'
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/some-other-path';

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(1, 2);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', null]);
    expect(cacheService.projectResultsSearchValue.set).toHaveBeenCalledWith('Test Project');
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(1, 2, 3);
    expect(result).toBe(false);
  });

  it('should handle validateOpenResult returning true with undefined result_contract_id', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: 1,
      status_id: 2,
      result_official_code: 3,
      result_contract_id: undefined,
      result_title: 'Test Project'
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/some-other-path';

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(1, 2);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', undefined]);
    expect(cacheService.projectResultsSearchValue.set).toHaveBeenCalledWith('Test Project');
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(1, 2, 3);
    expect(result).toBe(false);
  });

  it('should handle validateOpenResult returning true with null result_title', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: 1,
      status_id: 2,
      result_official_code: 3,
      result_contract_id: 456,
      result_title: null
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/some-other-path';

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(1, 2);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', 456]);
    expect(cacheService.projectResultsSearchValue.set).toHaveBeenCalledWith('');
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(1, 2, 3);
    expect(result).toBe(false);
  });

  it('should handle validateOpenResult returning true with undefined result_title', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: 1,
      status_id: 2,
      result_official_code: 3,
      result_contract_id: 456,
      result_title: undefined
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/some-other-path';

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(1, 2);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', 456]);
    expect(cacheService.projectResultsSearchValue.set).toHaveBeenCalledWith('');
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(1, 2, 3);
    expect(result).toBe(false);
  });

  it('should handle validateOpenResult returning true with null result_official_code', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: 1,
      status_id: 2,
      result_official_code: null,
      result_contract_id: 456,
      result_title: 'Test Project'
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/some-other-path';

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(1, 2);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', 456]);
    expect(cacheService.projectResultsSearchValue.set).toHaveBeenCalledWith('Test Project');
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(1, 2, 0);
    expect(result).toBe(false);
  });

  it('should handle validateOpenResult returning true with undefined result_official_code', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: 1,
      status_id: 2,
      result_official_code: undefined,
      result_contract_id: 456,
      result_title: 'Test Project'
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/some-other-path';

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(1, 2);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', 456]);
    expect(cacheService.projectResultsSearchValue.set).toHaveBeenCalledWith('Test Project');
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(1, 2, 0);
    expect(result).toBe(false);
  });

  it('should handle validateOpenResult returning true with all null values', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: null,
      status_id: null,
      result_official_code: null,
      result_contract_id: null,
      result_title: null
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/some-other-path';

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(0, 0);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', null]);
    expect(cacheService.projectResultsSearchValue.set).toHaveBeenCalledWith('');
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(0, 0, 0);
    expect(result).toBe(false);
  });

  it('should handle validateOpenResult returning true with all undefined values', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: undefined,
      status_id: undefined,
      result_official_code: undefined,
      result_contract_id: undefined,
      result_title: undefined
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/some-other-path';

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(0, 0);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', undefined]);
    expect(cacheService.projectResultsSearchValue.set).toHaveBeenCalledWith('');
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(0, 0, 0);
    expect(result).toBe(false);
  });

  it('should return true when validateOpenResult returns true and status_id is draft (4)', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: 1,
      status_id: 4,
      result_official_code: 3,
      result_contract_id: 456,
      result_title: 'Test Project'
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/some-other-path';

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(1, 4);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', 456]);
    expect(cacheService.projectResultsSearchValue.set).toHaveBeenCalledWith('Test Project');
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(1, 4, 3);
    expect(result).toBe(false);
  });

  it('should return false and open modal when validateOpenResult returns true and status_id is Published (14)', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: 1,
      status_id: 14,
      result_official_code: 3,
      result_contract_id: 456,
      result_title: 'Test Project'
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/some-other-path';
    cacheService.dataCache = jest.fn().mockReturnValue({
      user: {
        user_role_list: [{ role_id: 9 }] // Admin user
      }
    });

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(1, 14);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', 456]);
    expect(cacheService.projectResultsSearchValue.set).toHaveBeenCalledWith('Test Project');
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(1, 14, 3);
    expect(result).toBe(false);
  });

  it('should return false and open modal when validateOpenResult returns true and status_id is Science Edition (12)', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: 1,
      status_id: 12,
      result_official_code: 3,
      result_contract_id: 456,
      result_title: 'Test Project'
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/some-other-path';
    rolesService.isAdmin = jest.fn().mockReturnValue(false); // Not admin - should open modal

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(1, 12);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', 456]);
    expect(cacheService.projectResultsSearchValue.set).toHaveBeenCalledWith('Test Project');
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(1, 12, 3);
    expect(result).toBe(false);
  });

  it('should return false and open modal when validateOpenResult returns true and status_id is KM Curation (13)', async () => {
    // Arrange
    const id = 123;
    route.paramMap.get = jest.fn().mockReturnValue(id.toString());
    metadataService.update = jest.fn().mockResolvedValue({ 
      canOpen: true,
      indicator_id: 1,
      status_id: 13,
      result_official_code: 3,
      result_contract_id: 456,
      result_title: 'Test Project'
    });
    currentResultService.validateOpenResult = jest.fn().mockReturnValue(true);
    router.url = '/some-other-path';
    rolesService.isAdmin = jest.fn().mockReturnValue(false); // Not admin - should open modal

    // Act
    const result = await runInInjectionContext(injector, () => resultExistsResolver(route, { url: '', root: {} as any }));

    // Assert
    expect(metadataService.update).toHaveBeenCalledWith(id, 'STAR');
    expect(currentResultService.validateOpenResult).toHaveBeenCalledWith(1, 13);
    expect(router.navigate).toHaveBeenCalledWith(['/project-detail', 456]);
    expect(cacheService.projectResultsSearchValue.set).toHaveBeenCalledWith('Test Project');
    expect(currentResultService.openEditRequestdOicrsModal).toHaveBeenCalledWith(1, 13, 3);
    expect(result).toBe(false);
  });
});
