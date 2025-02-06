import { TestBed } from '@angular/core/testing';

import { ResultsCenterService } from './results-center.service';

describe('ResultsCenterService', () => {
  let service: ResultsCenterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResultsCenterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
