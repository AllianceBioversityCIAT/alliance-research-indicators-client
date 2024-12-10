import { TestBed } from '@angular/core/testing';

import { CapSharingDeliveryModalitiesService } from './cap-sharing-delivery-modalities.service';

describe('CapSharingDeliveryModalitiesService', () => {
  let service: CapSharingDeliveryModalitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapSharingDeliveryModalitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
