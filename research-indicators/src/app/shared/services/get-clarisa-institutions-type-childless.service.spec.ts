import { TestBed } from '@angular/core/testing';

import { GetClarisaInstitutionsTypesChildlessService } from './get-clarisa-institutions-type-childless.service';

describe('GetClarisaInstitutionsTypesChildlessService', () => {
  let service: GetClarisaInstitutionsTypesChildlessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetClarisaInstitutionsTypesChildlessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
