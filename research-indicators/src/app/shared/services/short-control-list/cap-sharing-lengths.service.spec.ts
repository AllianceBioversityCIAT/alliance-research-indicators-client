import { TestBed } from '@angular/core/testing';

import { CapSharingLengthsService } from './cap-sharing-lengths.service';

describe('CapSharingLengthsService', () => {
  let service: CapSharingLengthsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapSharingLengthsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
