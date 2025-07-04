import { TestBed } from '@angular/core/testing';

import { CapSharingDeliveryModalitiesService } from './cap-sharing-delivery-modalities.service';

describe('CapSharingDeliveryModalitiesService', () => {
  let service: CapSharingDeliveryModalitiesService;
  let apiMock: any;
  let listMock: any;
  let loadingMock: any;

  const mockData = [
    { id: 1, name: 'Format 1' },
    { id: 2, name: 'Format 2' }
  ];

  beforeEach(() => {
    apiMock = {
      GET_DeliveryModalities: jest.fn().mockResolvedValue({ data: mockData })
    };
    listMock = Object.assign(() => [], { set: jest.fn() });
    loadingMock = Object.assign(() => false, { set: jest.fn() });
    service = Object.create(CapSharingDeliveryModalitiesService.prototype);
    service.api = apiMock;
    service.list = listMock;
    service.loading = loadingMock;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('main debe setear loading, llamar API y setear list correctamente', async () => {
    await service.main();
    expect(loadingMock.set).toHaveBeenCalledWith(true);
    expect(apiMock.GET_DeliveryModalities).toHaveBeenCalled();
    expect(listMock.set).toHaveBeenCalledWith(mockData);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });

  it('main debe manejar errores correctamente', async () => {
    apiMock.GET_DeliveryModalities = jest.fn().mockRejectedValue(new Error('fail'));
    try {
      await service.main();
    } catch (error) {
      // El error se propaga, pero loading.set(false) debe haberse ejecutado
    }
    expect(loadingMock.set).toHaveBeenCalledWith(true);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });
});
