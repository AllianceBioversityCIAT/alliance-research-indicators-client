import { TestBed } from '@angular/core/testing';

import { GetOsGeoScopeService } from './get-os-geo-scope.service';

describe('GetOsGeoScopeService', () => {
  let service: GetOsGeoScopeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetOsGeoScopeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
