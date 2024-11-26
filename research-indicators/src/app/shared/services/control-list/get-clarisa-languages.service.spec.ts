import { TestBed } from '@angular/core/testing';

import { GetClarisaLanguagesService } from './get-clarisa-languages.service';

describe('GetClarisaLanguagesService', () => {
  let service: GetClarisaLanguagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetClarisaLanguagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
