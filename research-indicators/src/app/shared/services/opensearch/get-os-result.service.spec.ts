import { TestBed } from '@angular/core/testing';
import { GetOsResultService } from './get-os-result.service';
import { ApiService } from '../api.service';

describe('GetOsResultService', () => {
  let service: GetOsResultService;
  let apiMock: Partial<ApiService>;

  const mockData = [
    { id: 1, title: 'Result 1' },
    { id: 2, title: 'Result 2' }
  ];

  beforeEach(() => {
    apiMock = {
      GET_OpenSearchResult: jest.fn().mockResolvedValue({
        data: mockData
      })
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: apiMock }]
    });
    service = TestBed.inject(GetOsResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debe inicializar con valores por defecto', () => {
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.isOpenSearch()).toBe(true);
  });

  it('update debe cargar datos correctamente con parámetros por defecto', async () => {
    const search = 'test search';

    await service.update(search);

    expect(apiMock.GET_OpenSearchResult).toHaveBeenCalledWith(search, 5);
    expect(service.list()).toEqual(mockData);
    expect(service.loading()).toBe(false);
  });

  it('update debe cargar datos con sampleSize personalizado', async () => {
    const search = 'test search';
    const sampleSize = 10;

    await service.update(search, sampleSize);

    expect(apiMock.GET_OpenSearchResult).toHaveBeenCalledWith(search, sampleSize);
    expect(service.list()).toEqual(mockData);
    expect(service.loading()).toBe(false);
  });

  it('update debe manejar errores correctamente', async () => {
    const search = 'test search';

    apiMock.GET_OpenSearchResult = jest.fn().mockRejectedValue(new Error('API Error'));

    await service.update(search);

    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('update debe setear loading a true al inicio y false al final', async () => {
    const search = 'test search';

    // Verificar que loading inicia en false
    expect(service.loading()).toBe(false);

    // Iniciar update
    const updatePromise = service.update(search);

    // Verificar que loading se setea a true inmediatamente
    expect(service.loading()).toBe(true);

    // Esperar a que termine
    await updatePromise;

    // Verificar que loading vuelve a false
    expect(service.loading()).toBe(false);
  });
});
