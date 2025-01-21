import { TestBed } from '@angular/core/testing';
import { GetInnoDevOutputService } from './get-innovation-dev-output.service';

describe('GetInnoDevOutputService', () => {
  let service: GetInnoDevOutputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetInnoDevOutputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
