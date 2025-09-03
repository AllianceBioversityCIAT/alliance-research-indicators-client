import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  it('getEnv should return mainApiUrl if isAuth is undefined', () => {
    expect(service.getEnv(undefined)).toBe(require('../../../environments/environment').environment.mainApiUrl);
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

  it('TP sets loadingTrigger and calls finalize', async () => {
    const setSpy = jest.spyOn(service.cacheService.currentResultIsLoading, 'set');
    const greenChecksSpy = jest.spyOn(service.cacheService.greenChecks, 'set');
    httpClientMock.get = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    await service.get('/test-url', { loadingTrigger: true });
    expect(setSpy).toHaveBeenCalledWith(true);
    expect(setSpy).toHaveBeenCalledWith(false);
    expect(greenChecksSpy).toHaveBeenCalled();
  });

  it('delete sets X-Use-Year header if useResultInterceptor', async () => {
    httpClientMock.delete = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    await service.delete('/test-url', { useResultInterceptor: true });
    expect((httpClientMock.delete as jest.Mock).mock.calls[0][1].headers.get('X-Use-Year')).toBe('true');
  });

  it('post sets Authorization and refresh-token headers', async () => {
    httpClientMock.post = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    await service.post('/test-url', { a: 1 }, { token: 'abc', isRefreshToken: true });
    const headers = (httpClientMock.post as jest.Mock).mock.calls[0][2].headers;
    expect(headers.get('Authorization')).toBe('Bearer abc');
    expect(headers.get('refresh-token')).toBe('abc');
  });

  it('post sets X-Use-Year header', async () => {
    httpClientMock.post = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    await service.post('/test-url', { a: 1 }, { useResultInterceptor: true });
    const headers = (httpClientMock.post as jest.Mock).mock.calls[0][2].headers;
    expect(headers.get('X-Use-Year')).toBe('true');
  });

  it('put sets X-Use-Year header', async () => {
    httpClientMock.put = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    await service.put('/test-url', { a: 1 }, { useResultInterceptor: true });
    const headers = (httpClientMock.put as jest.Mock).mock.calls[0][2].headers;
    expect(headers.get('X-Use-Year')).toBe('true');
  });

  it('get sets X-Use-Year header', async () => {
    httpClientMock.get = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    await service.get('/test-url', { useResultInterceptor: true });
    const headers = (httpClientMock.get as jest.Mock).mock.calls[0][1].headers;
    expect(headers.get('X-Use-Year')).toBe('true');
  });

  it('getWithParams passes loadingTrigger', async () => {
    httpClientMock.get = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    await service.getWithParams('/test-url', { a: '1' }, { loadingTrigger: true });
    expect(httpClientMock.get).toHaveBeenCalled();
  });

  it('patch sets X-Use-Year header', async () => {
    httpClientMock.patch = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    await service.patch('/test-url', { a: 1 }, { useResultInterceptor: true });
    const headers = (httpClientMock.patch as jest.Mock).mock.calls[0][2].headers;
    expect(headers.get('X-Use-Year')).toBe('true');
  });

  it('delete handles error', async () => {
    httpClientMock.delete = jest.fn().mockReturnValue(throwError(() => ({ error: { foo: 'err' } })));
    const res = await service.delete('/test-url');
    expect(res.successfulRequest).toBe(false);
    expect(res.errorDetail).toEqual({ foo: 'err' });
  });

  it('post handles error', async () => {
    httpClientMock.post = jest.fn().mockReturnValue(throwError(() => ({ error: { foo: 'err' } })));
    const res = await service.post('/test-url', { a: 1 });
    expect(res.successfulRequest).toBe(false);
    expect(res.errorDetail).toEqual({ foo: 'err' });
  });

  it('put handles error', async () => {
    httpClientMock.put = jest.fn().mockReturnValue(throwError(() => ({ error: { foo: 'err' } })));
    const res = await service.put('/test-url', { a: 1 });
    expect(res.successfulRequest).toBe(false);
    expect(res.errorDetail).toEqual({ foo: 'err' });
  });

  it('patch handles error', async () => {
    httpClientMock.patch = jest.fn().mockReturnValue(throwError(() => ({ error: { foo: 'err' } })));
    const res = await service.patch('/test-url', { a: 1 });
    expect(res.successfulRequest).toBe(false);
    expect(res.errorDetail).toEqual({ foo: 'err' });
  });

  it('getWithParams handles error', async () => {
    httpClientMock.get = jest.fn().mockReturnValue(throwError(() => ({ error: { foo: 'err' } })));
    const res = await service.getWithParams('/test-url', { a: '1' });
    expect(res.successfulRequest).toBe(false);
    expect(res.errorDetail).toEqual({ foo: 'err' });
  });

  it('updateGreenChecks calls getGreenChecks and sets cache', async () => {
    const setSpy = jest.spyOn(service.cacheService.greenChecks, 'set');
    jest.spyOn(service, 'getGreenChecks').mockResolvedValue({ data: { test: 1 } } as any);
    await service.updateGreenChecks();
    expect(setSpy).toHaveBeenCalledWith({ test: 1 });
  });

  it('get sets noAuthInterceptor header', async () => {
    httpClientMock.get = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    await service.get('/test-url', { noAuthInterceptor: true });
    const headers = (httpClientMock.get as jest.Mock).mock.calls[0][1].headers;
    expect(headers.get('no-auth-interceptor')).toBe('true');
  });

  it('get sets noCache option', async () => {
    httpClientMock.get = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    await service.get('/test-url', { noCache: true });
    const options = (httpClientMock.get as jest.Mock).mock.calls[0][1];
    expect(options.cache).toBe('no-store');
  });

  it('get uses existing HttpHeaders when params is HttpHeaders instance', async () => {
    const existingHeaders = new HttpHeaders({ 'Custom-Header': 'value' });
    httpClientMock.get = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    await service.get('/test-url', { params: existingHeaders });
    const headers = (httpClientMock.get as jest.Mock).mock.calls[0][1].headers;
    expect(headers.get('Custom-Header')).toBe('value');
  });

  it('get combines existing headers with X-Use-Year', async () => {
    const existingHeaders = new HttpHeaders({ 'Custom-Header': 'value' });
    httpClientMock.get = jest.fn().mockReturnValue(of({ data: { foo: 'bar' } }));
    await service.get('/test-url', { params: existingHeaders, useResultInterceptor: true });
    const headers = (httpClientMock.get as jest.Mock).mock.calls[0][1].headers;
    expect(headers.get('Custom-Header')).toBe('value');
    expect(headers.get('X-Use-Year')).toBe('true');
  });

  it('TP handles error without error.error property', async () => {
    httpClientMock.get = jest.fn().mockReturnValue(throwError(() => ({ message: 'Network error' })));
    const res = await service.get('/test-url');
    expect(res.successfulRequest).toBe(false);
    expect(res.errorDetail).toBeUndefined();
  });

  it('TP handles error with null error object', async () => {
    httpClientMock.get = jest.fn().mockReturnValue(throwError(() => null));
    const res = await service.get('/test-url');
    expect(res.successfulRequest).toBe(false);
    expect(res.errorDetail).toBeUndefined();
  });
});
