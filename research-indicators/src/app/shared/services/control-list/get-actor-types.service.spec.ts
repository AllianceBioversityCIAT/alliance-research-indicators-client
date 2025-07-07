import { TestBed } from '@angular/core/testing';
import { GetActorTypesService } from './get-actor-types.service';
import { ApiService } from '../api.service';

describe('GetActorTypesService', () => {
  let service: GetActorTypesService;
  let apiMock: any;

  const mockData = [
    { id: 1, name: 'Actor Type 1' },
    { id: 2, name: 'Actor Type 2' }
  ];

  beforeEach(() => {
    apiMock = {
      GET_ActorTypes: jest.fn().mockResolvedValue({ data: mockData })
    };

    TestBed.configureTestingModule({
      providers: [GetActorTypesService, { provide: ApiService, useValue: apiMock }]
    });

    service = TestBed.inject(GetActorTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('main setea loading y list correctamente con datos válidos', async () => {
    await service.main();
    expect(apiMock.GET_ActorTypes).toHaveBeenCalled();
    expect(service.list()).toEqual(mockData);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta vacía', async () => {
    apiMock.GET_ActorTypes.mockResolvedValueOnce({ data: [] });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta null', async () => {
    apiMock.GET_ActorTypes.mockResolvedValueOnce({ data: null });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta undefined', async () => {
    apiMock.GET_ActorTypes.mockResolvedValueOnce(undefined);
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta sin data', async () => {
    apiMock.GET_ActorTypes.mockResolvedValueOnce({ status: 200 });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja respuesta con data no array', async () => {
    apiMock.GET_ActorTypes.mockResolvedValueOnce({ data: 'not an array' });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main maneja error en la API', async () => {
    apiMock.GET_ActorTypes.mockRejectedValueOnce(new Error('API Error'));
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
