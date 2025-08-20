import { TestBed } from '@angular/core/testing';
import { InnResultsService } from './inn-results.service';
import { ApiService } from '../api.service';

describe('InnResultsService', () => {
  let service: InnResultsService;
  let apiMock: { GET_Results: jest.Mock };

  const defaultFilter = { 'indicator-codes': [2], 'lever-codes': [], 'create-user-codes': [] };
  const defaultConfig = {
    indicators: true,
    'result-status': true,
    contracts: true,
    'primary-contract': true,
    'primary-lever': true,
    levers: true,
    'audit-data': true,
    'audit-data-object': true
  };

  const setup = async (response: any, reject = false) => {
    apiMock = {
      GET_Results: reject ? jest.fn().mockRejectedValue(new Error('fail')) : jest.fn().mockResolvedValue(response)
    };
    TestBed.configureTestingModule({ providers: [InnResultsService, { provide: ApiService, useValue: apiMock }] });
    service = TestBed.inject(InnResultsService);
    await Promise.resolve();
  };

  it('should create', async () => {
    await setup({ data: [] });
    expect(service).toBeTruthy();
  });

  it('main success with array maps select_label and stops loading', async () => {
    const data = [
      { id: 1, result_official_code: 'R-001', title: 'Result A' },
      { id: 2, result_official_code: 'R-002', title: 'Result B' }
    ];
    await setup({ data });
    expect(apiMock.GET_Results).toHaveBeenCalledWith(defaultFilter, defaultConfig);
    expect(service.list().length).toBe(2);
    expect((service.list()[0] as any).select_label).toBe('R-001 - Result A');
    expect(service.loading()).toBe(false);
    expect(service.isOpenSearch()).toBe(false);
  });

  it('main success handles undefined result_official_code in select_label', async () => {
    const data = [
      { id: 1, result_official_code: undefined, title: 'Result A' },
      { id: 2, result_official_code: '', title: 'Result B' }
    ];
    await setup({ data });
    expect(service.list().length).toBe(2);
    expect((service.list()[0] as any).select_label).toBe('- Result A');
    expect((service.list()[1] as any).select_label).toBe('- Result B');
    expect(service.loading()).toBe(false);
  });

  it('main success handles undefined title in select_label', async () => {
    const data = [
      { id: 1, result_official_code: 'R-001', title: undefined },
      { id: 2, result_official_code: 'R-002', title: '' }
    ];
    await setup({ data });
    expect(service.list().length).toBe(2);
    expect((service.list()[0] as any).select_label).toBe('R-001 -');
    expect((service.list()[1] as any).select_label).toBe('R-002 -');
    expect(service.loading()).toBe(false);
  });

  it('main success with non-array sets empty', async () => {
    await setup({ data: null });
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('main catch sets empty and stops loading', async () => {
    await setup(undefined, true);
    expect(service.list()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('uses updated filter and config on manual main call', async () => {
    await setup({ data: [] });
    const newFilter = { 'indicator-codes': [2, 4], 'lever-codes': [3], 'create-user-codes': [7] } as any;
    const newConfig = { ...defaultConfig, contracts: false, indicators: false } as any;
    service.resultsFilter.set(newFilter);
    service.resultsConfig.set(newConfig);

    apiMock.GET_Results.mockResolvedValueOnce({ data: [] });
    await service.main();
    expect(apiMock.GET_Results).toHaveBeenCalledWith(newFilter, newConfig);
    expect(service.loading()).toBe(false);
  });
});
