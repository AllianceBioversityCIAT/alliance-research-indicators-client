import { TestBed } from '@angular/core/testing';

import { GetOsCountriesService } from './get-os-countries.service';

describe('GetOsCountriesService', () => {
  let service: GetOsCountriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetOsCountriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
