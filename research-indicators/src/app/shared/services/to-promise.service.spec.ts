import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ToPromiseService } from './to-promise.service';
import { cacheServiceMock, mockGreenChecks } from 'src/app/testing/mock-services.mock';

const httpClientMock = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn()
} as unknown as HttpClient;

describe('ToPromiseService', () => {
  let service: ToPromiseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToPromiseService, { provide: HttpClient, useValue: httpClientMock }, { provide: 'CacheService', useValue: cacheServiceMock }]
    });
    service = TestBed.inject(ToPromiseService);
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('delete should call http.delete and return data', async () => {
    httpClientMock.delete = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    const res = await service.delete('/test-url');
    expect(res.data.foo).toBe('bar');
    expect(httpClientMock.delete).toHaveBeenCalled();
  });

  it('post should call http.post and return data', async () => {
    httpClientMock.post = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    const res = await service.post('/test-url', { a: 1 });
    expect(res.data.foo).toBe('bar');
    expect(httpClientMock.post).toHaveBeenCalled();
  });

  it('put should call http.put and return data', async () => {
    httpClientMock.put = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    const res = await service.put('/test-url', { a: 1 });
    expect(res.data.foo).toBe('bar');
    expect(httpClientMock.put).toHaveBeenCalled();
  });

  it('get should call http.get and return data', async () => {
    httpClientMock.get = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    const res = await service.get('/test-url');
    expect(res.data.foo).toBe('bar');
    expect(httpClientMock.get).toHaveBeenCalled();
  });

  it('getWithParams should call http.get with params and return data', async () => {
    httpClientMock.get = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    const res = await service.getWithParams('/test-url', { a: '1' });
    expect(res.data.foo).toBe('bar');
    expect(httpClientMock.get).toHaveBeenCalled();
  });

  it('patch should call http.patch and return data', async () => {
    httpClientMock.patch = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    const res = await service.patch('/test-url', { a: 1 });
    expect(res.data.foo).toBe('bar');
    expect(httpClientMock.patch).toHaveBeenCalled();
  });

  it('getEnv should return correct url based on isAuth', () => {
    expect(service.getEnv(true)).toContain('management');
    expect(service.getEnv(false)).toContain('main');
    expect(service.getEnv('custom')).toBe('custom');
  });

  it('getGreenChecks should call get and return data', async () => {
    jest.spyOn(service, 'get').mockResolvedValue(mockGreenChecks as any);
    const res = await service.getGreenChecks();
    expect(res).toBe(mockGreenChecks);
  });

  it('should handle error in TP', async () => {
    httpClientMock.get = jest.fn().mockReturnValue(throwError(() => ({ error: { foo: 'err' } })));
    const res = await service.get('/test-url');
    expect(res.successfulRequest).toBe(false);
    expect(res.errorDetail).toEqual({ foo: 'err' });
  });
});
