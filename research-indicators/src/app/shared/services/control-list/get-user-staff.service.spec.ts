import { TestBed } from '@angular/core/testing';

import { GetUserStaffService } from './get-user-staff.service';

describe('GetUserStaffService', () => {
  let service: GetUserStaffService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetUserStaffService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
