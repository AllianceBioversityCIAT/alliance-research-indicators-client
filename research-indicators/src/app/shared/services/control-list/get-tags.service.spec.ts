import { TestBed } from '@angular/core/testing';
import { GetTagsService } from './get-tags.service';
import { ApiService } from '../api.service';
import { GetTags } from '@shared/interfaces/get-tags.interface';

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

describe('GetTagsService', () => {
  let service: GetTagsService;
  let api: { GET_Tags: jest.Mock };

  const makeService = () => {
    TestBed.configureTestingModule({
      providers: [GetTagsService, { provide: ApiService, useValue: api }]
    });
    service = TestBed.inject(GetTagsService);
  };

  beforeEach(() => {
    api = { GET_Tags: jest.fn() };
  });

  test('éxito con array: setea lista y desactiva loading', async () => {
    const tags: GetTags[] = [
      { id: 1, name: 't1', is_active: true, created_at: 'c1', updated_at: 'u1' },
      { id: 2, name: 't2', is_active: false, created_at: 'c2', updated_at: 'u2' }
    ];
    api.GET_Tags.mockResolvedValue({ data: tags });

    makeService();

    await Promise.resolve();

    expect(api.GET_Tags).toHaveBeenCalledTimes(1);
    expect(service.loading()).toBe(false);
    expect(service.list()).toEqual(tags);
  });

  test('éxito sin array: setea lista vacía y desactiva loading', async () => {
    api.GET_Tags.mockResolvedValue({ data: null });

    makeService();

    await Promise.resolve();

    expect(service.loading()).toBe(false);
    expect(service.list()).toEqual([]);
  });

  test('error: captura, setea lista vacía y desactiva loading', async () => {
    api.GET_Tags.mockRejectedValue(new Error('fail'));

    makeService();

    await Promise.resolve();

    expect(service.loading()).toBe(false);
    expect(service.list()).toEqual([]);
  });

  test('loading true mientras la petición está pendiente', async () => {
    const deferred = new Deferred<{ data: GetTags[] }>();
    api.GET_Tags.mockReturnValue(deferred.promise);

    makeService();

    expect(service.loading()).toBe(true);

    deferred.resolve({ data: [] });
    await deferred.promise;
    await Promise.resolve();

    expect(service.loading()).toBe(false);
    expect(service.list()).toEqual([]);
  });
});
