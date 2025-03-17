import { TestBed } from '@angular/core/testing';

import { CapSharingSessionPurposeService } from './cap-sharing-session-purpose.service';

describe('CapSharingSessionPurposeService', () => {
  let service: CapSharingSessionPurposeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapSharingSessionPurposeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
