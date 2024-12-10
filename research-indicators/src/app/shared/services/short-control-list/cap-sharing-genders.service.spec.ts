import { TestBed } from '@angular/core/testing';

import { CapSharingGendersService } from './cap-sharing-genders.service';

describe('CapSharingGendersService', () => {
  let service: CapSharingGendersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapSharingGendersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
