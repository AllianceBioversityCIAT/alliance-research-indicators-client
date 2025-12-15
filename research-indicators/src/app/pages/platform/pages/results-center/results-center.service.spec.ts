import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { MenuItem } from 'primeng/api';

import { ResultsCenterService } from './results-center.service';
import { ApiService } from '../../../../shared/services/api.service';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { GetResultsService } from '../../../../shared/services/control-list/get-results.service';
import { Result } from '../../../../shared/interfaces/result/result.interface';
import { GetAllIndicators } from '../../../../shared/interfaces/get-all-indicators.interface';

describe('ResultsCenterService', () => {
  let service: ResultsCenterService;
  let mockApiService: jest.Mocked<ApiService>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockGetResultsService: jest.Mocked<GetResultsService>;

  const mockUser = {
    sec_user_id: 123
  };

  const mockDataCache = {
    user: mockUser
  };

  const mockIndicatorTabs = {
    lazy: () => ({
      list: signal<GetAllIndicators[]>([
        { indicator_id: 1, name: 'Indicator 1', able: true, active: false },
        { indicator_id: 2, name: 'Indicator 2', able: true, active: false }
      ]),
      isLoading: signal(false),
      hasValue: signal(true)
    })
  };

  const mockResults = [
    {
      result_official_code: 'RES001',
      title: 'Test Result',
      indicators: { name: 'Test Indicator' },
      result_status: { name: 'SUBMITTED' },
      result_contracts: { contract_id: 'CON001' },
      result_levers: { lever: { short_name: 'LEV1' } },
      report_year_id: 2024,
      snapshot_years: [2023, 2024],
      created_by_user: { first_name: 'John', last_name: 'Doe' },
      created_at: '2024-01-01T00:00:00Z'
    }
  ] as any;

  beforeEach(() => {
    const mockApiServiceObj = {
      indicatorTabs: mockIndicatorTabs
    } as any;

    const mockCacheServiceObj = {
      dataCache: signal(mockDataCache)
    } as any;

    const mockGetResultsServiceObj = {
      getInstance: jest.fn().mockReturnValue(signal(mockResults))
    } as any;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ResultsCenterService,
        { provide: ApiService, useValue: mockApiServiceObj },
        { provide: CacheService, useValue: mockCacheServiceObj },
        { provide: GetResultsService, useValue: mockGetResultsServiceObj }
      ]
    });

    service = TestBed.inject(ResultsCenterService);
    mockApiService = TestBed.inject(ApiService) as jest.Mocked<ApiService>;
    mockCacheService = TestBed.inject(CacheService) as jest.Mocked<CacheService>;
    mockGetResultsService = TestBed.inject(GetResultsService) as jest.Mocked<GetResultsService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should initialize with default values', () => {
      expect(service.hasFilters()).toBe(false);
      expect(service.showFiltersSidebar()).toBe(false);
      expect(service.showConfigurationSidebar()).toBe(false);
      expect(service.loading()).toBe(false);
      expect(service.list()).toEqual([]);
      expect(service.searchInput()).toBe('');
      expect(service.showConfigurationsSidebar()).toBe(false);
      expect(service.confirmFiltersSignal()).toBe(false);
    });

    it('should initialize myResultsFilterItems correctly', () => {
      expect(service.myResultsFilterItems).toEqual([
        { id: 'all', label: 'All Results' },
        { id: 'my', label: 'My Results' }
      ]);
    });

    it('should initialize myResultsFilterItem with first item', () => {
      expect(service.myResultsFilterItem()).toEqual(service.myResultsFilterItems[0]);
    });

    it('should initialize resultsFilter with default values', () => {
      const filter = service.resultsFilter();
      expect(filter['indicator-codes']).toEqual([]);
      expect(filter['lever-codes']).toEqual([]);
      expect(filter['create-user-codes']).toEqual([]);
    });

    it('should initialize resultsConfig with default values', () => {
      const config = service.resultsConfig();
      expect(config.indicators).toBe(true);
      expect(config['result-status']).toBe(true);
      expect(config.contracts).toBe(true);
      expect(config['primary-contract']).toBe(true);
      expect(config['primary-lever']).toBe(true);
      expect(config.levers).toBe(true);
      expect(config['audit-data']).toBe(true);
      expect(config['audit-data-object']).toBe(true);
    });
  });

  describe('Table columns', () => {
    it('should have correct table columns configuration', () => {
      const columns = service.tableColumns();
      expect(columns.length).toBeGreaterThan(0);

      const codeColumn = columns.find(col => col.field === 'result_official_code');
      expect(codeColumn).toBeDefined();
      expect(codeColumn?.header).toBe('Code');
      expect(codeColumn?.filter).toBe(true);
    });

    it('should get title value correctly', () => {
      const columns = service.tableColumns();
      const titleColumn = columns.find(col => col.field === 'title');
      const getValue = titleColumn?.getValue;

      if (getValue) {
        const result = { title: 'Test Title---' } as Result;
        expect(getValue(result)).toBe('Test Title');
      }
    });

    it('should get indicator value correctly', () => {
      const columns = service.tableColumns();
      const indicatorColumn = columns.find(col => col.field === 'indicator_id');
      const getValue = indicatorColumn?.getValue;

      if (getValue) {
        const result = { indicators: { name: 'Test Indicator' } } as Result;
        expect(getValue(result)).toBe('Test Indicator');
      }
    });

    it('should get status value correctly', () => {
      const columns = service.tableColumns();
      const statusColumn = columns.find(col => col.field === 'status');
      const getValue = statusColumn?.getValue;

      if (getValue) {
        const result = { result_status: { name: 'SUBMITTED' } } as Result;
        expect(getValue(result)).toBe('SUBMITTED');
      }
    });

    it('should get creator value correctly', () => {
      const columns = service.tableColumns();
      const creatorColumn = columns.find(col => col.field === 'creator');
      const getValue = creatorColumn?.getValue;

      if (getValue) {
        const result = {
          created_by_user: { first_name: 'John', last_name: 'Doe' }
        } as Result;
        expect(getValue(result)).toBe('John Doe');
      }
    });

    it('should get creation date value correctly', () => {
      const columns = service.tableColumns();
      const dateColumn = columns.find(col => col.field === 'creation_date');
      const getValue = dateColumn?.getValue;

      if (getValue) {
        const result = { created_at: '2024-01-01T00:00:00Z' } as Result;
        const dateValue = getValue(result);
        expect(dateValue).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      }
    });

    it('should get versions value correctly', () => {
      const columns = service.tableColumns();
      const versionsColumn = columns.find(col => col.field === 'versions');
      const getValue = versionsColumn?.getValue;

      if (getValue) {
        const result = { snapshot_years: [2023, 2024] } as Result;
        expect(getValue(result)).toEqual([2023, 2024]);
      }
    });
  });

  describe('getAllPathsAsArray', () => {
    it('should return array of filterable column paths', () => {
      const paths = service.getAllPathsAsArray();
      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe('getActiveFilters', () => {
    it('should return empty array when no filters are active', () => {
      const filters = service.getActiveFilters();
      expect(filters).toEqual([]);
    });

    it('should return INDICATOR TAB when indicator-codes-tabs has items', () => {
      service.appliedFilters.update(prev => ({
        ...prev,
        'indicator-codes-tabs': [1, 2]
      }));

      const filters = service.getActiveFilters();
      expect(filters).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'INDICATOR TAB' })]));
    });

    it('should return INDICATOR when indicator-codes-filter has items', () => {
      service.appliedFilters.update(prev => ({
        ...prev,
        'indicator-codes-filter': [1, 2]
      }));
      service.tableFilters.update(prev => ({
        ...prev,
        indicators: [
          { indicator_id: 1, name: 'Ind 1' },
          { indicator_id: 2, name: 'Ind 2' }
        ] as any
      }));

      const filters = service.getActiveFilters();
      expect(filters).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'INDICATOR' })]));
    });

    it('should return STATUS when status-codes has items', () => {
      service.appliedFilters.update(prev => ({
        ...prev,
        'status-codes': [1, 2]
      }));
      service.tableFilters.update(prev => ({
        ...prev,
        statusCodes: [
          { result_status_id: 1, name: 'A' },
          { result_status_id: 2, name: 'B' }
        ] as any
      }));

      const filters = service.getActiveFilters();
      expect(filters).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'STATUS' })]));
    });

    it('should return PROJECT when contract-codes has items', () => {
      service.appliedFilters.update(prev => ({
        ...prev,
        'contract-codes': ['C1', 'C2']
      }));
      service.tableFilters.update(prev => ({
        ...prev,
        contracts: [
          { agreement_id: 'C1', display_label: 'C1' },
          { agreement_id: 'C2', display_label: 'C2' }
        ] as any
      }));

      const filters = service.getActiveFilters();
      expect(filters).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'PROJECT' })]));
    });

    it('should return LEVER when lever-codes has items', () => {
      service.appliedFilters.update(prev => ({
        ...prev,
        'lever-codes': [1, 2]
      }));
      service.tableFilters.update(prev => ({
        ...prev,
        levers: [
          { id: 1, short_name: 'L1' },
          { id: 2, short_name: 'L2' }
        ] as any
      }));

      const filters = service.getActiveFilters();
      expect(filters).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'LEVER' })]));
    });

    it('should return YEAR when years has items', () => {
      service.appliedFilters.update(prev => ({
        ...prev,
        years: [2023, 2024]
      }));
      service.tableFilters.update(prev => ({
        ...prev,
        years: [
          { id: 2023, name: '2023' },
          { id: 2024, name: '2024' }
        ]
      }));

      const filters = service.getActiveFilters();
      expect(filters).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'YEAR' })]));
    });

    it('should return multiple filters when multiple are active', () => {
      service.appliedFilters.update(prev => ({
        ...prev,
        'status-codes': [1],
        'lever-codes': [2],
        years: [2024]
      }));
      service.tableFilters.update(prev => ({
        ...prev,
        statusCodes: [{ result_status_id: 1, name: 'A' }] as any,
        levers: [{ id: 2, short_name: 'L2' }] as any,
        years: [{ report_year: 2024 }]
      }));

      const filters = service.getActiveFilters();
      expect(filters).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'STATUS' })]));
      expect(filters).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'LEVER' })]));
      expect(filters).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'YEAR' })]));
    });
  });

  describe('countFiltersSelected', () => {
    it('should return undefined when no filters are selected', () => {
      const count = service.countFiltersSelected();
      expect(count).toBeUndefined();
    });

    it('should return count when filters are selected', () => {
      service.resultsFilter.update(prev => ({
        ...prev,
        'status-codes': [1, 2],
        'lever-codes': [3]
      }));

      const count = service.countFiltersSelected();
      expect(count).toBe('3');
    });

    it('should exclude create-user-codes and indicator-codes-tabs from count', () => {
      service.resultsFilter.update(prev => ({
        ...prev,
        'create-user-codes': ['1'],
        'indicator-codes-tabs': [2],
        'status-codes': [3]
      }));

      const count = service.countFiltersSelected();
      expect(count).toBe('1');
    });
  });

  describe('countTableFiltersSelected', () => {
    it('should return undefined when no table filters are selected', () => {
      const count = service.countTableFiltersSelected();
      expect(count).toBeUndefined();
    });

    it('should return count when table filters are selected', () => {
      service.tableFilters.update(prev => ({
        ...prev,
        statusCodes: [
          { result_status_id: 1, name: 'A' },
          { result_status_id: 2, name: 'B' }
        ] as any,
        levers: [{ id: 3, short_name: 'L3' }] as any
      }));

      const count = service.countTableFiltersSelected();
      expect(count).toBe('3');
    });
  });

  describe('getStatusSeverity', () => {
    it('should return correct severity for SUBMITTED', () => {
      expect(service.getStatusSeverity('SUBMITTED')).toBe('info');
    });

    it('should return correct severity for ACCEPTED', () => {
      expect(service.getStatusSeverity('ACCEPTED')).toBe('success');
    });

    it('should return correct severity for EDITING', () => {
      expect(service.getStatusSeverity('EDITING')).toBe('warning');
    });

    it('should return undefined for unknown status', () => {
      expect(service.getStatusSeverity('UNKNOWN')).toBeUndefined();
    });
  });

  describe('onActiveItemChange', () => {
    it('should update myResultsFilterItem and clear filters for "my" tab', () => {
      const event: MenuItem = { id: 'my', label: 'My Results' };

      service.onActiveItemChange(event);

      expect(service.myResultsFilterItem()).toEqual(event);
      expect(service.searchInput()).toBe('');
      expect(service.resultsFilter()['create-user-codes']).toEqual(['123']);
      expect(service.resultsFilter()['indicator-codes-tabs']).toEqual([]);
    });

    it('should update myResultsFilterItem and clear filters for "all" tab', () => {
      const event: MenuItem = { id: 'all', label: 'All Results' };

      service.onActiveItemChange(event);

      expect(service.myResultsFilterItem()).toEqual(event);
      expect(service.searchInput()).toBe('');
      expect(service.resultsFilter()['create-user-codes']).toEqual([]);
      expect(service.resultsFilter()['indicator-codes-tabs']).toEqual([]);
    });

    it('should clear indicator-codes-tabs when changing tabs', () => {
      // Set up initial state with indicator tab selected
      service.resultsFilter.update(prev => ({
        ...prev,
        'indicator-codes-tabs': [1]
      }));

      const event: MenuItem = { id: 'my', label: 'My Results' };

      service.onActiveItemChange(event);

      expect(service.resultsFilter()['indicator-codes-tabs']).toEqual([]);
      expect(service.resultsFilter()['create-user-codes']).toEqual(['123']);
    });
  });

  describe('showFilterSidebar', () => {
    it('should set showFiltersSidebar to true', () => {
      service.showFilterSidebar();
      expect(service.showFiltersSidebar()).toBe(true);
    });
  });

  describe('showConfigSidebar', () => {
    it('should set showConfigurationsSidebar to true', () => {
      service.showConfigSidebar();
      expect(service.showConfigurationsSidebar()).toBe(true);
    });
  });

  describe('applyFilters', () => {
    it('should update resultsFilter and appliedFilters with table filters and call main', () => {
      const mockLevers = [{ id: 1, name: 'Lever 1' }] as any;
      const mockStatuses = [{ result_status_id: 1, name: 'Status 1' }] as any;
      const mockYears = [{ report_year: 2024 }] as any;
      const mockContracts = [{ agreement_id: 1, name: 'Contract 1' }] as any;
      const mockIndicators = [{ indicator_id: 1, name: 'Indicator 1' }] as any;

      service.tableFilters.update(prev => ({
        ...prev,
        levers: mockLevers,
        statusCodes: mockStatuses,
        years: mockYears,
        contracts: mockContracts,
        indicators: mockIndicators
      }));

      const mainSpy = jest.spyOn(service, 'main');

      service.applyFilters();

      const filter = service.resultsFilter();
      const appliedFilter = service.appliedFilters();

      expect(filter['lever-codes']).toEqual([1]);
      expect(filter['status-codes']).toEqual([1]);
      expect(filter['years']).toEqual([2024]);
      expect(filter['contract-codes']).toEqual([1]);
      expect(filter['indicator-codes-filter']).toEqual([1]);

      expect(appliedFilter['lever-codes']).toEqual([1]);
      expect(appliedFilter['status-codes']).toEqual([1]);
      expect(appliedFilter['years']).toEqual([2024]);
      expect(appliedFilter['contract-codes']).toEqual([1]);
      expect(appliedFilter['indicator-codes-filter']).toEqual([1]);

      expect(mainSpy).toHaveBeenCalled();
    });
  });

  describe('onSelectFilterTab', () => {
    it('should update indicator tabs and set active indicator', () => {
      service.onSelectFilterTab(1);

      const mockIndicatorTabsList = mockApiService.indicatorTabs.lazy().list();
      expect(mockIndicatorTabsList).toBeDefined();
    });

    it('should clear indicator-codes-tabs when indicatorId is 0 and call main', () => {
      const mainSpy = jest.spyOn(service, 'main');

      service.onSelectFilterTab(0);

      const filter = service.resultsFilter();
      const appliedFilter = service.appliedFilters();
      expect(filter['indicator-codes-tabs']).toEqual([]);
      expect(appliedFilter['indicator-codes-tabs']).toEqual([]);
      expect(mainSpy).toHaveBeenCalled();
    });

    it('should set indicator-codes-tabs when indicatorId is not 0 and call main', () => {
      const mainSpy = jest.spyOn(service, 'main');

      service.onSelectFilterTab(2);

      const filter = service.resultsFilter();
      const appliedFilter = service.appliedFilters();
      expect(filter['indicator-codes-tabs']).toEqual([2]);
      expect(appliedFilter['indicator-codes-tabs']).toEqual([2]);
      expect(mainSpy).toHaveBeenCalled();
    });
  });

  describe('cleanFilters', () => {
    it('should clear table filters', () => {
      service.tableFilters.update(prev => ({
        ...prev,
        indicators: [{ indicator_id: 1 }] as any,
        statusCodes: [{ result_status_id: 1 }] as any,
        years: [{ id: 2024 }] as any,
        contracts: [{ agreement_id: 1 }] as any,
        levers: [{ id: 1 }] as any
      }));

      service.cleanFilters();

      const tableFilters = service.tableFilters();
      expect(tableFilters.indicators).toEqual([]);
      expect(tableFilters.statusCodes).toEqual([]);
      expect(tableFilters.years).toEqual([]);
      expect(tableFilters.contracts).toEqual([]);
      expect(tableFilters.levers).toEqual([]);
    });
  });

  describe('clearAllFilters', () => {
    it('should clear all filters and reset state', () => {
      service.resultsFilter.update(prev => ({
        ...prev,
        'indicator-codes-filter': [1, 2],
        'indicator-codes-tabs': [3]
      }));
      service.appliedFilters.update(prev => ({
        ...prev,
        'indicator-codes-filter': [1, 2],
        'indicator-codes-tabs': [3]
      }));
      service.searchInput.set('test');

      const mainSpy = jest.spyOn(service, 'main');

      service.clearAllFilters();

      const filter = service.resultsFilter();
      const appliedFilter = service.appliedFilters();
      expect(filter['indicator-codes-filter']).toEqual([]);
      expect(filter['indicator-codes-tabs']).toEqual([]);
      expect(appliedFilter['indicator-codes-filter']).toEqual([]);
      expect(appliedFilter['indicator-codes-tabs']).toEqual([]);
      expect(service.searchInput()).toBe('');
      expect(mainSpy).toHaveBeenCalled();
    });
  });

  describe('cleanMultiselects', () => {
    it('should clear all multiselect refs', () => {
      const mockMultiselect = {
        clear: jest.fn()
      };

      service.multiselectRefs.set({
        test1: mockMultiselect as any,
        test2: mockMultiselect as any
      });

      service.cleanMultiselects();

      expect(mockMultiselect.clear).toHaveBeenCalledTimes(2);
    });
  });

  describe('main', () => {
    it('should load results successfully', async () => {
      await service.main();

      const results = service.list();
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        result_official_code: 'RES001',
        title: 'Test Result',
        indicators: { name: 'Test Indicator' },
        result_status: { name: 'SUBMITTED' },
        result_contracts: { contract_id: 'CON001' },
        result_levers: { lever: { short_name: 'LEV1' } },
        report_year_id: 2024,
        snapshot_years: [2023, 2024],
        created_by_user: { first_name: 'John', last_name: 'Doe' },
        created_at: '2024-01-01T00:00:00Z'
      });
      expect(results[0]).toHaveProperty('primaryLeverSort');
      expect(service.loading()).toBe(false);
    });

    it('should handle errors when loading results', async () => {
      mockGetResultsService.getInstance.mockRejectedValueOnce(new Error('API Error'));

      // Mock console.error to prevent error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error loading results:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});
