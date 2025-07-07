import { TestBed } from '@angular/core/testing';
import { GetAllIndicatorsService } from './get-all-indicators.service';
import { ApiService } from '../api.service';

describe('GetAllIndicatorsService', () => {
  let service: GetAllIndicatorsService;
  let apiMock: any;

  const mockData = [
    { id: 1, name: 'Indicator 1' },
    { id: 2, name: 'Indicator 2' }
  ];

  beforeEach(() => {
    apiMock = {
      GET_AllIndicators: jest.fn().mockResolvedValue({ data: mockData })
    };

    TestBed.configureTestingModule({
      providers: [GetAllIndicatorsService, { provide: ApiService, useValue: apiMock }]
    });

    service = TestBed.inject(GetAllIndicatorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('main setea loading y list correctamente con datos válidos', async () => {
    await service.main();
    expect(apiMock.GET_AllIndicators).toHaveBeenCalled();
    expect(service.list()).toEqual(mockData);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta vacía', async () => {
    apiMock.GET_AllIndicators.mockResolvedValueOnce({ data: [] });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta null', async () => {
    apiMock.GET_AllIndicators.mockResolvedValueOnce({ data: null });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta undefined', async () => {
    apiMock.GET_AllIndicators.mockResolvedValueOnce(undefined);
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta sin data', async () => {
    apiMock.GET_AllIndicators.mockResolvedValueOnce({ status: 200 });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta con data no array', async () => {
    apiMock.GET_AllIndicators.mockResolvedValueOnce({ data: 'not an array' });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja error en la API', async () => {
    apiMock.GET_AllIndicators.mockRejectedValueOnce(new Error('API Error'));
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('getInstance retorna signal con datos válidos', async () => {
    const resultSignal = await service.getInstance();
    expect(apiMock.GET_AllIndicators).toHaveBeenCalled();
    expect(resultSignal()).toEqual(mockData);
  });

  it('getInstance maneja respuesta vacía', async () => {
    apiMock.GET_AllIndicators.mockResolvedValueOnce({ data: [] });
    const resultSignal = await service.getInstance();
    expect(resultSignal()).toEqual([]);
  });

  it('getInstance maneja respuesta null', async () => {
    apiMock.GET_AllIndicators.mockResolvedValueOnce({ data: null });
    const resultSignal = await service.getInstance();
    expect(resultSignal()).toEqual([]);
  });

  it('getInstance maneja respuesta undefined', async () => {
    apiMock.GET_AllIndicators.mockResolvedValueOnce(undefined);
    const resultSignal = await service.getInstance();
    expect(resultSignal()).toEqual([]);
  });

  it('getInstance maneja respuesta sin data', async () => {
    apiMock.GET_AllIndicators.mockResolvedValueOnce({ status: 200 });
    const resultSignal = await service.getInstance();
    expect(resultSignal()).toEqual([]);
  });

  it('getInstance maneja respuesta con data no array', async () => {
    apiMock.GET_AllIndicators.mockResolvedValueOnce({ data: 'not an array' });
    const resultSignal = await service.getInstance();
    expect(resultSignal()).toEqual([]);
  });

  it('getInstance maneja error en la API', async () => {
    apiMock.GET_AllIndicators.mockRejectedValueOnce(new Error('API Error'));
    const resultSignal = await service.getInstance();
    expect(resultSignal()).toEqual([]);
  });

  it('constructor inicializa signals correctamente y ejecuta main', async () => {
    // Esperar a que el constructor termine de ejecutar main
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(service.list()).toEqual(mockData);
    expect(service.loading()).toBe(false);
    expect(service.isOpenSearch()).toBe(false);
  });
});
