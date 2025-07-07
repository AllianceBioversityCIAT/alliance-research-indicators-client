import { TestBed } from '@angular/core/testing';

import { GetRegionsService } from './get-regions.service';

const mockRegions = [
  { um49Code: '001', name: 'Region 1' },
  { um49Code: '002', name: 'Region 2' }
];

describe('GetRegionsService', () => {
  let service: GetRegionsService;
  let apiMock: any;
  let listMock: any;
  let loadingMock: any;
  let isOpenSearchMock: any;

  beforeEach(() => {
    apiMock = {
      GET_Regions: jest.fn().mockResolvedValue({
        data: [
          { um49Code: '001', name: 'Region 1' },
          { um49Code: '002', name: 'Region 2' }
        ]
      })
    };
    listMock = jest.fn(() => []);
    listMock.set = jest.fn();
    loadingMock = jest.fn(() => true);
    loadingMock.set = jest.fn();
    isOpenSearchMock = jest.fn(() => false);
    isOpenSearchMock.set = jest.fn();
    // Instancia sin constructor
    service = Object.create(GetRegionsService.prototype);
    service.api = apiMock;
    service.list = listMock;
    service.loading = loadingMock;
    service.isOpenSearch = isOpenSearchMock;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('main should transform and set data correctly', async () => {
    await service.main();
    expect(apiMock.GET_Regions).toHaveBeenCalled();
    expect(listMock.set).toHaveBeenCalledWith([
      { um49Code: '001', name: 'Region 1', region_id: '001', sub_national_id: '001' },
      { um49Code: '002', name: 'Region 2', region_id: '002', sub_national_id: '002' }
    ]);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });

  it('initial list signal', () => {
    expect(service.list()).toEqual([]);
  });

  it('initial loading signal', () => {
    expect(service.loading()).toBe(true);
  });

  it('initial isOpenSearch signal', () => {
    expect(service.isOpenSearch()).toBe(false);
  });

  it('main maneja respuesta vacía', async () => {
    apiMock.GET_Regions.mockResolvedValueOnce({ data: [] });
    await service.main();
    expect(listMock.set).toHaveBeenCalledWith([]);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });

  it('main maneja respuesta null', async () => {
    apiMock.GET_Regions.mockResolvedValueOnce({ data: null });
    await service.main();
    expect(listMock.set).toHaveBeenCalledWith([]);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });

  it('main maneja respuesta undefined', async () => {
    apiMock.GET_Regions.mockResolvedValueOnce(undefined);
    await service.main();
    expect(listMock.set).toHaveBeenCalledWith([]);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });

  it('main maneja respuesta sin data', async () => {
    apiMock.GET_Regions.mockResolvedValueOnce({ status: 200 });
    await service.main();
    expect(listMock.set).toHaveBeenCalledWith([]);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });

  it('main maneja error en la API', async () => {
    apiMock.GET_Regions.mockRejectedValueOnce(new Error('API Error'));
    await service.main();
    expect(listMock.set).toHaveBeenCalledWith([]);
    expect(loadingMock.set).toHaveBeenCalledWith(false);
  });

  it('constructor llama main y setea signals correctamente', async () => {
    const apiService = {
      GET_Regions: jest.fn().mockResolvedValue({
        data: [{ um49Code: '003', name: 'Region 3' }]
      })
    };
    TestBed.configureTestingModule({
      providers: [GetRegionsService, { provide: require('./../api.service').ApiService, useValue: apiService }]
    });
    const realService = TestBed.inject(GetRegionsService);
    // Esperar a que main termine
    await new Promise(res => setTimeout(res, 0));
    expect(realService.list()).toEqual([{ um49Code: '003', name: 'Region 3', region_id: '003', sub_national_id: '003' }]);
    expect(realService.loading()).toBe(false);
    expect(realService.isOpenSearch()).toBe(false);
  });
});
