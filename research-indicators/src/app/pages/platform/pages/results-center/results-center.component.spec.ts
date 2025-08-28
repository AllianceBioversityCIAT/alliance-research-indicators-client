import { ComponentFixture, TestBed } from '@angular/core/testing';
import ResultsCenterComponent from './results-center.component';
import { ResultsCenterService } from './results-center.service';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { ApiService } from '../../../../shared/services/api.service';
import { ActionsService } from '../../../../shared/services/actions.service';
import { MenuItem } from 'primeng/api';
import { signal } from '@angular/core';

describe('ResultsCenterComponent', () => {
  let component: ResultsCenterComponent;
  let fixture: ComponentFixture<ResultsCenterComponent>;
  let mockResultsCenterService: any;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockApiService: jest.Mocked<ApiService>;
  let mockActionsService: jest.Mocked<ActionsService>;

  beforeEach(async () => {
    jest.useFakeTimers();
    mockResultsCenterService = {
      resetState: jest.fn(),
      myResultsFilterItem: signal({ id: 'all', label: 'All Results' }),
      myResultsFilterItems: [
        { id: 'all', label: 'All Results' },
        { id: 'my', label: 'My Results' }
      ],
      clearAllFilters: jest.fn(),
      onActiveItemChange: jest.fn(),
      resultsFilter: signal({
        'create-user-codes': [],
        'indicator-codes': [],
        'status-codes': [],
        'contract-codes': [],
        'lever-codes': [],
        years: [],
        'indicator-codes-filter': [],
        'indicator-codes-tabs': []
      }),
      appliedFilters: signal({
        'create-user-codes': [],
        'indicator-codes': [],
        'status-codes': [],
        'contract-codes': [],
        'lever-codes': [],
        years: [],
        'indicator-codes-filter': [],
        'indicator-codes-tabs': []
      }),
      searchInput: signal(''),
      main: jest.fn(),
      applyFilters: jest.fn(),
      cleanMultiselects: jest.fn(),
      loadMyResults: jest.fn(),
      loadAllResults: jest.fn()
    } as any;

    mockCacheService = {
      dataCache: signal({
        user: {
          sec_user_id: 123
        }
      })
    } as any;

    mockApiService = {
      GET_Configuration: jest.fn(),
      PATCH_Configuration: jest.fn()
    } as any;

    mockActionsService = {
      showToast: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ResultsCenterComponent],
      providers: [
        { provide: ResultsCenterService, useValue: mockResultsCenterService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: ApiService, useValue: mockApiService },
        { provide: ActionsService, useValue: mockActionsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsCenterComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should reset state and load pinned tab', () => {
      const loadPinnedTabSpy = jest.spyOn(component, 'loadPinnedTab');

      component.ngOnInit();

      expect(mockResultsCenterService.resetState).toHaveBeenCalled();
      expect(loadPinnedTabSpy).toHaveBeenCalled();
    });
  });

  describe('orderedFilterItems', () => {
    it('should return correct order when pinned tab is my', () => {
      component.pinnedTab.set('my');

      const result = component.orderedFilterItems();

      expect(result).toEqual([
        { id: 'my', label: 'My Results' },
        { id: 'all', label: 'All Results' }
      ]);
    });

    it('should return correct order when pinned tab is all', () => {
      component.pinnedTab.set('all');

      const result = component.orderedFilterItems();

      expect(result).toEqual([
        { id: 'all', label: 'All Results' },
        { id: 'my', label: 'My Results' }
      ]);
    });
  });

  describe('toggleSidebar', () => {
    it('should toggle showSignal', () => {
      const initialValue = component.showSignal();

      component.toggleSidebar();

      expect(component.showSignal()).toBe(!initialValue);
    });
  });

  describe('applyFilters', () => {
    it('should call resultsCenterService.applyFilters', () => {
      component.applyFilters();

      expect(mockResultsCenterService.applyFilters).toHaveBeenCalled();
    });
  });

  describe('loadPinnedTab', () => {
    it('should load all results when all is pinned', async () => {
      mockApiService.GET_Configuration.mockResolvedValue({
        data: { all: '1', self: '0' }
      } as any);
      const loadAllResultsSpy = jest.spyOn(component, 'loadAllResults');

      await component.loadPinnedTab();

      expect(component.pinnedTab()).toBe('all');
      expect(mockResultsCenterService.myResultsFilterItem()).toEqual(mockResultsCenterService.myResultsFilterItems[0]);
      expect(loadAllResultsSpy).toHaveBeenCalled();
      expect(component.loadingPin()).toBe(false);
    });

    it('should load my results when self is pinned', async () => {
      mockApiService.GET_Configuration.mockResolvedValue({
        data: { all: '0', self: '1' }
      } as any);
      const loadMyResultsSpy = jest.spyOn(component, 'loadMyResults');

      await component.loadPinnedTab();

      expect(component.pinnedTab()).toBe('my');
      expect(mockResultsCenterService.myResultsFilterItem()).toEqual(mockResultsCenterService.myResultsFilterItems[1]);
      expect(loadMyResultsSpy).toHaveBeenCalled();
      expect(component.loadingPin()).toBe(false);
    });

    it('should load all results when no tab is pinned', async () => {
      mockApiService.GET_Configuration.mockResolvedValue({
        data: { all: '0', self: '0' }
      } as any);
      const loadAllResultsSpy = jest.spyOn(component, 'loadAllResults');

      await component.loadPinnedTab();

      expect(component.pinnedTab()).toBe('all');
      expect(mockResultsCenterService.myResultsFilterItem()).toEqual(mockResultsCenterService.myResultsFilterItems[0]);
      expect(loadAllResultsSpy).toHaveBeenCalled();
      expect(component.loadingPin()).toBe(false);
    });

    it('should load all results when no response data', async () => {
      mockApiService.GET_Configuration.mockResolvedValue({} as any);
      const loadAllResultsSpy = jest.spyOn(component, 'loadAllResults');

      await component.loadPinnedTab();

      expect(component.pinnedTab()).toBe('all');
      expect(mockResultsCenterService.myResultsFilterItem()).toEqual(mockResultsCenterService.myResultsFilterItems[0]);
      expect(loadAllResultsSpy).toHaveBeenCalled();
      expect(component.loadingPin()).toBe(false);
    });
  });

  describe('onActiveItemChange', () => {
    it('should handle my tab selection', () => {
      const event: MenuItem = { id: 'my', label: 'My Results' };
      const loadMyResultsSpy = jest.spyOn(component, 'loadMyResults');

      component.onActiveItemChange(event);

      expect(mockResultsCenterService.myResultsFilterItem()).toEqual(event);
      expect(loadMyResultsSpy).toHaveBeenCalled();
      expect(mockResultsCenterService.clearAllFilters).toHaveBeenCalled();
    });

    it('should handle all tab selection', () => {
      const event: MenuItem = { id: 'all', label: 'All Results' };
      const loadAllResultsSpy = jest.spyOn(component, 'loadAllResults');

      component.onActiveItemChange(event);

      expect(mockResultsCenterService.myResultsFilterItem()).toEqual(event);
      expect(loadAllResultsSpy).toHaveBeenCalled();
      expect(mockResultsCenterService.clearAllFilters).toHaveBeenCalled();
    });
  });

  describe('loadMyResults', () => {
    it('should update results filter and applied filters and call main', () => {
      component.loadMyResults();

      expect(mockResultsCenterService.myResultsFilterItem()).toEqual(mockResultsCenterService.myResultsFilterItems[1]);
      expect(mockResultsCenterService.resultsFilter()).toEqual({
        'create-user-codes': ['123'],
        'indicator-codes': [],
        'status-codes': [],
        'contract-codes': [],
        'lever-codes': [],
        years: [],
        'indicator-codes-filter': [],
        'indicator-codes-tabs': []
      });
      expect(mockResultsCenterService.appliedFilters()).toEqual({
        'create-user-codes': ['123'],
        'indicator-codes': [],
        'status-codes': [],
        'contract-codes': [],
        'lever-codes': [],
        years: [],
        'indicator-codes-filter': [],
        'indicator-codes-tabs': []
      });
      expect(mockResultsCenterService.main).toHaveBeenCalled();
    });
  });

  describe('loadAllResults', () => {
    it('should update results filter and applied filters and call main', () => {
      component.loadAllResults();

      expect(mockResultsCenterService.myResultsFilterItem()).toEqual(mockResultsCenterService.myResultsFilterItems[0]);
      expect(mockResultsCenterService.resultsFilter()).toEqual({
        'create-user-codes': [],
        'indicator-codes': [],
        'status-codes': [],
        'contract-codes': [],
        'lever-codes': [],
        years: [],
        'indicator-codes-filter': [],
        'indicator-codes-tabs': []
      });
      expect(mockResultsCenterService.appliedFilters()).toEqual({
        'create-user-codes': [],
        'indicator-codes': [],
        'status-codes': [],
        'contract-codes': [],
        'lever-codes': [],
        years: [],
        'indicator-codes-filter': [],
        'indicator-codes-tabs': []
      });
      expect(mockResultsCenterService.main).toHaveBeenCalled();
    });
  });

  describe('togglePin', () => {
    it('should pin all tab when toggling from my', async () => {
      component.pinnedTab.set('my');
      mockApiService.PATCH_Configuration.mockResolvedValue({} as any);

      await component.togglePin('all');
      jest.runAllTimers();

      expect(mockApiService.PATCH_Configuration).toHaveBeenCalledWith('result-table', 'tab', { all: true, self: false });
      expect(component.pinnedTab()).toBe('all');
      expect(mockResultsCenterService.myResultsFilterItem()).toEqual(mockResultsCenterService.myResultsFilterItems[0]);
      expect(mockResultsCenterService.cleanMultiselects).toHaveBeenCalled();
      expect(mockActionsService.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Results',
        detail: 'All Results tab pinned successfully'
      });
    });

    it('should pin my tab when toggling from all', async () => {
      component.pinnedTab.set('all');
      mockApiService.PATCH_Configuration.mockResolvedValue({} as any);
      mockApiService.GET_Configuration.mockResolvedValue({
        data: { all: '0', self: '1' }
      } as any);

      await component.togglePin('my');
      jest.runAllTimers();

      expect(mockApiService.PATCH_Configuration).toHaveBeenCalledWith('result-table', 'tab', { all: false, self: true });
      expect(component.pinnedTab()).toBe('my');
      expect(mockResultsCenterService.myResultsFilterItem()).toEqual(mockResultsCenterService.myResultsFilterItems[1]);
      expect(mockResultsCenterService.cleanMultiselects).toHaveBeenCalled();
      expect(mockActionsService.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Results',
        detail: 'My Results tab pinned successfully'
      });
    });

    it('should unpin tab when toggling same tab', async () => {
      component.pinnedTab.set('all');
      mockApiService.PATCH_Configuration.mockResolvedValue({} as any);

      await component.togglePin('all');
      jest.runAllTimers();

      expect(mockApiService.PATCH_Configuration).toHaveBeenCalledWith('result-table', 'tab', { all: true, self: false });
      expect(component.pinnedTab()).toBe('all');
      expect(mockResultsCenterService.cleanMultiselects).toHaveBeenCalled();
    });

    it('should handle error when API call fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApiService.PATCH_Configuration.mockRejectedValue(new Error('API Error'));

      await component.togglePin('all');
      jest.runAllTimers();

      expect(consoleSpy).toHaveBeenCalledWith('Error updating pinned tab:', expect.any(Error));
      expect(mockActionsService.showToast).toHaveBeenCalled();
      expect(component.loadingPin()).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('isPinned', () => {
    it('should return true when tab is pinned', () => {
      component.pinnedTab.set('my');

      expect(component.isPinned('my')).toBe(true);
    });

    it('should return false when tab is not pinned', () => {
      component.pinnedTab.set('my');

      expect(component.isPinned('all')).toBe(false);
    });
  });

  describe('onPinIconClick', () => {
    it('should stop event propagation and call togglePin', () => {
      const event = new Event('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');
      const togglePinSpy = jest.spyOn(component, 'togglePin');

      component.onPinIconClick('all', event);

      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(togglePinSpy).toHaveBeenCalledWith('all');
    });
  });
});
