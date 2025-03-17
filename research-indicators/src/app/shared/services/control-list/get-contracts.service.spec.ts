import { TestBed } from '@angular/core/testing';

import { GetContractsService } from './get-contracts.service';

describe('GetContractsService', () => {
  let service: GetContractsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetContractsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
