import { TestBed } from '@angular/core/testing';

import { GetLeversService } from './get-levers.service';

describe('GetLeversService', () => {
  let service: GetLeversService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetLeversService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
