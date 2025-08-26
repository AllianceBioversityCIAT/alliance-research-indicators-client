import { TestBed } from '@angular/core/testing';

import { DriverjsService } from './driverjs.service';

describe('DriverjsService', () => {
  let service: DriverjsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DriverjsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
