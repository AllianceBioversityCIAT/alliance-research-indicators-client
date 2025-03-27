import { TestBed } from '@angular/core/testing';

import { BugHerdService } from './bug-herd.service';

describe('BugHerdService', () => {
  let service: BugHerdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BugHerdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
