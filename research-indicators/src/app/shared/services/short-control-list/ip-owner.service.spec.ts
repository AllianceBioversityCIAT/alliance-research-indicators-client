import { TestBed } from '@angular/core/testing';
import { IpOwnerService } from './ip-owner.service';

describe('IpOwnerService', () => {
  let service: IpOwnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpOwnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
