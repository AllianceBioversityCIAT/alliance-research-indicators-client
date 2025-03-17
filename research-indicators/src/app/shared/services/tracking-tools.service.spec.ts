import { TestBed } from '@angular/core/testing';

import { TrackingToolsService } from './tracking-tools.service';

describe('TrackingToolsService', () => {
  let service: TrackingToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackingToolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
