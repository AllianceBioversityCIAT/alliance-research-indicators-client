import { TestBed } from '@angular/core/testing';
import { GetContractsService } from './get-contracts.service';
import { ApiService } from '../api.service';

describe('GetContractsService', () => {
  let service: GetContractsService;
  let apiMock: any;

  const mockData = [
    { agreement_id: 'A1', description: 'Contract 1' },
    { agreement_id: 'A2', description: 'Contract 2' }
  ];

  beforeEach(() => {
    apiMock = {
      GET_FindContracts: jest.fn().mockResolvedValue({ data: { data: mockData } })
    };

    TestBed.configureTestingModule({
      providers: [GetContractsService, { provide: ApiService, useValue: apiMock }]
    });

    service = TestBed.inject(GetContractsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch and transform contracts successfully', async () => {
    await service.main();
    const result = service.list();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      agreement_id: 'A1',
      description: 'Contract 1',
      select_label: 'A1 - Contract 1',
      contract_id: 'A1'
    });
    expect(result[1]).toEqual({
      agreement_id: 'A2',
      description: 'Contract 2',
      select_label: 'A2 - Contract 2',
      contract_id: 'A2'
    });
    expect(service.loading()).toBe(false);
  });

  it('should handle response with no data', async () => {
    apiMock.GET_FindContracts.mockResolvedValueOnce({ data: null });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should handle undefined response', async () => {
    apiMock.GET_FindContracts.mockResolvedValueOnce(undefined);
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should handle response without data property', async () => {
    apiMock.GET_FindContracts.mockResolvedValueOnce({ status: 200 });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should handle response with data not array', async () => {
    apiMock.GET_FindContracts.mockResolvedValueOnce({ data: { data: 'not an array' } });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should handle empty array response', async () => {
    apiMock.GET_FindContracts.mockResolvedValueOnce({ data: { data: [] } });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should handle API errors', async () => {
    apiMock.GET_FindContracts.mockRejectedValueOnce(new Error('API Error'));
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should execute initialize correctly', () => {
    const mainSpy = jest.spyOn(service, 'main').mockImplementation();
    service.initialize();
    expect(mainSpy).toHaveBeenCalled();
  });

});
