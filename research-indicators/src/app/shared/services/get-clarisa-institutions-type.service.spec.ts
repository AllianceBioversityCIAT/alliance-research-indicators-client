import { TestBed } from '@angular/core/testing';

import { GetClarisaInstitutionsTypesService } from './get-clarisa-institutions-type.service';

describe('GetClarisaInstitutionsTypesService', () => {
  let service: GetClarisaInstitutionsTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetClarisaInstitutionsTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
