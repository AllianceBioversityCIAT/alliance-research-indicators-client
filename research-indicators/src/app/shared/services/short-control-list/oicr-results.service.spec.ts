import { TestBed } from '@angular/core/testing';
import { OicrResultsService } from './oicr-results.service';
import { ApiService } from '../../services/api.service';
import { Oicr } from '@shared/interfaces/oicr-creation.interface';

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
  let api: { GET_OicrResults: jest.Mock };

  const makeService = () => {
    TestBed.configureTestingModule({
      providers: [OicrResultsService, { provide: ApiService, useValue: api }]
    });
    service = TestBed.inject(OicrResultsService);
  };

  beforeEach(() => {
    api = { GET_OicrResults: jest.fn() };
  });

  test('success with array: maps select_label and disables loading', async () => {
    const data: Oicr[] = [
      {
        id: 1,
        title: 'Title 1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_active: true,
        result_status: 'active',
        maturity_level: 'high',
        report_year: '2024'
      }
    ];
    api.GET_OicrResults.mockResolvedValue({ data });

    makeService();

    await Promise.resolve();

    expect(api.GET_OicrResults).toHaveBeenCalled();
    expect(service.loading()).toBe(false);
    expect((service.list()[0] as any).select_label).toBe('1 - Title 1');
  });

  test('success with array: covers label branches with empty values', async () => {
    const data: Oicr[] = [
      {
        id: 2,
        title: '',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_active: true,
        result_status: 'active',
        maturity_level: 'high',
        report_year: '2024'
      },
      {
        id: 3,
        title: 'T2',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_active: true,
        result_status: 'active',
        maturity_level: 'high',
        report_year: '2024'
      },
      {
        id: 0,
        title: 'T3',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        is_active: true,
        result_status: 'active',
        maturity_level: 'high',
        report_year: '2024'
      }
    ];
    api.GET_OicrResults.mockResolvedValue({ data });

    makeService();
    await Promise.resolve();

    const labels = service.list().map(x => (x as any).select_label);
    expect(labels).toEqual(['2 -', '3 - T2', '0 - T3']);
  });

  test('success without array: empty list and loading false', async () => {
    api.GET_OicrResults.mockResolvedValue({ data: null });

    makeService();

    await Promise.resolve();

    expect(service.loading()).toBe(false);
    expect(service.list()).toEqual([]);
  });

  test('error: captures and lists empty, loading false', async () => {
    api.GET_OicrResults.mockRejectedValue(new Error('fail'));

    makeService();

    await Promise.resolve();

    expect(service.loading()).toBe(false);
    expect(service.list()).toEqual([]);
  });

  test('loading true while the request is pending', async () => {
    const deferred = new Deferred<{ data: Oicr[] }>();
    api.GET_OicrResults.mockReturnValue(deferred.promise);

    makeService();
    expect(service.loading()).toBe(true);

    deferred.resolve({ data: [] });
    await deferred.promise;
    await Promise.resolve();

    expect(service.loading()).toBe(false);
  });

  test('update method sets resultsFilter', () => {
    makeService();
    const filter = { test: 'value' };

    service.update(filter);

    expect(service.resultsFilter).toEqual(filter);
  });

  test('generateSelectLabel with empty values', () => {
    makeService();

    // Test con valores vacíos
    const emptyItem: Oicr = {
      id: 0,
      title: '',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      is_active: true,
      result_status: 'active',
      maturity_level: 'high',
      report_year: '2024'
    };

    // Acceder al método privado a través de la instancia
    const result = (service as any).generateSelectLabel(emptyItem);
    expect(result).toBe('0 -');
  });
});
