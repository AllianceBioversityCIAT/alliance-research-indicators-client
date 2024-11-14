import { TestBed } from '@angular/core/testing';

import { GetMetadataService } from './get-metadata.service';

describe('GetMetadataService', () => {
  let service: GetMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
