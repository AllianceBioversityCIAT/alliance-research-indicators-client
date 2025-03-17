import { TestBed } from '@angular/core/testing';

import { GetContractsByUserService } from './get-contracts-by-user.service';

describe('GetContractsByUserService', () => {
  let service: GetContractsByUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetContractsByUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
