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
      GET_Contracts: jest.fn().mockResolvedValue({ data: mockData })
    };

    TestBed.configureTestingModule({
      providers: [GetContractsService, { provide: ApiService, useValue: apiMock }]
    });

    service = TestBed.inject(GetContractsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load contracts successfully and update with select_label and contract_id', async () => {
    await service.main();
    expect(apiMock.GET_Contracts).toHaveBeenCalled();
    expect(service.list()).toEqual([
      {
        agreement_id: 'A1',
        description: 'Contract 1',
        select_label: 'A1 - Contract 1',
        contract_id: 'A1'
      },
      {
        agreement_id: 'A2',
        description: 'Contract 2',
        select_label: 'A2 - Contract 2',
        contract_id: 'A2'
      }
    ]);
    expect(service.loading()).toBe(false);
  });

  it('should handle response with no data', async () => {
    apiMock.GET_Contracts.mockResolvedValueOnce({ data: null });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should handle undefined response', async () => {
    apiMock.GET_Contracts.mockResolvedValueOnce(undefined);
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should handle response without data property', async () => {
    apiMock.GET_Contracts.mockResolvedValueOnce({ status: 200 });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should handle response with data not array', async () => {
    apiMock.GET_Contracts.mockResolvedValueOnce({ data: 'not an array' });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should handle empty array response', async () => {
    apiMock.GET_Contracts.mockResolvedValueOnce({ data: [] });
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should handle API errors', async () => {
    apiMock.GET_Contracts.mockRejectedValueOnce(new Error('API Error'));
    await service.main();
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('should execute initialize correctly', () => {
    const mainSpy = jest.spyOn(service, 'main').mockImplementation();
    service.initialize();
    expect(mainSpy).toHaveBeenCalled();
  });

  it('constructor calls initialize and sets up signals correctly', async () => {
    // Esperar a que el constructor termine de ejecutar initialize
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(service.list()).toEqual([
      {
        agreement_id: 'A1',
        description: 'Contract 1',
        select_label: 'A1 - Contract 1',
        contract_id: 'A1'
      },
      {
        agreement_id: 'A2',
        description: 'Contract 2',
        select_label: 'A2 - Contract 2',
        contract_id: 'A2'
      }
    ]);
    expect(service.loading()).toBe(false);
    expect(service.isOpenSearch()).toBe(false);
  });
});
