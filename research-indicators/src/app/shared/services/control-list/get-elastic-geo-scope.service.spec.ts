import { TestBed } from '@angular/core/testing';

import { GetElasticGeoScopeService } from './get-elastic-geo-scope.service';

describe('GetElasticGeoScopeService', () => {
  let service: GetElasticGeoScopeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetElasticGeoScopeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
