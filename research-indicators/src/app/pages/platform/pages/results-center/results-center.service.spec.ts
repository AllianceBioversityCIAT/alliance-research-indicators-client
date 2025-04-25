import { TestBed } from '@angular/core/testing';
import { ResultsCenterService } from './results-center.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ResultsCenterService', () => {
  let service: ResultsCenterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ResultsCenterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
