import { TestBed } from '@angular/core/testing';
import { GetInnoUseOutputService } from './get-innovation-use-output.service';

describe('GetInnoUseOutputService', () => {
  let service: GetInnoUseOutputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetInnoUseOutputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
