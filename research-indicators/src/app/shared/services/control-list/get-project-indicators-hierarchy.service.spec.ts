import { TestBed } from '@angular/core/testing';

import { GetProjectIndicatorsHierarchyService } from './get-project-indicators-hierarchy.service';

describe('GetProjectIndicatorsHierarchyService', () => {
  let service: GetProjectIndicatorsHierarchyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetProjectIndicatorsHierarchyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
