import { TestBed } from '@angular/core/testing';

import { GetGeoFocusService } from './get-geo-focus.service';

describe('GetGeoFocusService', () => {
  let service: GetGeoFocusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetGeoFocusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
