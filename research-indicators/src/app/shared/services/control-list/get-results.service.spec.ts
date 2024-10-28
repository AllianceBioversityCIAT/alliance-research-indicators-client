import { TestBed } from '@angular/core/testing';

import { GetResultsService } from './get-results.service';

describe('GetResultsService', () => {
  let service: GetResultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
