import { TestBed } from '@angular/core/testing';

import { PolicyTypesService } from './policy-types.service';

describe('PolicyTypesService', () => {
  let service: PolicyTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolicyTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
