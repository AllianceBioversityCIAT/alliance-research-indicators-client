import { TestBed } from '@angular/core/testing';
import { GetInitiativesService } from './get-initiatives.service';
import { ApiService } from '../api.service';
import { Initiative } from '@shared/interfaces/initiative.interface';

class Deferred<T> {
  promise: Promise<T>;
  resolve!: (value: T) => void;
  reject!: (reason?: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

describe('GetInitiativesService', () => {
  let service: GetInitiativesService;
  let api: { GET_Initiatives: jest.Mock };

  const makeService = () => {
    TestBed.configureTestingModule({
      providers: [GetInitiativesService, { provide: ApiService, useValue: api }]
    });
    service = TestBed.inject(GetInitiativesService);
  };

  beforeEach(() => {
    api = { GET_Initiatives: jest.fn() };
    jest.clearAllMocks();
  });

  it('should be created', () => {
    makeService();
    expect(service).toBeTruthy();
  });

  test('éxito con array: mapea iniciativas y desactiva loading', async () => {
    const data: Initiative[] = [
      { initiative_id: 1, name: 'Initiative 1', description: 'Desc 1', is_active: true },
      { initiative_id: 2, name: 'Initiative 2', description: 'Desc 2', is_active: true }
    ];
    api.GET_Initiatives.mockResolvedValue({ data });
    makeService();
    await Promise.resolve();
    expect(service.list()).toEqual(data);
    expect(service.loading()).toBe(false);
  });

  test('éxito sin array: desactiva loading y vacía señal', async () => {
    api.GET_Initiatives.mockResolvedValue({ data: null });
    makeService();
    await Promise.resolve();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  test('éxito con respuesta sin data: desactiva loading y vacía señal', async () => {
    api.GET_Initiatives.mockResolvedValue({});
    makeService();
    await Promise.resolve();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  test('éxito con data no array: desactiva loading y vacía señal', async () => {
    api.GET_Initiatives.mockResolvedValue({ data: 'not an array' });
    makeService();
    await Promise.resolve();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  test('error: desactiva loading y vacía señal', async () => {
    api.GET_Initiatives.mockRejectedValue(new Error('API Error'));
    makeService();
    await Promise.resolve();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  test('constructor llama main automáticamente', async () => {
    const data: Initiative[] = [{ initiative_id: 1, name: 'Test Initiative', description: 'Test Desc', is_active: true }];
    api.GET_Initiatives.mockResolvedValue({ data });

    makeService();
    await Promise.resolve();

    expect(api.GET_Initiatives).toHaveBeenCalled();
    expect(service.list()).toEqual(data);
    expect(service.loading()).toBe(false);
  });

  test('loading inicia en true y cambia a false', async () => {
    const deferred = new Deferred<{ data: Initiative[] }>();
    api.GET_Initiatives.mockReturnValue(deferred.promise);

    makeService();
    expect(service.loading()).toBe(true);

    deferred.resolve({ data: [] });
    await Promise.resolve();

    expect(service.loading()).toBe(false);
  });

  test('isOpenSearch inicia en false', () => {
    makeService();
    expect(service.isOpenSearch()).toBe(false);
  });
});
