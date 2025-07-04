import { TestBed } from '@angular/core/testing';

import { GetOsCountriesService } from './get-os-countries.service';

describe('GetOsCountriesService', () => {
  let service: GetOsCountriesService;
  let apiMock: any;
  let listMock: any;
  let loadingMock: any;

  beforeEach(() => {
    apiMock = {
      GET_OpenSearchCountries: jest.fn().mockResolvedValue({ data: [{ id: 1, name: 'country1' }] })
    };
    listMock = Object.assign(() => [], { set: jest.fn() });
    loadingMock = Object.assign(() => false, { set: jest.fn() });
    service = Object.create(GetOsCountriesService.prototype);
    service.api = apiMock;
    service.list = listMock;
    service.loading = loadingMock;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('update should set loading, call API and set list correctly', async () => {
    await service.update('test');
    expect(loadingMock.set).toHaveBeenCalledWith(true);
    expect(apiMock.GET_OpenSearchCountries).toHaveBeenCalledWith('test');
    expect(listMock.set).toHaveBeenCalledWith([{ id: 1, name: 'country1' }]);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });

  it('update should handle errors correctly', async () => {
    apiMock.GET_OpenSearchCountries = jest.fn().mockRejectedValue(new Error('fail'));
    try {
      await service.update('test');
    } catch (error) {
      // The error is propagated, but loading.set(false) should have been called
    }
    expect(loadingMock.set).toHaveBeenCalledWith(true);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });
});
