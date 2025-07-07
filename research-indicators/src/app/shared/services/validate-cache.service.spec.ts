import { TestBed } from '@angular/core/testing';

import { ValidateCacheService } from './validate-cache.service';

describe('ValidateCacheService', () => {
  let service: ValidateCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidateCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
