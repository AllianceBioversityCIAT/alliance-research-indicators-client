import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ResultsCenterService } from './results-center.service';

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
