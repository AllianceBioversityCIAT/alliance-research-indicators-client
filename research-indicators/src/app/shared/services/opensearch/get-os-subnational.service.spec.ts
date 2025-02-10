import { TestBed } from '@angular/core/testing';

import { GetOsSubnationalService } from './get-os-subnational.service';

describe('GetOsSubnationalService', () => {
  let service: GetOsSubnationalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetOsSubnationalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
