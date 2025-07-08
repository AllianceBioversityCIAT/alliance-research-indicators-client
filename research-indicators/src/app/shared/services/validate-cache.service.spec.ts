import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SwUpdate } from '@angular/service-worker';

import { ValidateCacheService } from './validate-cache.service';
import { ApiService } from './api.service';

describe('ValidateCacheService', () => {
  let service: ValidateCacheService;
  let mockApiService: jest.Mocked<Partial<ApiService>>;
  let mockSwUpdate: jest.Mocked<Partial<SwUpdate>>;

  beforeEach(() => {
    const apiServiceMock = {
      GET_GithubVersion: jest.fn()
    };

    const swUpdateMock = {
      isEnabled: true,
      checkForUpdate: jest.fn(),
      activateUpdate: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ValidateCacheService, { provide: ApiService, useValue: apiServiceMock }, { provide: SwUpdate, useValue: swUpdateMock }]
    });

    service = TestBed.inject(ValidateCacheService);
    mockApiService = TestBed.inject(ApiService) as jest.Mocked<Partial<ApiService>>;
    mockSwUpdate = TestBed.inject(SwUpdate) as jest.Mocked<Partial<SwUpdate>>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save and get last version validated', () => {
    const version = '1.0.0';

    service.saveLastVersionValidated(version);
    const retrievedVersion = service.getLastVersionValidated();

    expect(retrievedVersion).toBe(version);
  });

  it('should clear last version validated', () => {
    const version = '1.0.0';
    service.saveLastVersionValidated(version);

    service.clearLastVersionValidated();
    const retrievedVersion = service.getLastVersionValidated();

    expect(retrievedVersion).toBeNull();
  });

  it('should validate versions and return early if same version exists', async () => {
    const version = '1.0.0';
    (mockApiService.GET_GithubVersion as jest.Mock).mockResolvedValue({ version });
    jest.spyOn(service, 'getLastVersionValidated').mockReturnValue(version);
    jest.spyOn(service, 'saveLastVersionValidated').mockImplementation(() => {});

    await service.validateVersions();

    expect(service.saveLastVersionValidated).not.toHaveBeenCalled();
  });
});
