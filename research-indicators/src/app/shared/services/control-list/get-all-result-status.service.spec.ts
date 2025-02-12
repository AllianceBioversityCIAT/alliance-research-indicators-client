import { TestBed } from '@angular/core/testing';

import { GetAllResultStatusService } from './get-all-result-status.service';

describe('GetAllResultStatusService', () => {
  let service: GetAllResultStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetAllResultStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
