import { TestBed } from '@angular/core/testing';
import { GetYearsService } from './get-years.service';
import { ApiService } from '../api.service';

describe('GetYearsService', () => {
  let service: GetYearsService;
  let apiMock: any;

  const mockData = [
    { id: 1, year: 2020 },
    { id: 2, year: 2021 },
    { id: 3, year: 2022 }
  ];

  beforeEach(() => {
    apiMock = {
      GET_Years: jest.fn().mockResolvedValue({ data: mockData })
    };

    TestBed.configureTestingModule({
      providers: [GetYearsService, { provide: ApiService, useValue: apiMock }]
    });

    service = TestBed.inject(GetYearsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('main setea loading y list correctamente con datos válidos', async () => {
    await service.main();
    expect(apiMock.GET_Years).toHaveBeenCalled();
    expect(service.list()).toEqual(mockData);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta vacía', async () => {
    apiMock.GET_Years.mockResolvedValueOnce({ data: [] });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta null', async () => {
    apiMock.GET_Years.mockResolvedValueOnce({ data: null });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta undefined', async () => {
    apiMock.GET_Years.mockResolvedValueOnce(undefined);
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta sin data', async () => {
    apiMock.GET_Years.mockResolvedValueOnce({ status: 200 });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta con data no array', async () => {
    apiMock.GET_Years.mockResolvedValueOnce({ data: 'not an array' });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja error en la API', async () => {
    apiMock.GET_Years.mockRejectedValueOnce(new Error('API Error'));
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('constructor inicializa signals correctamente y ejecuta main', async () => {
    // Esperar a que el constructor termine de ejecutar main
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(service.list()).toEqual(mockData);
    expect(service.loading()).toBe(false);
    expect(service.isOpenSearch()).toBe(false);
  });
});
