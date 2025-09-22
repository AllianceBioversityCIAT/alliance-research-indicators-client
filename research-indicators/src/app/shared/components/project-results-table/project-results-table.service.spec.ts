import { TestBed } from '@angular/core/testing';

import { ProjectResultsTableService } from './project-results-table.service';

describe('ProjectResultsTableService', () => {
  let service: ProjectResultsTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectResultsTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
