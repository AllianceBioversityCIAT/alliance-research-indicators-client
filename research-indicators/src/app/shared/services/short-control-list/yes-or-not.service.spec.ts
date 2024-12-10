import { TestBed } from '@angular/core/testing';

import { YesOrNotService } from './yes-or-not.service';

describe('YesOrNotService', () => {
  let service: YesOrNotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YesOrNotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
