import { TestBed } from '@angular/core/testing';

import { CapSharingTypesService } from './cap-sharing-types.service';

describe('CapSharingTypesService', () => {
  let service: CapSharingTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapSharingTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
