import { TestBed } from '@angular/core/testing';
import { MyProjectsService, MyProjectsFilters } from './my-projects.service';
import { ApiService } from './api.service';
import { CacheService } from './cache/cache.service';
import { MultiselectComponent } from '../components/custom-fields/multiselect/multiselect.component';
import { MenuItem } from 'primeng/api';

describe('MyProjectsService', () => {
  let service: MyProjectsService;
  let mockApiService: jest.Mocked<ApiService>;
  let mockCacheService: jest.Mocked<CacheService>;

  const mockFindContractsResponse = {
    data: [
      {
        agreement_id: 'A001',
        projectDescription: 'Test Project',
        description: 'Test Description',
        project_lead_description: 'Test Lead',
        principal_investigator: 'Test PI',
        lever_name: 'Test Lever',
        lever: {
          short_name: 'TL',
          name: 'Test Lever'
        }
      },
      {
        agreement_id: 'A002',
        projectDescription: 'Test Project 2',
        description: 'Test Description 2',
        project_lead_description: 'Test Lead 2',
        principal_investigator: null,
        lever_name: null,
        lever: 'Test Lever String'
      }
    ]
  };

  beforeEach(() => {
    mockApiService = {
      GET_FindContracts: jest.fn().mockResolvedValue(mockFindContractsResponse)
    } as any;

    mockCacheService = {
      dataCache: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [MyProjectsService, { provide: ApiService, useValue: mockApiService }, { provide: CacheService, useValue: mockCacheService }]
    });

    service = TestBed.inject(MyProjectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(true);
      expect(service.isOpenSearch()).toBe(false);
      expect(service.tableFilters()).toEqual(new MyProjectsFilters());
      expect(service.appliedFilters()).toEqual(new MyProjectsFilters());
      expect(service.showFiltersSidebar()).toBe(false);
      expect(service.multiselectRefs()).toEqual({});
      expect(service.searchInput()).toBe('');
      expect(service.myProjectsFilterItem()).toEqual(service.myProjectsFilterItems[0]);
    });

    it('should have correct filter items', () => {
      expect(service.myProjectsFilterItems).toEqual([
        { id: 'all', label: 'All Projects' },
        { id: 'my', label: 'My Projects' }
      ]);
    });
  });

  describe('hasFilters computed', () => {
    it('should return false when no filters are active', () => {
      expect(service.hasFilters()).toBe(false);
    });

    it('should return true when contract code filter is active', () => {
      service.appliedFilters.set({
        ...new MyProjectsFilters(),
        contractCode: 'A001'
      });
      expect(service.hasFilters()).toBe(true);
    });

    it('should return true when project name filter is active', () => {
      service.appliedFilters.set({
        ...new MyProjectsFilters(),
        projectName: 'Test Project'
      });
      expect(service.hasFilters()).toBe(true);
    });

    it('should return true when principal investigator filter is active', () => {
      service.appliedFilters.set({
        ...new MyProjectsFilters(),
        principalInvestigator: 'Test PI'
      });
      expect(service.hasFilters()).toBe(true);
    });

    it('should return true when levers filter is active', () => {
      service.appliedFilters.set({
        ...new MyProjectsFilters(),
        levers: [{ id: 1, short_name: 'Test' }]
      });
      expect(service.hasFilters()).toBe(true);
    });

    it('should return true when status codes filter is active', () => {
      service.appliedFilters.set({
        ...new MyProjectsFilters(),
        statusCodes: [{ name: 'Active', value: 'active' }]
      });
      expect(service.hasFilters()).toBe(true);
    });

    it('should return true when start date filter is active', () => {
      service.appliedFilters.set({
        ...new MyProjectsFilters(),
        startDate: '2024-01-01'
      });
      expect(service.hasFilters()).toBe(true);
    });

    it('should return true when end date filter is active', () => {
      service.appliedFilters.set({
        ...new MyProjectsFilters(),
        endDate: '2024-12-31'
      });
      expect(service.hasFilters()).toBe(true);
    });
  });

  describe('getBaseParams', () => {
    it('should return correct params for all projects', () => {
      service.myProjectsFilterItem.set(service.myProjectsFilterItems[0]);
      const params = (service as any).getBaseParams();
      expect(params).toEqual({ 'current-user': false });
    });

    it('should return correct params for my projects', () => {
      service.myProjectsFilterItem.set(service.myProjectsFilterItems[1]);
      const params = (service as any).getBaseParams();
      expect(params).toEqual({ 'current-user': true });
    });
  });

  describe('isFilterActive', () => {
    it('should return false for empty string', () => {
      expect((service as any).isFilterActive('')).toBe(false);
    });

    it('should return true for non-empty string', () => {
      expect((service as any).isFilterActive('test')).toBe(true);
    });

    it('should return false for empty array', () => {
      expect((service as any).isFilterActive([])).toBe(false);
    });

    it('should return true for non-empty array', () => {
      expect((service as any).isFilterActive([{ id: 1, short_name: 'test' }])).toBe(true);
    });
  });

  describe('getLeverDisplayName', () => {
    it('should return lever_name when available', () => {
      const item = { lever_name: 'Test Lever' };
      expect((service as any).getLeverDisplayName(item)).toBe('Test Lever');
    });

    it('should return lever.short_name when lever is object and lever_name is not available', () => {
      const item = { lever: { short_name: 'TL', name: 'Test Lever' } };
      expect((service as any).getLeverDisplayName(item)).toBe('TL');
    });

    it('should return lever.name when lever is object and short_name is not available', () => {
      const item = { lever: { name: 'Test Lever' } };
      expect((service as any).getLeverDisplayName(item)).toBe('Test Lever');
    });

    it('should return empty string when lever is object but no name properties', () => {
      const item = { lever: {} };
      expect((service as any).getLeverDisplayName(item)).toBe('');
    });

    it('should return lever string when lever is string', () => {
      const item = { lever: 'Test Lever String' };
      expect((service as any).getLeverDisplayName(item)).toBe('Test Lever String');
    });

    it('should return empty string when lever is not available', () => {
      const item = {};
      expect((service as any).getLeverDisplayName(item)).toBe('');
    });
  });

  describe('main method', () => {
    it('should fetch and process data successfully', async () => {
      await service.main();

      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith(undefined);
      expect(service.loading()).toBe(false);
      expect(service.list()).toHaveLength(2);

      const firstItem = service.list()[0];
      expect(firstItem.full_name).toBe('A001 Test Project Test Description Test Lead');
      expect(firstItem.display_principal_investigator).toBe('Test PI');
      expect(firstItem.display_lever_name).toBe('Test Lever');

      const secondItem = service.list()[1];
      expect(secondItem.full_name).toBe('A002 Test Project 2 Test Description 2 Test Lead 2');
      expect(secondItem.display_principal_investigator).toBe('Test Lead 2');
      expect(secondItem.display_lever_name).toBe('Test Lever String');
    });

    it('should handle API response without data', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({});

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with null data', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({ data: null });

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with undefined data', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({ data: undefined });

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with false data', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({ data: false });

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with empty string data', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({ data: '' });

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with empty array data', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({ data: [] });

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with no response object', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce(null as any);

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with non-array data', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({ data: 'not-an-array' });

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with zero data', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({ data: 0 });

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with NaN data', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({ data: NaN });

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with undefined response', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce(undefined as any);

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with null response', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce(null as any);

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with empty object', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({});

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with data property but falsy value', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({ data: false });

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with data property but empty string', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({ data: '' });

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with data property but zero', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({ data: 0 });

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API response with data property but NaN', async () => {
      mockApiService.GET_FindContracts.mockResolvedValueOnce({ data: NaN });

      await service.main();

      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);
    });

    it('should handle API error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockApiService.GET_FindContracts.mockRejectedValueOnce(new Error('API Error'));

      await service.main();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch find contracts:', expect.any(Error));
      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should call API with custom params', async () => {
      const customParams = { 'test-param': 'test-value' };
      await service.main(customParams);

      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith(customParams);
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should apply contract code filter', () => {
      service.tableFilters.set({
        ...new MyProjectsFilters(),
        contractCode: 'A001'
      });

      service.applyFilters();

      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith({
        'current-user': false,
        'contract-code': 'A001'
      });
      expect(service.appliedFilters().contractCode).toBe('A001');
    });

    it('should apply project name filter', () => {
      service.tableFilters.set({
        ...new MyProjectsFilters(),
        projectName: 'Test Project'
      });

      service.applyFilters();

      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith({
        'current-user': false,
        'project-name': 'Test Project'
      });
      expect(service.appliedFilters().projectName).toBe('Test Project');
    });

    it('should apply principal investigator filter', () => {
      service.tableFilters.set({
        ...new MyProjectsFilters(),
        principalInvestigator: 'Test PI'
      });

      service.applyFilters();

      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith({
        'current-user': false,
        'principal-investigator': 'Test PI'
      });
      expect(service.appliedFilters().principalInvestigator).toBe('Test PI');
    });

    it('should apply levers filter', () => {
      service.tableFilters.set({
        ...new MyProjectsFilters(),
        levers: [
          { id: 1, short_name: 'Test' },
          { id: 2, short_name: 'Test2' }
        ]
      });

      service.applyFilters();

      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith({
        'current-user': false,
        lever: '1,2'
      });
      expect(service.appliedFilters().levers).toHaveLength(2);
    });

    it('should apply status codes filter', () => {
      service.tableFilters.set({
        ...new MyProjectsFilters(),
        statusCodes: [
          { name: 'Active', value: 'active' },
          { name: 'Inactive', value: 'inactive' }
        ]
      });

      service.applyFilters();

      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith({
        'current-user': false,
        status: 'active,inactive'
      });
      expect(service.appliedFilters().statusCodes).toHaveLength(2);
    });

    it('should apply start date filter', () => {
      service.tableFilters.set({
        ...new MyProjectsFilters(),
        startDate: '2024-01-01'
      });

      service.applyFilters();

      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith({
        'current-user': false,
        'start-date': '2024-01-01T00:00:00.000'
      });
      expect(service.appliedFilters().startDate).toBe('2024-01-01');
    });

    it('should apply end date filter', () => {
      service.tableFilters.set({
        ...new MyProjectsFilters(),
        endDate: '2024-12-31'
      });

      service.applyFilters();

      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith({
        'current-user': false,
        'end-date': '2024-12-31T00:00:00.000'
      });
      expect(service.appliedFilters().endDate).toBe('2024-12-31');
    });

    it('should apply multiple filters', () => {
      service.tableFilters.set({
        ...new MyProjectsFilters(),
        contractCode: 'A001',
        projectName: 'Test Project',
        levers: [{ id: 1, short_name: 'Test' }]
      });

      service.applyFilters();

      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith({
        'current-user': false,
        'contract-code': 'A001',
        'project-name': 'Test Project',
        lever: '1'
      });
    });

    it('should apply filters for my projects', () => {
      service.myProjectsFilterItem.set(service.myProjectsFilterItems[1]);
      service.tableFilters.set({
        ...new MyProjectsFilters(),
        contractCode: 'A001'
      });

      service.applyFilters();

      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith({
        'current-user': true,
        'contract-code': 'A001'
      });
    });
  });

  describe('countFiltersSelected computed', () => {
    it('should return undefined when no filters are selected', () => {
      expect(service.countFiltersSelected()).toBeUndefined();
    });

    it('should return count when filters are selected', () => {
      service.tableFilters.set({
        ...new MyProjectsFilters(),
        contractCode: 'A001',
        projectName: 'Test Project',
        levers: [{ id: 1, short_name: 'Test' }]
      });

      expect(service.countFiltersSelected()).toBe('3');
    });
  });

  describe('getActiveFilters computed', () => {
    it('should return empty array when no filters are applied', () => {
      expect(service.getActiveFilters()).toEqual([]);
    });

    it('should return active filters', () => {
      service.appliedFilters.set({
        ...new MyProjectsFilters(),
        contractCode: 'A001',
        projectName: 'Test Project',
        levers: [{ id: 1, short_name: 'Test' }]
      });

      const activeFilters = service.getActiveFilters();
      expect(activeFilters).toContainEqual({ label: 'CONTRACT CODE' });
      expect(activeFilters).toContainEqual({ label: 'PROJECT NAME' });
      expect(activeFilters).toContainEqual({ label: 'LEVER' });
    });
  });

  describe('onActiveItemChange', () => {
    it('should change filter item and reset filters', () => {
      const newItem: MenuItem = { id: 'my', label: 'My Projects' };

      service.onActiveItemChange(newItem);

      expect(service.myProjectsFilterItem()).toBe(newItem);
      expect(service.tableFilters()).toEqual(new MyProjectsFilters());
      expect(service.appliedFilters()).toEqual(new MyProjectsFilters());
      expect(service.searchInput()).toBe('');
      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith({ 'current-user': true });
    });
  });

  describe('showFilterSidebar', () => {
    it('should show filter sidebar', () => {
      service.showFilterSidebar();
      expect(service.showFiltersSidebar()).toBe(true);
    });
  });

  describe('cleanMultiselects', () => {
    it('should clear multiselects successfully', () => {
      const mockMultiselect = {
        clear: jest.fn()
      } as any;

      service.multiselectRefs.set({
        test: mockMultiselect
      });

      service.cleanMultiselects();

      expect(mockMultiselect.clear).toHaveBeenCalled();
    });

    it('should handle error when clearing multiselect', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockMultiselect = {
        clear: jest.fn().mockImplementation(() => {
          throw new Error('Clear error');
        })
      } as any;

      service.multiselectRefs.set({
        test: mockMultiselect
      });

      service.cleanMultiselects();

      expect(consoleSpy).toHaveBeenCalledWith('Error clearing multiselect:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle multiselect without clear method', () => {
      const mockMultiselect = {} as any;

      service.multiselectRefs.set({
        test: mockMultiselect
      });

      expect(() => service.cleanMultiselects()).not.toThrow();
    });

    it('should handle empty multiselect refs', () => {
      service.multiselectRefs.set({});
      expect(() => service.cleanMultiselects()).not.toThrow();
    });
  });

  describe('clearAllFilters', () => {
    it('should clear all filters and refresh', () => {
      service.clearAllFilters();

      expect(service.tableFilters()).toEqual(new MyProjectsFilters());
      expect(service.appliedFilters()).toEqual(new MyProjectsFilters());
      expect(service.searchInput()).toBe('');
      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith({ 'current-user': false });
    });
  });

  describe('clearFilters', () => {
    it('should clear filters and refresh', () => {
      service.clearFilters();

      expect(service.tableFilters()).toEqual(new MyProjectsFilters());
      expect(service.appliedFilters()).toEqual(new MyProjectsFilters());
      expect(service.searchInput()).toBe('');
      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith({ 'current-user': false });
    });
  });

  describe('refresh', () => {
    it('should refresh data', () => {
      service.refresh();

      expect(mockApiService.GET_FindContracts).toHaveBeenCalledWith({ 'current-user': false });
    });
  });

  describe('resetState', () => {
    it('should reset all state', () => {
      service.resetState();

      expect(service.tableFilters()).toEqual(new MyProjectsFilters());
      expect(service.appliedFilters()).toEqual(new MyProjectsFilters());
      expect(service.searchInput()).toBe('');
      expect(service.list()).toEqual([]);
      expect(service.loading()).toBe(true);
      expect(service.isOpenSearch()).toBe(false);
      expect(service.showFiltersSidebar()).toBe(false);
      expect(service.multiselectRefs()).toEqual({});
      expect(service.myProjectsFilterItem()).toEqual(service.myProjectsFilterItems[0]);
    });
  });
});
