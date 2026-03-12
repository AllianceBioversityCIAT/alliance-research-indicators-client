import { TestBed } from '@angular/core/testing';
import { GetResultsService } from './get-results.service';
import { ResultFilter, ResultConfig } from '@interfaces/result/result.interface';
import { ApiService } from '@services/api.service';

describe('GetResultsService', () => {
  let service: GetResultsService;
  let apiService: any;

  const mockData = [
    { id: 1, name: 'Result 1' },
    { id: 2, name: 'Result 2' }
  ];

  const mockPagination = {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  };

  const mockResponse = {
    data: {
      data: mockData,
      pagination: mockPagination
    }
  };

  beforeEach(() => {
    apiService = {
      GET_Results: jest.fn().mockResolvedValue(mockResponse)
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
    apiService.GET_Results.mockResolvedValueOnce({ data: { data: [], pagination: mockPagination } });
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

  it('updateList handles response with data not an object with data array', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: 'not an array' });
    await service.updateList();
    expect(service.results()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('updateList handles response with flat array (backward compat)', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: mockData });
    await service.updateList();
    expect(service.results()).toEqual(mockData);
    expect(service.loading()).toBe(false);
  });

  it('getInstance returns data signal and pagination', async () => {
    const filter: ResultFilter = {} as any;
    const config: ResultConfig = {} as any;
    apiService.GET_Results.mockResolvedValueOnce({ data: { data: [{ id: 99 }], pagination: mockPagination } });

    const result = await service.getInstance(filter, config);

    expect(apiService.GET_Results).toHaveBeenCalledWith(filter, config);
    expect(result.data()).toEqual([{ id: 99 }]);
    expect(result.pagination).toEqual(mockPagination);
  });

  it('getInstance without resultConfig', async () => {
    const filter: ResultFilter = {} as any;
    apiService.GET_Results.mockResolvedValueOnce({ data: { data: [{ id: 77 }], pagination: mockPagination } });

    const result = await service.getInstance(filter);

    expect(apiService.GET_Results).toHaveBeenCalledWith(filter, undefined);
    expect(result.data()).toEqual([{ id: 77 }]);
  });

  it('getInstance handles empty response', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: { data: [], pagination: mockPagination } });

    const result = await service.getInstance({} as any);

    expect(result.data()).toEqual([]);
  });

  it('getInstance handles response null', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: null });

    const result = await service.getInstance({} as any);

    expect(result.data()).toEqual([]);
    expect(result.pagination).toBeNull();
  });

  it('getInstance handles response undefined', async () => {
    apiService.GET_Results.mockResolvedValueOnce(undefined);

    const result = await service.getInstance({} as any);

    expect(result.data()).toEqual([]);
    expect(result.pagination).toBeNull();
  });

  it('getInstance handles response without data', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ status: 200 });

    const result = await service.getInstance({} as any);

    expect(result.data()).toEqual([]);
  });

  it('getInstance handles response with data not an array', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: 'not an array' });

    const result = await service.getInstance({} as any);

    expect(result.data()).toEqual([]);
  });

  it('getInstance handles response with data as an object without data array', async () => {
    apiService.GET_Results.mockResolvedValueOnce({ data: { id: 1 } });

    const result = await service.getInstance({} as any);

    expect(result.data()).toEqual([]);
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

    expect(result.data()).toEqual([]);
    expect(result.pagination).toBeNull();
  });
});
