import { TestBed } from '@angular/core/testing';

import { GetSubnationalByIsoAlphaService } from './get-subnational-by-iso-alpha.service';

describe('GetSubnationalByIsoAlphaService', () => {
  let service: GetSubnationalByIsoAlphaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetSubnationalByIsoAlphaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
