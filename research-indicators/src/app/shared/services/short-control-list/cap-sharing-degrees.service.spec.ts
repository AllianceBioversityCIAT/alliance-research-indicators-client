import { TestBed } from '@angular/core/testing';

import { CapSharingDegreesService } from './cap-sharing-degrees.service';

describe('CapSharingDegreesService', () => {
  let service: CapSharingDegreesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapSharingDegreesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
