import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
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
      isLoading: signal(true),
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

  describe('onChangeList effect', () => {
    it('should prepend All Indicators and set able by indicator_id when isLoading is false', fakeAsync(() => {
      const listSignal = signal<GetAllIndicators[]>([
        { indicator_id: 1, name: 'Indicator 1', able: true, active: false },
        { indicator_id: 2, name: 'Indicator 2', able: true, active: false },
        { indicator_id: 7, name: 'Indicator 7', able: false, active: false }
      ]);
      const mockIndicatorTabsLoaded = {
        lazy: () => ({
          list: listSignal,
          isLoading: signal(false),
          hasValue: signal(true)
        })
      };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          ResultsCenterService,
          { provide: ApiService, useValue: { indicatorTabs: mockIndicatorTabsLoaded } as any },
          { provide: CacheService, useValue: { dataCache: signal(mockDataCache) } },
          { provide: GetResultsService, useValue: { getInstance: jest.fn().mockReturnValue(signal(mockResults)) } }
        ]
      });
      TestBed.inject(ResultsCenterService);
      tick();

      expect(listSignal().length).toBe(4);
      expect(listSignal()[0]).toEqual({ name: 'All Indicators', indicator_id: 0, able: true, active: true });
      expect(listSignal()[1].able).toBe(true);
      expect(listSignal()[2].able).toBe(true);
      expect(listSignal()[3].able).toBe(false);
    }));
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
      expect(config['primary-contract']).toBe(false);
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

    it('should get result_platform value correctly', () => {
      const columns = service.tableColumns();
      const platformColumn = columns.find(col => col.field === 'result_platform');
      const getValue = platformColumn?.getValue;
      if (getValue) {
        const result = { result_platform: 'STAR' } as Result;
        expect(getValue(result)).toBe('STAR');
      }
    });

    it('should have result_platform column hideIf returning true', () => {
      const columns = service.tableColumns();
      const platformColumn = columns.find(col => col.field === 'result_platform');
      const hideIf = platformColumn?.hideIf;
      if (typeof hideIf === 'function') {
        expect(hideIf()).toBe(true);
      }
    });

    it('should get result_official_code value correctly', () => {
      const columns = service.tableColumns();
      const codeColumn = columns.find(col => col.field === 'result_official_code');
      const getValue = codeColumn?.getValue;
      if (getValue) {
        const result = { result_official_code: 'RES-001' } as Result;
        expect(getValue(result)).toBe('RES-001');
      }
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

    it('should return title as-is when not a string (title getValue)', () => {
      const columns = service.tableColumns();
      const titleColumn = columns.find(col => col.field === 'title');
      const getValue = titleColumn?.getValue;

      if (getValue) {
        expect(getValue({ title: null } as Result)).toBeNull();
        expect(getValue({ title: undefined } as Result)).toBeUndefined();
        expect(getValue({ title: 123 } as any)).toBe(123);
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

    it('should return empty array for versions when snapshot_years is not array', () => {
      const columns = service.tableColumns();
      const versionsColumn = columns.find(col => col.field === 'versions');
      const getValue = versionsColumn?.getValue;
      if (getValue) {
        expect(getValue({ snapshot_years: null } as Result)).toEqual([]);
        expect(getValue({ snapshot_years: {} } as Result)).toEqual([]);
      }
    });

    it('should evaluate indicator column hideIf computed', () => {
      const columns = service.tableColumns();
      const indicatorColumn = columns.find(col => col.field === 'indicator_id');
      const hideIf = indicatorColumn?.hideIf;
      if (typeof hideIf === 'function') {
        expect(typeof hideIf()).toBe('boolean');
      }
    });

    it('should evaluate creator column hideFilterIf when create-user-codes is empty', () => {
      service.resultsFilter.update(prev => ({ ...prev, 'create-user-codes': [] }));
      const columns = service.tableColumns();
      const creatorColumn = columns.find(col => col.field === 'creator');
      const hideFilterIf = creatorColumn?.hideFilterIf;
      if (hideFilterIf) expect(hideFilterIf()).toBe(false);
    });

    it('should evaluate creator column hideFilterIf when create-user-codes has items', () => {
      service.resultsFilter.update(prev => ({ ...prev, 'create-user-codes': [123] }));
      const columns = service.tableColumns();
      const creatorColumn = columns.find(col => col.field === 'creator');
      const hideFilterIf = creatorColumn?.hideFilterIf;
      if (typeof hideFilterIf === 'function') {
        expect(hideFilterIf()).toBe(true);
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

    it('should return SOURCE when platform-code has items', () => {
      service.appliedFilters.update(prev => ({
        ...prev,
        'platform-code': ['STAR', 'ROAR']
      }));
      service.tableFilters.update(prev => ({
        ...prev,
        sources: [
          { platform_code: 'STAR', name: 'STAR' },
          { platform_code: 'ROAR', name: 'ROAR' }
        ] as any
      }));

      const filters = service.getActiveFilters();
      expect(filters).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'SOURCE', value: 'STAR', id: 'STAR' })]));
      expect(filters).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'SOURCE', value: 'ROAR', id: 'ROAR' })]));
    });

    it('should skip falsy items in tableFilters when building getActiveFilters', () => {
      service.appliedFilters.update(prev => ({ ...prev, 'indicator-codes-filter': [1] }));
      service.tableFilters.update(prev => ({
        ...prev,
        indicators: [null, { indicator_id: 1, name: 'Ind A' }] as any
      }));
      const filters = service.getActiveFilters();
      expect(filters).toContainEqual(expect.objectContaining({ label: 'INDICATOR', id: 1 }));
      expect(filters.filter(f => f.label === 'INDICATOR')).toHaveLength(1);
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

    it('should clear and reset table when tableRef is set', () => {
      const tableMock = { clear: jest.fn(), sortField: '', sortOrder: 0, first: 5 };
      service.tableRef.set(tableMock as any);

      const event: MenuItem = { id: 'all', label: 'All Results' };
      service.onActiveItemChange(event);

      expect(tableMock.clear).toHaveBeenCalled();
      expect(tableMock.sortField).toBe('result_official_code');
      expect(tableMock.sortOrder).toBe(-1);
      expect(tableMock.first).toBe(0);
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

    it('should reset table first to 0 when tableRef is set', () => {
      const tableMock = { first: 10, clear: jest.fn(), sortField: '', sortOrder: 0 };
      service.tableRef.set(tableMock as any);
      service.tableFilters.update(prev => ({ ...prev, levers: [{ id: 1 }] as any }));
      jest.spyOn(service, 'main').mockImplementation(() => Promise.resolve());

      service.applyFilters();

      expect(tableMock.first).toBe(0);
    });

    it('should map platform-code from sources with null/undefined as empty array', () => {
      service.tableFilters.update(prev => ({
        ...prev,
        levers: [],
        statusCodes: [],
        years: [],
        contracts: [],
        indicators: [],
        sources: undefined
      } as any));
      jest.spyOn(service, 'main').mockImplementation(() => Promise.resolve());
      service.applyFilters();
      expect(service.resultsFilter()['platform-code']).toEqual([]);
      expect(service.appliedFilters()['platform-code']).toEqual([]);
    });

    it('should preserve create-user-codes when myResultsFilterItem is my tab', () => {
      service.myResultsFilterItem.set(service.myResultsFilterItems[1]);
      service.resultsFilter.update(prev => ({ ...prev, 'create-user-codes': [100, 200] }));
      service.tableFilters.update(prev => ({ ...prev, levers: [{ id: 1 }] as any }));
      jest.spyOn(service, 'main').mockImplementation(() => Promise.resolve());
      service.applyFilters();
      expect(service.resultsFilter()['create-user-codes']).toEqual([100, 200]);
      expect(service.appliedFilters()['create-user-codes']).toEqual([100, 200]);
    });

    it('should not preserve create-user-codes when tab is all', () => {
      service.myResultsFilterItem.set(service.myResultsFilterItems[0]);
      service.resultsFilter.update(prev => ({ ...prev, 'create-user-codes': [99] }));
      service.tableFilters.update(prev => ({ ...prev, levers: [{ id: 1 }] as any }));
      jest.spyOn(service, 'main').mockImplementation(() => Promise.resolve());
      service.applyFilters();
      expect(service.resultsFilter()['create-user-codes']).toEqual([]);
      expect(service.appliedFilters()['create-user-codes']).toEqual([]);
    });

    it('should not set table.first when tableRef is null', () => {
      service.tableRef.set(undefined as any);
      service.tableFilters.update(prev => ({ ...prev, levers: [{ id: 1 }] as any }));
      const mainSpy = jest.spyOn(service, 'main').mockImplementation(() => Promise.resolve());
      service.applyFilters();
      expect(mainSpy).toHaveBeenCalled();
    });

    it('should map platform-code from sources when sources is defined', () => {
      service.tableFilters.update(prev => ({
        ...prev,
        levers: [],
        statusCodes: [],
        years: [],
        contracts: [],
        indicators: [],
        sources: [{ platform_code: 'STAR', name: 'STAR' }] as any
      }));
      jest.spyOn(service, 'main').mockImplementation(() => Promise.resolve());
      service.applyFilters();
      expect(service.resultsFilter()['platform-code']).toEqual(['STAR']);
      expect(service.appliedFilters()['platform-code']).toEqual(['STAR']);
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

    it('should clear table filters and reset sort when table exists', () => {
      const tableMock = {
        clear: jest.fn(),
        sortField: '',
        sortOrder: 0
      };
      service.tableRef.set(tableMock as any);
      service.tableFilters.set({
        indicators: [{ indicator_id: 1 }],
        statusCodes: [],
        years: [],
        contracts: [],
        levers: []
      } as any);

      service.cleanFilters();

      expect(tableMock.clear).toHaveBeenCalled();
      expect(tableMock.sortField).toBe('result_official_code');
      expect(tableMock.sortOrder).toBe(-1);
      const filters = service.tableFilters();
      expect(filters.indicators).toEqual([]);
      expect(filters.statusCodes).toEqual([]);
    });

    it('should handle when table is null', () => {
      service.tableRef.set(null);
      service.cleanFilters();
      const filters = service.tableFilters();
      expect(filters.indicators).toEqual([]);
    });
  });


  describe('clearAllFilters', () => {
    it('should preserve create-user-codes when tab is my', () => {
      service.myResultsFilterItem.set(service.myResultsFilterItems[1]);
      service.resultsFilter.set({ 'create-user-codes': [99, 100], 'indicator-codes': [1] } as any);
      service.clearAllFilters();
      expect(service.resultsFilter()['create-user-codes']).toEqual([99, 100]);
      expect(service.resultsFilter()['indicator-codes']).toEqual([]);
    });

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

    it('should clear table filters and reset sort when table exists', () => {
      const tableMock = {
        clear: jest.fn(),
        sortField: '' as string,
        sortOrder: 0 as number,
        first: 0 as number
      };
      service.tableRef.set(tableMock as any);

      service.clearAllFilters();

      expect(tableMock.clear).toHaveBeenCalled();
      expect(tableMock.sortField).toBe('result_official_code');
      expect(tableMock.sortOrder).toBe(-1);
      expect(tableMock.first).toBe(0);
    });

    it('should handle when table is null', () => {
      service.tableRef.set(null);
      service.clearAllFilters();
      expect(service.resultsFilter()['indicator-codes-filter']).toEqual([]);
    });

    it('should call cleanMultiselects after clearAllFilters via setTimeout', () => {
      jest.useFakeTimers();
      const cleanSpy = jest.spyOn(service, 'cleanMultiselects');
      jest.spyOn(service, 'onSelectFilterTab').mockImplementation(() => {});
      service.clearAllFilters();
      const callsBeforeFlush = cleanSpy.mock.calls.length;
      jest.runAllTimers();
      expect(cleanSpy.mock.calls.length).toBeGreaterThan(callsBeforeFlush);
      jest.useRealTimers();
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

    it('should catch and warn when a multiselect clear throws', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const okMultiselect = { clear: jest.fn() };
      const failingMultiselect = { clear: jest.fn().mockImplementation(() => { throw new Error('clear failed'); }) };

      service.multiselectRefs.set({
        ok: okMultiselect as any,
        fail: failingMultiselect as any
      });

      service.cleanMultiselects();

      expect(okMultiselect.clear).toHaveBeenCalled();
      expect(failingMultiselect.clear).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Error clearing multiselect:', expect.any(Error));
      consoleWarnSpy.mockRestore();
    });
  });

  describe('tableColumns getValue functions', () => {
    it('should get project value correctly with primary contract in array', () => {
      const columns = service.tableColumns();
      const projectColumn = columns.find(col => col.field === 'project');
      const getValue = projectColumn?.getValue;

      if (getValue) {
        const result = {
          result_contracts: [
            { is_primary: 0, contract_id: 'A123' },
            { is_primary: 1, contract_id: 'B456' },
            { is_primary: 0, contract_id: 'C789' }
          ]
        } as Result;
        expect(getValue(result)).toBe('B456');
      }
    });

    it('should get project value correctly with primary contract as single object', () => {
      const columns = service.tableColumns();
      const projectColumn = columns.find(col => col.field === 'project');
      const getValue = projectColumn?.getValue;

      if (getValue) {
        const result = {
          result_contracts: { is_primary: 1, contract_id: 'D012' }
        } as Result;
        expect(getValue(result)).toBe('D012');
      }
    });

    it('should return "-" when no result_contracts', () => {
      const columns = service.tableColumns();
      const projectColumn = columns.find(col => col.field === 'project');
      const getValue = projectColumn?.getValue;

      if (getValue) {
        const result = {} as Result;
        expect(getValue(result)).toBe('-');
      }
    });

    it('should return "-" when result_contracts has no primary contract', () => {
      const columns = service.tableColumns();
      const projectColumn = columns.find(col => col.field === 'project');
      const getValue = projectColumn?.getValue;

      if (getValue) {
        const result = {
          result_contracts: [
            { is_primary: 0, contract_id: 'A123' },
            { is_primary: 0, contract_id: 'B456' }
          ]
        } as Result;
        expect(getValue(result)).toBe('-');
      }
    });

    it('should return "-" for indicator getValue when indicators is undefined', () => {
      const columns = service.tableColumns();
      const indicatorColumn = columns.find(col => col.field === 'indicator');
      const getValue = indicatorColumn?.getValue;
      if (getValue) expect(getValue({} as Result)).toBe('-');
    });

    it('should return "-" for status getValue when result_status is undefined', () => {
      const columns = service.tableColumns();
      const statusColumn = columns.find(col => col.field === 'status');
      const getValue = statusColumn?.getValue;
      if (getValue) expect(getValue({} as Result)).toBe('-');
    });

    it('should return "-" for creator getValue when created_by_user is null', () => {
      const columns = service.tableColumns();
      const creatorColumn = columns.find(col => col.field === 'creator');
      const getValue = creatorColumn?.getValue;
      if (getValue) expect(getValue({ created_by_user: null } as Result)).toBe('-');
    });

    it('should return "-" for creation_date getValue when created_at is null', () => {
      const columns = service.tableColumns();
      const dateColumn = columns.find(col => col.field === 'creation_date');
      const getValue = dateColumn?.getValue;
      if (getValue) expect(getValue({ created_at: null } as Result)).toBe('-');
    });

    it('should get lever value correctly with primary levers', () => {
      const columns = service.tableColumns();
      const leverColumn = columns.find(col => col.field === 'lever');
      const getValue = leverColumn?.getValue;

      if (getValue) {
        const result = {
          result_levers: [
            { is_primary: 0, lever: { short_name: 'Lever 1' } },
            { is_primary: 1, lever: { short_name: 'Lever 2' } },
            { is_primary: 1, lever: { short_name: 'Lever 3' } }
          ]
        } as Result;
        expect(getValue(result)).toBe('Lever 2, Lever 3');
      }
    });

    it('should return "-" when no result_levers', () => {
      const columns = service.tableColumns();
      const leverColumn = columns.find(col => col.field === 'lever');
      const getValue = leverColumn?.getValue;

      if (getValue) {
        const result = {} as Result;
        expect(getValue(result)).toBe('-');
      }
    });

    it('should return "-" when result_levers is not an array', () => {
      const columns = service.tableColumns();
      const leverColumn = columns.find(col => col.field === 'lever');
      const getValue = leverColumn?.getValue;

      if (getValue) {
        const result = { result_levers: {} } as Result;
        expect(getValue(result)).toBe('-');
      }
    });

    it('should get lever value with lever missing short_name using empty string', () => {
      const columns = service.tableColumns();
      const leverColumn = columns.find(col => col.field === 'lever');
      const getValue = leverColumn?.getValue;
      if (getValue) {
        const result = {
          result_levers: [
            { is_primary: 1, lever: {} },
            { is_primary: 1, lever: { short_name: 'L2' } }
          ]
        } as Result;
        expect(getValue(result)).toBe('L2');
      }
    });

    it('should return "-" when no primary levers', () => {
      const columns = service.tableColumns();
      const leverColumn = columns.find(col => col.field === 'lever');
      const getValue = leverColumn?.getValue;

      if (getValue) {
        const result = {
          result_levers: [
            { is_primary: 0, lever: { short_name: 'Lever 1' } }
          ]
        } as Result;
        expect(getValue(result)).toBe('-');
      }
    });

    it('should get year value correctly', () => {
      const columns = service.tableColumns();
      const yearColumn = columns.find(col => col.field === 'year');
      const getValue = yearColumn?.getValue;

      if (getValue) {
        const result = { report_year_id: 2024 } as Result;
        expect(getValue(result)).toBe('2024');
      }
    });

    it('should return "-" when report_year_id is null', () => {
      const columns = service.tableColumns();
      const yearColumn = columns.find(col => col.field === 'year');
      const getValue = yearColumn?.getValue;

      if (getValue) {
        const result = { report_year_id: null } as Result;
        expect(getValue(result)).toBe('-');
      }
    });
  });

  describe('removeFilter', () => {
    it('should remove INDICATOR TAB filter', () => {
      const onSelectFilterTabSpy = jest.spyOn(service, 'onSelectFilterTab');
      service.removeFilter('INDICATOR TAB');
      expect(onSelectFilterTabSpy).toHaveBeenCalledWith(0);
    });

    it('should remove INDICATOR filter', () => {
      service.tableFilters.set({
        indicators: [{ indicator_id: 1 }, { indicator_id: 2 }],
        statusCodes: [],
        years: [],
        contracts: [],
        levers: []
      } as any);
      service.removeFilter('INDICATOR', 1);
      const filters = service.tableFilters();
      expect(filters.indicators).toEqual([{ indicator_id: 2 }]);
    });

    it('should remove STATUS filter', () => {
      service.tableFilters.set({
        indicators: [],
        statusCodes: [{ result_status_id: 1 }, { result_status_id: 2 }],
        years: [],
        contracts: [],
        levers: []
      } as any);
      service.removeFilter('STATUS', 1);
      const filters = service.tableFilters();
      expect(filters.statusCodes).toEqual([{ result_status_id: 2 }]);
    });

    it('should remove PROJECT filter', () => {
      service.tableFilters.set({
        indicators: [],
        statusCodes: [],
        years: [],
        contracts: [{ agreement_id: 'A1' }, { agreement_id: 'A2' }],
        levers: []
      } as any);
      service.removeFilter('PROJECT', 'A1');
      const filters = service.tableFilters();
      expect(filters.contracts).toEqual([{ agreement_id: 'A2' }]);
    });

    it('should remove LEVER filter', () => {
      service.tableFilters.set({
        indicators: [],
        statusCodes: [],
        years: [],
        contracts: [],
        levers: [{ id: 1 }, { id: 2 }]
      } as any);
      service.removeFilter('LEVER', 1);
      const filters = service.tableFilters();
      expect(filters.levers).toEqual([{ id: 2 }]);
    });

    it('should remove YEAR filter', () => {
      service.tableFilters.set({
        indicators: [],
        statusCodes: [],
        years: [{ report_year: 2023 }, { report_year: 2024 }],
        contracts: [],
        levers: []
      } as any);
      service.removeFilter('YEAR', 2023);
      const filters = service.tableFilters();
      expect(filters.years).toEqual([{ report_year: 2024 }]);
    });

    it('should remove SOURCE filter', () => {
      service.tableFilters.set({
        indicators: [],
        statusCodes: [],
        years: [],
        contracts: [],
        levers: [],
        sources: [{ platform_code: 'STAR' }, { platform_code: 'ROAR' }] as any
      } as any);
      jest.spyOn(service, 'applyFilters').mockImplementation(() => {});
      service.removeFilter('SOURCE', 'STAR');
      const filters = service.tableFilters();
      expect(filters.sources).toEqual([{ platform_code: 'ROAR' }]);
    });

    it('should call removeById on multiselect ref when multiple items remain', () => {
      const removeByIdSpy = jest.fn();
      service.multiselectRefs.set({
        indicator: { clear: jest.fn(), removeById: removeByIdSpy } as any
      });
      service.tableFilters.set({
        indicators: [{ indicator_id: 1 }, { indicator_id: 2 }],
        statusCodes: [],
        years: [],
        contracts: [],
        levers: []
      } as any);
      jest.spyOn(service, 'applyFilters').mockImplementation(() => {});
      service.removeFilter('INDICATOR', 1);
      expect(removeByIdSpy).toHaveBeenCalledWith(1);
    });

    it('should call clear on multiselect ref when removing last item', () => {
      const clearSpy = jest.fn();
      service.multiselectRefs.set({
        indicator: { clear: clearSpy, removeById: jest.fn() } as any
      });
      service.tableFilters.set({
        indicators: [{ indicator_id: 1 }],
        statusCodes: [],
        years: [],
        contracts: [],
        levers: []
      } as any);
      jest.spyOn(service, 'applyFilters').mockImplementation(() => {});
      service.removeFilter('INDICATOR', 1);
      expect(clearSpy).toHaveBeenCalled();
    });

    it('should clear filter array when id is not provided', () => {
      service.appliedFilters.update(prev => ({ ...prev, 'lever-codes': [1, 2] }));
      service.tableFilters.update(prev => ({ ...prev, levers: [{ id: 1 }, { id: 2 }] as any }));
      service.removeFilter('LEVER');
      expect(service.tableFilters().levers).toEqual([]);
      expect(service.resultsFilter()['lever-codes']).toEqual([]);
    });

    it('should clear filter array when id is undefined for INDICATOR', () => {
      service.tableFilters.set({
        indicators: [{ indicator_id: 1 }],
        statusCodes: [],
        years: [],
        contracts: [],
        levers: []
      } as any);
      service.removeFilter('INDICATOR');
      const filters = service.tableFilters();
      expect(filters.indicators).toEqual([]);
    });

    it('should return early when label is not in map', () => {
      const initialFilters = service.tableFilters();
      service.removeFilter('UNKNOWN');
      expect(service.tableFilters()).toEqual(initialFilters);
    });
  });

  describe('clearAllFiltersWithPreserve', () => {
    it('should clear filters and preserve indicator codes', () => {
      const tableMock = {
        clear: jest.fn(),
        sortField: '',
        sortOrder: 0,
        first: 0
      };
      service.tableRef.set(tableMock as any);
      service.resultsFilter.set({ 'indicator-codes': [1, 2, 3] } as any);
      service.appliedFilters.set({ 'indicator-codes': [1, 2, 3] } as any);
      service.searchInput.set('test');

      service.clearAllFiltersWithPreserve([1, 2]);

      expect(service.tableFilters().indicators).toEqual([]);
      const filter = service.resultsFilter();
      // Note: onSelectFilterTab(0) is called at the end, which resets indicator-codes-tabs to []
      expect(filter['indicator-codes-tabs']).toEqual([]);
      expect(filter['indicator-codes']).toEqual([1, 2]);
      expect(filter['indicator-codes-filter']).toEqual([]);
      expect(filter['create-user-codes']).toEqual([]);
      expect(service.searchInput()).toBe('');
      expect(tableMock.clear).toHaveBeenCalled();
      expect(tableMock.sortField).toBe('result_official_code');
      expect(tableMock.sortOrder).toBe(-1);
    });

    it('should handle when table is null', () => {
      service.tableRef.set(null);
      service.clearAllFiltersWithPreserve([1]);
      const filter = service.resultsFilter();
      // Note: onSelectFilterTab(0) is called at the end, which resets indicator-codes-tabs to []
      expect(filter['indicator-codes-tabs']).toEqual([]);
      expect(filter['indicator-codes']).toEqual([1]);
    });
  });

  describe('resetState', () => {
    it('should reset all state', () => {
      service.list.set([mockResults[0]]);
      service.loading.set(false);
      service.showFiltersSidebar.set(true);
      service.showConfigurationSidebar.set(true);
      service.multiselectRefs.set({ test: {} as any });
      service.myResultsFilterItem.set(service.myResultsFilterItems[1]);

      service.resetState();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(true);
      expect(service.showFiltersSidebar()).toBe(false);
      expect(service.showConfigurationSidebar()).toBe(false);
      expect(service.multiselectRefs()).toEqual({});
      expect(service.myResultsFilterItem()).toEqual(service.myResultsFilterItems[0]);
    });
  });

  describe('main', () => {
    it('should pass filter-primary-contract when primaryContractId is set', async () => {
      service.primaryContractId.set('contract-123');
      await service.main();
      expect(mockGetResultsService.getInstance).toHaveBeenCalledWith(
        expect.objectContaining({ 'filter-primary-contract': ['contract-123'] }),
        expect.anything()
      );
    });

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

    it('should handle results with no primary levers', async () => {
      const resultsWithoutPrimary = [{
        ...mockResults[0],
        result_levers: [{ is_primary: 0, lever: { short_name: 'Lever 1' } }]
      }];
      mockGetResultsService.getInstance.mockReturnValueOnce(signal(resultsWithoutPrimary));

      await service.main();

      const results = service.list();
      expect(results[0].primaryLeverSort).toBe('');
    });

    it('should handle results with primary levers', async () => {
      const resultsWithPrimary = [{
        ...mockResults[0],
        result_levers: [
          { is_primary: 1, lever: { short_name: 'Lever 1' } },
          { is_primary: 1, lever: { short_name: 'Lever 2' } }
        ]
      }];
      mockGetResultsService.getInstance.mockReturnValueOnce(signal(resultsWithPrimary));

      await service.main();

      const results = service.list();
      expect(results[0].primaryLeverSort).toBe('lever 1, lever 2');
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

    it('should set create-user-codes to current user when tab is my and create-user-codes is empty', async () => {
      service.myResultsFilterItem.set(service.myResultsFilterItems[1]);
      service.resultsFilter.update(prev => ({ ...prev, 'create-user-codes': [] }));
      service.appliedFilters.update(prev => ({ ...prev, 'create-user-codes': [] }));

      await service.main();

      expect(service.resultsFilter()['create-user-codes']).toEqual(['123']);
      expect(service.appliedFilters()['create-user-codes']).toEqual(['123']);
    });

    it('should not update list when context changes during request', async () => {
      const initialList = [{ result_official_code: 'OLD' }] as any;
      service.list.set(initialList);
      let resolveInstance: (v: unknown) => void;
      const instancePromise = new Promise<ReturnType<typeof signal>>(r => { resolveInstance = r; });
      mockGetResultsService.getInstance.mockImplementationOnce(() => instancePromise as any);
      const mainPromise = service.main();
      await Promise.resolve();
      service.primaryContractId.set('other-contract');
      resolveInstance!(signal(mockResults));
      await mainPromise;
      expect(service.list()).toEqual(initialList);
    });

    it('should clear create-user-codes when tab is not my and create-user-codes has items', async () => {
      service.myResultsFilterItem.set(service.myResultsFilterItems[0]);
      service.resultsFilter.update(prev => ({ ...prev, 'create-user-codes': [999] }));
      service.appliedFilters.update(prev => ({ ...prev, 'create-user-codes': [999] }));

      await service.main();

      expect(service.resultsFilter()['create-user-codes']).toEqual([]);
      expect(service.appliedFilters()['create-user-codes']).toEqual([]);
    });
  });
});
