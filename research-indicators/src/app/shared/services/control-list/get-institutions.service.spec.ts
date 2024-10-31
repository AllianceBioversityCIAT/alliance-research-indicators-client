import { TestBed } from '@angular/core/testing';

import { GetInstitutionsService } from './get-institutions.service';

describe('GetInstitutionsService', () => {
  let service: GetInstitutionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetInstitutionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
