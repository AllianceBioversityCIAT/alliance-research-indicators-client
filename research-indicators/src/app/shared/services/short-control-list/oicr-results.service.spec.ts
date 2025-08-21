import { TestBed } from '@angular/core/testing';
import { OicrResultsService } from './oicr-results.service';
import { ApiService } from '../../services/api.service';
import { Result } from '@shared/interfaces/result/result.interface';

class Deferred<T> {
  promise: Promise<T>;
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: (reason?: unknown) => void;
  constructor() {
    this.promise = new Promise<T>((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}

describe('OicrResultsService', () => {
  let service: OicrResultsService;
  let api: { GET_Results: jest.Mock };

  const makeService = () => {
    TestBed.configureTestingModule({
      providers: [OicrResultsService, { provide: ApiService, useValue: api }]
    });
    service = TestBed.inject(OicrResultsService);
  };

  beforeEach(() => {
    api = { GET_Results: jest.fn() };
  });

  test('éxito con array: mapea select_label y desactiva loading', async () => {
    const data: Result[] = [
      {
        is_active: true,
        result_id: 1,
        result_official_code: 'R1',
        version_id: null,
        title: 'Title 1',
        description: null,
        indicator_id: 5,
        geo_scope_id: null
      }
    ];
    api.GET_Results.mockResolvedValue({ data });

    makeService();

    await Promise.resolve();

    expect(api.GET_Results).toHaveBeenCalledWith(service.resultsFilter(), service.resultsConfig());
    expect(service.loading()).toBe(false);
    expect(service.list()[0].select_label).toBe('R1 - Title 1');
  });

  test('éxito con array: cubre ramas de label con valores vacíos', async () => {
    const data: Result[] = [
      {
        is_active: true,
        result_id: 2,
        result_official_code: '',
        version_id: null,
        title: '',
        description: null,
        indicator_id: 5,
        geo_scope_id: null
      },
      {
        is_active: true,
        result_id: 3,
        result_official_code: 'R2',
        version_id: null,
        title: '',
        description: null,
        indicator_id: 5,
        geo_scope_id: null
      },
      {
        is_active: true,
        result_id: 4,
        result_official_code: '',
        version_id: null,
        title: 'T3',
        description: null,
        indicator_id: 5,
        geo_scope_id: null
      }
    ];
    api.GET_Results.mockResolvedValue({ data });

    makeService();
    await Promise.resolve();

    const labels = service.list().map(x => x.select_label);
    expect(labels).toEqual(['-', 'R2 -', '- T3']);
  });

  test('éxito sin array: lista vacía y loading false', async () => {
    api.GET_Results.mockResolvedValue({ data: null });

    makeService();

    await Promise.resolve();

    expect(service.loading()).toBe(false);
    expect(service.list()).toEqual([]);
  });

  test('error: captura y lista vacía, loading false', async () => {
    api.GET_Results.mockRejectedValue(new Error('fail'));

    makeService();

    await Promise.resolve();

    expect(service.loading()).toBe(false);
    expect(service.list()).toEqual([]);
  });

  test('loading true mientras la petición está pendiente', async () => {
    const deferred = new Deferred<{ data: Result[] }>();
    api.GET_Results.mockReturnValue(deferred.promise);

    makeService();
    expect(service.loading()).toBe(true);

    deferred.resolve({ data: [] });
    await deferred.promise;
    await Promise.resolve();

    expect(service.loading()).toBe(false);
  });
});
