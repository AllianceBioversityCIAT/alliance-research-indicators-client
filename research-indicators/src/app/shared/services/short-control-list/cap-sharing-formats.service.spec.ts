import { TestBed } from '@angular/core/testing';

import { CapSharingFormatsService } from './cap-sharing-formats.service';

describe('CapSharingFormatsService', () => {
  let service: CapSharingFormatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapSharingFormatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
