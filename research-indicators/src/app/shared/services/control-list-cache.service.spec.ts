import { TestBed } from '@angular/core/testing';

import { ControlListCacheService } from './control-list-cache.service';

describe('ControlListCacheService', () => {
  let service: ControlListCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControlListCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
