import { TestBed } from '@angular/core/testing';

import { GetRegionsService } from './get-regions.service';

describe('GetRegionsService', () => {
  let service: GetRegionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetRegionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
