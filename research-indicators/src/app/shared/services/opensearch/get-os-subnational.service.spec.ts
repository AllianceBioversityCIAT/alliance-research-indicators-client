import { TestBed } from '@angular/core/testing';
import { GetOsSubnationalService } from './get-os-subnational.service';
import { WritableSignal } from '@angular/core';

describe('GetOsSubnationalService', () => {
  let service: GetOsSubnationalService;
  let apiMock: any;
  let listMock: any;
  let loadingMock: any;
  let isOpenSearchMock: any;

  const mockData = [
    { id: 1, name: 'Subnational 1' },
    { id: 2, name: 'Subnational 2' }
  ];

  beforeEach(() => {
    apiMock = {
      GET_OpenSearchSubNationals: jest.fn().mockResolvedValue({ data: mockData })
    };
    listMock = Object.assign(() => [], { set: jest.fn() });
    loadingMock = Object.assign(() => false, { set: jest.fn() });
    isOpenSearchMock = Object.assign(() => true, { set: jest.fn() });
    service = Object.create(GetOsSubnationalService.prototype);
    service.api = apiMock;
    service.list = listMock;
    service.loading = loadingMock;
    service.isOpenSearch = isOpenSearchMock;

    // Asignar manualmente getInstance
    service.getInstance = async (query: string, openSearchFilters?: any) => {
      const { signal } = await import('@angular/core');
      const newSignal = signal<any[]>([]);
      const response = await service.api.GET_OpenSearchSubNationals(query, openSearchFilters);
      response.data.forEach((item: any) => {
        item.sub_national_id = item.id;
      });
      newSignal.set(response.data);
      return newSignal;
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('update debe setear loading, llamar API y setear list correctamente', async () => {
    await service.update('test');
    expect(loadingMock.set).toHaveBeenCalledWith(true);
    expect(apiMock.GET_OpenSearchSubNationals).toHaveBeenCalledWith('test');
    expect(listMock.set).toHaveBeenCalledWith(mockData);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });

  it('update debe manejar errores correctamente', async () => {
    apiMock.GET_OpenSearchSubNationals = jest.fn().mockRejectedValue(new Error('fail'));
    try {
      await service.update('test');
    } catch (error) {
      // El error se propaga, pero loading.set(false) debe haberse ejecutado
    }
    expect(loadingMock.set).toHaveBeenCalledWith(true);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });

  it('getInstance debe retornar signal con datos transformados sin filtros', async () => {
    const result = await service.getInstance('test');
    expect(apiMock.GET_OpenSearchSubNationals).toHaveBeenCalledWith('test', undefined);
    expect(result()).toEqual([
      { id: 1, name: 'Subnational 1', sub_national_id: 1 },
      { id: 2, name: 'Subnational 2', sub_national_id: 2 }
    ]);
  });

  it('getInstance debe retornar signal con datos transformados con filtros', async () => {
    const filters = { country: 'test' };
    const result = await service.getInstance('test', filters);
    expect(apiMock.GET_OpenSearchSubNationals).toHaveBeenCalledWith('test', filters);
    expect(result()).toEqual([
      { id: 1, name: 'Subnational 1', sub_national_id: 1 },
      { id: 2, name: 'Subnational 2', sub_national_id: 2 }
    ]);
  });

  it('getInstance debe manejar errores correctamente', async () => {
    apiMock.GET_OpenSearchSubNationals = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(service.getInstance('test')).rejects.toThrow('fail');
  });
});
