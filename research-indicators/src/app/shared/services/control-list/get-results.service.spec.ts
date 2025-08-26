import { TestBed } from '@angular/core/testing';
import { GetResultsService } from './get-results.service';
import { ResultFilter, ResultConfig, Result } from '@interfaces/result/result.interface';
import { ApiService } from '@services/api.service';
import { signal } from '@angular/core';

describe('GetResultsService', () => {
  let service: GetResultsService;
  let apiService: any;

  const mockData = [
    { id: 1, name: 'Result 1' },
    { id: 2, name: 'Result 2' }
  ];

  beforeEach(() => {
    apiService = {
      GET_Results: jest.fn().mockResolvedValue({ data: mockData })
    };

    TestBed.configureTestingModule({
      providers: [GetResultsService, { provide: ApiService, useValue: apiService }]
    });

    service = TestBed.inject(GetResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('constructor calls updateList and sets initial values', () => {
    expect(service.results()).toEqual(mockData);
    expect(service.loading()).toBe(false);
    expect(service.isOpenSearch()).toBe(false);
  });

  it('updateList sets loading and results correctly', async () => {
    await service.updateList();
    expect(apiService.GET_Results).toHaveBeenCalledWith({});
    expect(service.results()).toEqual(mockData);
    expect(service.loading()).toBe(false);
  });

  it('updateList handles empty response', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: [] });
    await service.updateList();
    expect(service.results()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('updateList handles response null', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: null });
    await service.updateList();
    expect(service.results()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('updateList handles response undefined', async () => {
    apiService.GET_Results.mockResolvedValueOnce(undefined);
    await service.updateList();
    expect(service.results()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('updateList handles response without data', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ status: 200 });
    await service.updateList();
    expect(service.results()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('updateList handles response with data not an array', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: 'not an array' });
    await service.updateList();
    expect(service.results()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('updateList handles response with data as an object', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: { id: 1 } });
    await service.updateList();
    expect(service.results()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('getInstance returns a signal with the data', async () => {
    const filter: ResultFilter = {} as any;
    const config: ResultConfig = {} as any;
    apiService.GET_Results.mockResolvedValueOnce({ data: [{ id: 99 }] });

    const result = await service.getInstance(filter, config);

    expect(apiService.GET_Results).toHaveBeenCalledWith(filter, config);
    expect(result()).toEqual([{ id: 99 }]);
  });

  it('getInstance without resultConfig', async () => {
    const filter: ResultFilter = {} as any;
    apiService.GET_Results.mockResolvedValueOnce({ data: [{ id: 77 }] });

    const result = await service.getInstance(filter);

    expect(apiService.GET_Results).toHaveBeenCalledWith(filter, undefined);
    expect(result()).toEqual([{ id: 77 }]);
  });

  it('getInstance handles empty response', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: [] });

    const result = await service.getInstance({} as any);

    expect(result()).toEqual([]);
  });

  it('getInstance handles response null', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: null });

    const result = await service.getInstance({} as any);

    expect(result()).toEqual([]);
  });

  it('getInstance handles response undefined', async () => {
    apiService.GET_Results.mockResolvedValueOnce(undefined);

    const result = await service.getInstance({} as any);

    expect(result()).toEqual([]);
  });

  it('getInstance handles response without data', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ status: 200 });

    const result = await service.getInstance({} as any);

    expect(result()).toEqual([]);
  });

  it('getInstance handles response with data not an array', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: 'not an array' });

    const result = await service.getInstance({} as any);

    expect(result()).toEqual([]);
  });

  it('getInstance handles response with data as an object', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: { id: 1 } });

    const result = await service.getInstance({} as any);

    expect(result()).toEqual([]);
  });

  it('updateList handles API error', async () => {
    apiService.GET_Results.mockRejectedValueOnce(new Error('API Error'));

    await service.updateList();

    expect(service.loading()).toBe(false);
    expect(service.results()).toEqual([]);
  });

  it('getInstance handles API error', async () => {
    apiService.GET_Results.mockRejectedValueOnce(new Error('API Error'));

    const result = await service.getInstance({} as any);

    expect(result()).toEqual([]);
  });
});
