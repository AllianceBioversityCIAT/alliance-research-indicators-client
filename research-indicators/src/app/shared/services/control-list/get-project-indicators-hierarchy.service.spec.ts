import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { GetProjectIndicatorsHierarchyService } from './get-project-indicators-hierarchy.service';
import { ApiService } from '../api.service';
import { ToPromiseService } from '../to-promise.service';
import { CacheService } from '../cache/cache.service';
import { ControlListCacheService } from '../control-list-cache.service';
import { SignalEndpointService } from '../signal-endpoint.service';

describe('GetProjectIndicatorsHierarchyService', () => {
  let service: GetProjectIndicatorsHierarchyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GetProjectIndicatorsHierarchyService, ApiService, ToPromiseService, CacheService, ControlListCacheService, SignalEndpointService]
    });
    service = TestBed.inject(GetProjectIndicatorsHierarchyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
