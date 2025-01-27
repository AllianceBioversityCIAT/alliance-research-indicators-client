import { TestBed } from '@angular/core/testing';

import { GetOsResultService } from './get-os-result.service';

describe('GetOsResultService', () => {
  let service: GetOsResultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetOsResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
