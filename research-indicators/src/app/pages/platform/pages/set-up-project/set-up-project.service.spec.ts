import { TestBed } from '@angular/core/testing';

import { SetUpProjectService } from './set-up-project.service';

describe('SetUpProjectService', () => {
  let service: SetUpProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SetUpProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
