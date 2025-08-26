import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DriverjsService } from './driverjs.service';

describe('DriverjsService', () => {
  let service: DriverjsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(DriverjsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
