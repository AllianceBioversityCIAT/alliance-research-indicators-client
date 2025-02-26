import { TestBed } from '@angular/core/testing';

import { HotjarService } from './hotjar.service';

describe('HotjarService', () => {
  let service: HotjarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HotjarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
