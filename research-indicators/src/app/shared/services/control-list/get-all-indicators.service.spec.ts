import { TestBed } from '@angular/core/testing';

import { GetIndicatorsTypesService } from './get-indicators-types.service';

describe('GetIndicatorsTypesService', () => {
  let service: GetIndicatorsTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetIndicatorsTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
