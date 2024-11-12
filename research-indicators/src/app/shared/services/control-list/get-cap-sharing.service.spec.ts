import { TestBed } from '@angular/core/testing';

import { GetCapSharingService } from './get-cap-sharing.service';

describe('GetCapSharingService', () => {
  let service: GetCapSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetCapSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
