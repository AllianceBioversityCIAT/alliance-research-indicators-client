import { TestBed } from '@angular/core/testing';

import { PolicyStagesService } from './policy-stages.service';

describe('PolicyStagesService', () => {
  let service: PolicyStagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolicyStagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
