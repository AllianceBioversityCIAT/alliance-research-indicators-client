import { TestBed } from '@angular/core/testing';

import { SignalUtilsService } from './signal-utils.service';

describe('SignalUtilsService', () => {
  let service: SignalUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignalUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
