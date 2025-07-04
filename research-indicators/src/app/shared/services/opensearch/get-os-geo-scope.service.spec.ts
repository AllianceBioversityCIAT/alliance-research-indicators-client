import { TestBed } from '@angular/core/testing';

import { GetOsGeoScopeService } from './get-os-geo-scope.service';

describe('GetOsGeoScopeService', () => {
  let service: GetOsGeoScopeService;
  let apiMock: any;
  let listMock: any;
  let loadingMock: any;
  let isOpenSearchMock: any;

  beforeEach(() => {
    apiMock = {
      GET_GeoSearch: jest.fn().mockResolvedValue({ data: [{ id: 1, name: 'geo1' }] })
    };
    listMock = Object.assign(() => [], { set: jest.fn() });
    loadingMock = Object.assign(() => false, { set: jest.fn() });
    isOpenSearchMock = Object.assign(() => true, { set: jest.fn() });
    service = Object.create(GetOsGeoScopeService.prototype);
    service.api = apiMock;
    service.list = listMock;
    service.loading = loadingMock;
    service.isOpenSearch = isOpenSearchMock;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('update debe setear loading, llamar API y setear list correctamente', async () => {
    await service.update('geo-scope', 'test');
    expect(loadingMock.set).toHaveBeenCalledWith(true);
    expect(apiMock.GET_GeoSearch).toHaveBeenCalledWith('geo-scope', 'test');
    expect(listMock.set).toHaveBeenCalledWith([{ id: 1, name: 'geo1' }]);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });

  it('update debe manejar errores correctamente', async () => {
    apiMock.GET_GeoSearch = jest.fn().mockRejectedValue(new Error('fail'));
    try {
      await service.update('geo-scope', 'test');
    } catch (error) {
      // El error se propaga, pero loading.set(false) debe haberse ejecutado
    }
    expect(loadingMock.set).toHaveBeenCalledWith(true);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });
});
