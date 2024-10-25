import { TestBed } from '@angular/core/testing';

import { AllModalsService } from './all-modals.service';

describe('AllModalsService', () => {
  let service: AllModalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllModalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
