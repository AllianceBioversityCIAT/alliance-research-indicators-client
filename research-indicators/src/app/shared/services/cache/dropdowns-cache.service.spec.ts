import { TestBed } from '@angular/core/testing';

import { DropdownsCacheService } from './dropdowns-cache.service';

describe('DropdownsCacheService', () => {
  let service: DropdownsCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropdownsCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
