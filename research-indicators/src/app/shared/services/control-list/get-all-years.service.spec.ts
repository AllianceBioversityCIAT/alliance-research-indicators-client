import { TestBed } from '@angular/core/testing';

import { GetAllYearsService } from './get-all-years.service';

describe('GetAllYearsService', () => {
  let service: GetAllYearsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetAllYearsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
