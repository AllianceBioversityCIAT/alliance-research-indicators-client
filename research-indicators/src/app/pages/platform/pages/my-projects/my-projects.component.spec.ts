import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import MyProjectsComponent from './my-projects.component';
import { ApiService } from '@shared/services/api.service';
import { MyProjectsService } from '@shared/services/my-projects.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { ActionsService } from '@shared/services/actions.service';
import { ProjectUtilsService } from '@shared/services/project-utils.service';
import { signal } from '@angular/core';
import { MultiselectComponent } from '@shared/components/custom-fields/multiselect/multiselect.component';

describe('MyProjectsComponent', () => {
  let component: MyProjectsComponent;
  let fixture: ComponentFixture<MyProjectsComponent>;
  let mockApiService: jest.Mocked<ApiService>;
  let mockMyProjectsService: jest.Mocked<MyProjectsService>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockActionsService: jest.Mocked<ActionsService>;
  let mockProjectUtilsService: jest.Mocked<ProjectUtilsService>;
  let mockRouter: jest.Mocked<Router>;

  beforeEach(async () => {
    mockApiService = {
      GET_Configuration: jest.fn(),
      PATCH_Configuration: jest.fn()
    } as any;

    mockMyProjectsService = {
      resetState: jest.fn(),
      main: jest.fn(),
      clearFilters: jest.fn(),
      cleanMultiselects: jest.fn(),
      showFilterSidebar: jest.fn(),
      searchInput: signal(''),
      list: signal([]),
      loading: signal(false),
      myProjectsFilterItem: signal({ id: 'all', label: 'All Projects' }),
      multiselectRefs: signal({})
    } as any;

    mockCacheService = {
      hasSmallScreen: jest.fn().mockReturnValue(false)
    } as any;

    mockActionsService = {
      showToast: jest.fn()
    } as any;

    mockProjectUtilsService = {} as any;

    mockRouter = {
      navigate: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [MyProjectsComponent, HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: MyProjectsService, useValue: mockMyProjectsService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: ActionsService, useValue: mockActionsService },
        { provide: ProjectUtilsService, useValue: mockProjectUtilsService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() },
            params: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyProjectsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should reset state and load pinned tab', async () => {
      mockApiService.GET_Configuration.mockResolvedValue({ data: { all: '0', self: '0' } } as any);
      jest.spyOn(component, 'loadPinnedTab').mockResolvedValue();

      component.ngOnInit();

      expect(mockMyProjectsService.resetState).toHaveBeenCalled();
      expect(component.loadPinnedTab).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should set multiselect refs and clean multiselects', () => {
      const statusSelect = {} as MultiselectComponent;
      const leverSelect = {} as MultiselectComponent;
      component.statusSelect = statusSelect;
      component.leverSelect = leverSelect;

      jest.useFakeTimers();
      component.ngAfterViewInit();
      jest.advanceTimersByTime(100);
      jest.useRealTimers();

      expect(mockMyProjectsService.multiselectRefs()).toEqual({
        status: statusSelect,
        lever: leverSelect
      });
      expect(mockMyProjectsService.cleanMultiselects).toHaveBeenCalled();
    });

    it('should not set refs if components are not available', () => {
      component.statusSelect = undefined;
      component.leverSelect = undefined;

      component.ngAfterViewInit();

      expect(mockMyProjectsService.cleanMultiselects).not.toHaveBeenCalled();
    });
  });

  describe('loadPinnedTab', () => {
    it('should load all tab when all is pinned', async () => {
      mockApiService.GET_Configuration.mockResolvedValue({ data: { all: '1', self: '0' } } as any);
      jest.spyOn(component, 'loadAllProjects');

      await component.loadPinnedTab();

      expect(component.pinnedTab()).toBe('all');
      expect(component.selectedTab()).toBe('all');
      expect(component.loadAllProjects).toHaveBeenCalled();
      expect(component.loadingPin()).toBe(false);
    });

    it('should load my tab when self is pinned', async () => {
      mockApiService.GET_Configuration.mockResolvedValue({ data: { all: '0', self: '1' } } as any);
      jest.spyOn(component, 'loadMyProjects');

      await component.loadPinnedTab();

      expect(component.pinnedTab()).toBe('my');
      expect(component.selectedTab()).toBe('my');
      expect(component.loadMyProjects).toHaveBeenCalled();
      expect(component.loadingPin()).toBe(false);
    });

    it('should load all tab when nothing is pinned', async () => {
      mockApiService.GET_Configuration.mockResolvedValue({ data: { all: '0', self: '0' } } as any);
      jest.spyOn(component, 'loadAllProjects');

      await component.loadPinnedTab();

      expect(component.selectedTab()).toBe('all');
      expect(component.loadAllProjects).toHaveBeenCalled();
      expect(component.loadingPin()).toBe(false);
    });

    it('should load all tab when response has no data', async () => {
      mockApiService.GET_Configuration.mockResolvedValue({ data: null } as any);
      jest.spyOn(component, 'loadAllProjects');

      await component.loadPinnedTab();

      expect(component.pinnedTab()).toBe('all');
      expect(component.selectedTab()).toBe('all');
      expect(component.loadAllProjects).toHaveBeenCalled();
      expect(component.loadingPin()).toBe(false);
    });
  });

  describe('togglePin', () => {
    it('should pin all tab', async () => {
      component.pinnedTab.set('my');
      mockApiService.PATCH_Configuration.mockResolvedValue({} as any);
      jest.spyOn(component, 'loadPinnedTab').mockResolvedValue();
      jest.useFakeTimers();

      const promise = component.togglePin('all');
      await promise;
      jest.runAllTimers();

      expect(mockApiService.PATCH_Configuration).toHaveBeenCalledWith('contract-table', 'tab', { all: true, self: false });
      expect(component.pinnedTab()).toBe('all');
      expect(mockMyProjectsService.cleanMultiselects).toHaveBeenCalled();
      expect(mockActionsService.showToast).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should pin my tab', async () => {
      component.pinnedTab.set('all');
      mockApiService.PATCH_Configuration.mockResolvedValue({} as any);
      jest.spyOn(component, 'loadPinnedTab').mockResolvedValue();
      jest.useFakeTimers();

      const promise = component.togglePin('my');
      await promise;
      jest.runAllTimers();

      expect(mockApiService.PATCH_Configuration).toHaveBeenCalledWith('contract-table', 'tab', { all: false, self: true });
      expect(component.pinnedTab()).toBe('my');
      expect(mockMyProjectsService.cleanMultiselects).toHaveBeenCalled();
      expect(mockActionsService.showToast).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should unpin when clicking same tab', async () => {
      component.pinnedTab.set('all');
      mockApiService.PATCH_Configuration.mockResolvedValue({} as any);
      jest.spyOn(component, 'loadPinnedTab').mockResolvedValue();
      jest.useFakeTimers();

      const promise = component.togglePin('all');
      await promise;
      jest.runAllTimers();

      expect(component.pinnedTab()).toBe('all');
      jest.useRealTimers();
    });

    it('should handle error when toggling pin', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockApiService.PATCH_Configuration.mockRejectedValue(new Error('API Error'));
      jest.spyOn(component, 'loadPinnedTab').mockResolvedValue();
      jest.useFakeTimers();

      const promise = component.togglePin('all');
      await promise;
      jest.runAllTimers();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockActionsService.showToast).toHaveBeenCalled();
      expect(component.loadingPin()).toBe(false);
      jest.useRealTimers();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('isPinned', () => {
    it('should return true when tab is pinned', () => {
      component.pinnedTab.set('all');
      expect(component.isPinned('all')).toBe(true);
    });

    it('should return false when tab is not pinned', () => {
      component.pinnedTab.set('all');
      expect(component.isPinned('my')).toBe(false);
    });
  });

  describe('onActiveItemChange', () => {
    it('should switch to my projects', () => {
      const event = { id: 'my', label: 'My Projects' };
      jest.spyOn(component, 'loadMyProjects');

      component.onActiveItemChange(event);

      expect(component.myProjectsFilterItem()?.id).toBe('my');
      expect(component.selectedTab()).toBe('my');
      expect(component.myProjectsFirst()).toBe(0);
      expect(component.searchValue).toBe('');
      expect(mockMyProjectsService.clearFilters).toHaveBeenCalled();
      expect(component.loadMyProjects).toHaveBeenCalled();
    });

    it('should switch to all projects', () => {
      const event = { id: 'all', label: 'All Projects' };
      jest.spyOn(component, 'loadAllProjects');

      component.onActiveItemChange(event);

      expect(component.myProjectsFilterItem()?.id).toBe('all');
      expect(component.selectedTab()).toBe('all');
      expect(component.allProjectsFirst()).toBe(0);
      expect(component.searchValue).toBe('');
      expect(mockMyProjectsService.clearFilters).toHaveBeenCalled();
      expect(component.loadAllProjects).toHaveBeenCalled();
    });
  });

  describe('loadMyProjects', () => {
    it('should call service main with current-user true', () => {
      component.loadMyProjects();
      expect(mockMyProjectsService.main).toHaveBeenCalledWith({ 'current-user': true });
    });
  });

  describe('loadAllProjects', () => {
    it('should call service main with current-user false', () => {
      component.loadAllProjects();
      expect(mockMyProjectsService.main).toHaveBeenCalledWith({ 'current-user': false });
    });
  });

  describe('onPinIconClick', () => {
    it('should stop propagation and toggle pin', () => {
      const event = { stopPropagation: jest.fn() } as any;
      jest.spyOn(component, 'togglePin').mockResolvedValue();

      component.onPinIconClick('all', event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.togglePin).toHaveBeenCalledWith('all');
    });
  });

  describe('setSearchInputFilter', () => {
    it('should set search value for my projects', () => {
      component.myProjectsFilterItem.set({ id: 'my', label: 'My Projects' });
      const event = { target: { value: 'test search' } } as any;

      component.setSearchInputFilter(event);

      expect(component.searchValue).toBe('test search');
      expect(component.myProjectsFirst()).toBe(0);
    });

    it('should set search input for all projects', () => {
      component.myProjectsFilterItem.set({ id: 'all', label: 'All Projects' });
      const event = { target: { value: 'test search' } } as any;

      component.setSearchInputFilter(event);

      expect(mockMyProjectsService.searchInput()).toBe('test search');
      expect(component.allProjectsFirst()).toBe(0);
    });
  });

  describe('showFiltersSidebar', () => {
    it('should call service showFilterSidebar', () => {
      component.showFiltersSidebar();
      expect(mockMyProjectsService.showFilterSidebar).toHaveBeenCalled();
    });
  });

  describe('showConfigurationsSidebar', () => {
    it('should be callable without error', () => {
      expect(() => component.showConfigurationsSidebar()).not.toThrow();
    });
  });

  describe('toggleTableView', () => {
    it('should set isTableView to true', () => {
      component.isTableView.set(false);
      component.toggleTableView();
      expect(component.isTableView()).toBe(true);
    });
  });

  describe('toggleCardView', () => {
    it('should set isTableView to false', () => {
      component.isTableView.set(true);
      component.toggleCardView();
      expect(component.isTableView()).toBe(false);
    });
  });

  describe('openProject', () => {
    it('should navigate to project detail', () => {
      const project = { agreement_id: 'A001' } as any;
      component.openProject(project);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/project-detail', 'A001']);
    });

    it('should not navigate if agreement_id is missing', () => {
      const project = {} as any;
      component.openProject(project);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for submitted', () => {
      const result = { result_status: { name: 'Submitted' } } as any;
      expect(component.getStatusColor(result)).toBe('#1689CA');
    });

    it('should return correct color for accepted', () => {
      const result = { result_status: { name: 'Accepted' } } as any;
      expect(component.getStatusColor(result)).toBe('#7CB580');
    });

    it('should return correct color for editing', () => {
      const result = { result_status: { name: 'Editing' } } as any;
      expect(component.getStatusColor(result)).toBe('#F58220');
    });

    it('should return default color for unknown status', () => {
      const result = { result_status: { name: 'Unknown' } } as any;
      expect(component.getStatusColor(result)).toBe('#8D9299');
    });

    it('should return default color when status is missing', () => {
      const result = {} as any;
      expect(component.getStatusColor(result)).toBe('#8D9299');
    });
  });

  describe('openResult', () => {
    it('should navigate to result', () => {
      const result = { platform_code: 'STAR', result_official_code: '001' } as any;
      component.openResult(result);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/result', 'STAR-001']);
    });
  });

  describe('openResultByYear', () => {
    it('should navigate to result with year', () => {
      const result = { platform_code: 'STAR', result_official_code: '001' } as any;
      component.openResultByYear(result, 2024);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/result', 'STAR-001', 2024]);
    });
  });

  describe('getScrollHeight', () => {
    it('should return small screen height', () => {
      mockCacheService.hasSmallScreen.mockReturnValue(true);
      expect(component.getScrollHeight()).toBe('calc(100vh - 410px)');
    });

    it('should return normal screen height', () => {
      mockCacheService.hasSmallScreen.mockReturnValue(false);
      expect(component.getScrollHeight()).toBe('calc(100vh - 440px)');
    });
  });

  describe('getLoadingState', () => {
    it('should return service loading state', () => {
      mockMyProjectsService.loading.set(true);
      expect(component.getLoadingState()).toBe(true);
    });
  });

  describe('getCurrentProjects', () => {
    it('should return filtered projects', () => {
      const projects = [{ agreement_id: 'A001' }] as any;
      mockMyProjectsService.list.set(projects);
      expect(component.getCurrentProjects()).toEqual(projects);
    });
  });

  describe('getCurrentFirst', () => {
    it('should return myProjectsFirst for my tab', () => {
      component.myProjectsFilterItem.set({ id: 'my', label: 'My Projects' });
      component.myProjectsFirst.set(10);
      expect(component.getCurrentFirst()).toBe(10);
    });

    it('should return allProjectsFirst for all tab', () => {
      component.myProjectsFilterItem.set({ id: 'all', label: 'All Projects' });
      component.allProjectsFirst.set(20);
      expect(component.getCurrentFirst()).toBe(20);
    });
  });

  describe('getCurrentRows', () => {
    it('should return myProjectsRows for my tab', () => {
      component.myProjectsFilterItem.set({ id: 'my', label: 'My Projects' });
      component.myProjectsRows.set(15);
      expect(component.getCurrentRows()).toBe(15);
    });

    it('should return allProjectsRows for all tab', () => {
      component.myProjectsFilterItem.set({ id: 'all', label: 'All Projects' });
      component.allProjectsRows.set(25);
      expect(component.getCurrentRows()).toBe(25);
    });
  });

  describe('onCurrentPageChange', () => {
    it('should call onPageChange', () => {
      jest.spyOn(component, 'onPageChange');
      const event = { first: 10, rows: 20 } as any;
      component.onCurrentPageChange(event);
      expect(component.onPageChange).toHaveBeenCalledWith(event);
    });
  });

  describe('onAllProjectsPageChange', () => {
    it('should update allProjectsFirst and allProjectsRows', () => {
      const event = { first: 30, rows: 40 } as any;
      component.onAllProjectsPageChange(event);
      expect(component.allProjectsFirst()).toBe(30);
      expect(component.allProjectsRows()).toBe(40);
    });
  });

  describe('orderedFilterItems', () => {
    it('should return my first when my is pinned', () => {
      component.pinnedTab.set('my');
      const items = component.orderedFilterItems();
      expect(items[0].id).toBe('my');
      expect(items[1].id).toBe('all');
    });

    it('should return all first when all is pinned', () => {
      component.pinnedTab.set('all');
      const items = component.orderedFilterItems();
      expect(items[0].id).toBe('all');
      expect(items[1].id).toBe('my');
    });
  });

  describe('filteredProjects', () => {
    it('should return all projects when no search term for my tab', () => {
      const projects = [{ agreement_id: 'A001' }, { agreement_id: 'A002' }] as any;
      mockMyProjectsService.list.set(projects);
      component.myProjectsFilterItem.set({ id: 'my', label: 'My Projects' });
      component.searchValue = '';

      expect(component.filteredProjects()).toEqual(projects);
    });

    it('should return all projects when no search term for all tab', () => {
      const projects = [{ agreement_id: 'A001' }, { agreement_id: 'A002' }] as any;
      mockMyProjectsService.list.set(projects);
      component.myProjectsFilterItem.set({ id: 'all', label: 'All Projects' });
      mockMyProjectsService.searchInput.set('');

      expect(component.filteredProjects()).toEqual(projects);
    });

    it('should filter projects by full_name for my tab', () => {
      const projects = [
        { agreement_id: 'A001', full_name: 'Test Project' },
        { agreement_id: 'A002', full_name: 'Other Project' }
      ] as any;
      mockMyProjectsService.list.set(projects);
      component.myProjectsFilterItem.set({ id: 'my', label: 'My Projects' });
      component.searchValue = 'test';

      const filtered = component.filteredProjects();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].agreement_id).toBe('A001');
    });

    it('should filter projects by agreement_id', () => {
      const projects = [
        { agreement_id: 'A001', full_name: 'Test' },
        { agreement_id: 'A002', full_name: 'Other' }
      ] as any;
      mockMyProjectsService.list.set(projects);
      component.myProjectsFilterItem.set({ id: 'all', label: 'All Projects' });
      mockMyProjectsService.searchInput.set('a001');

      const filtered = component.filteredProjects();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].agreement_id).toBe('A001');
    });

    it('should filter projects by description', () => {
      const projects = [
        { agreement_id: 'A001', description: 'Test Description' },
        { agreement_id: 'A002', description: 'Other Description' }
      ] as any;
      mockMyProjectsService.list.set(projects);
      component.myProjectsFilterItem.set({ id: 'all', label: 'All Projects' });
      mockMyProjectsService.searchInput.set('test');

      const filtered = component.filteredProjects();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].agreement_id).toBe('A001');
    });

    it('should filter projects by projectDescription', () => {
      const projects = [
        { agreement_id: 'A001', projectDescription: 'Test Project' },
        { agreement_id: 'A002', projectDescription: 'Other Project' }
      ] as any;
      mockMyProjectsService.list.set(projects);
      component.myProjectsFilterItem.set({ id: 'all', label: 'All Projects' });
      mockMyProjectsService.searchInput.set('test');

      const filtered = component.filteredProjects();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].agreement_id).toBe('A001');
    });

    it('should filter projects by principal_investigator', () => {
      const projects = [
        { agreement_id: 'A001', principal_investigator: 'John Doe' },
        { agreement_id: 'A002', principal_investigator: 'Jane Smith' }
      ] as any;
      mockMyProjectsService.list.set(projects);
      component.myProjectsFilterItem.set({ id: 'all', label: 'All Projects' });
      mockMyProjectsService.searchInput.set('john');

      const filtered = component.filteredProjects();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].agreement_id).toBe('A001');
    });

    it('should filter projects when agreement_id is null', () => {
      const projects = [
        { agreement_id: null, full_name: 'Test Project' },
        { agreement_id: 'A002', full_name: 'Other Project' }
      ] as any;
      mockMyProjectsService.list.set(projects);
      component.myProjectsFilterItem.set({ id: 'my', label: 'My Projects' });
      component.searchValue = 'test';

      const filtered = component.filteredProjects();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].full_name).toBe('Test Project');
    });
  });

  describe('searchValue', () => {
    it('should get search value', () => {
      component['_searchValue'].set('test');
      expect(component.searchValue).toBe('test');
    });

    it('should set search value', () => {
      component.searchValue = 'new value';
      expect(component['_searchValue']()).toBe('new value');
    });
  });

  describe('onPageChange', () => {
    it('should set first and rows on page change (with values)', () => {
      component.myProjectsFilterItem.set({ id: 'all', label: 'All Projects' });
      component.onPageChange({ first: 10, rows: 20 });
      expect(component.allProjectsFirst()).toBe(10);
      expect(component.allProjectsRows()).toBe(20);
    });

    it('should set default values on page change (undefined)', () => {
      component.myProjectsFilterItem.set({ id: 'all', label: 'All Projects' });
      component.onPageChange({ first: undefined, rows: undefined });
      expect(component.allProjectsFirst()).toBe(0);
      expect(component.allProjectsRows()).toBe(10);
    });

    it('should set first and rows for my projects tab with values', () => {
      component.myProjectsFilterItem.set({ id: 'my', label: 'My Projects' });
      component.onPageChange({ first: 15, rows: 25 });
      expect(component.myProjectsFirst()).toBe(15);
      expect(component.myProjectsRows()).toBe(25);
    });

    it('should set default values for my projects tab when undefined', () => {
      component.myProjectsFilterItem.set({ id: 'my', label: 'My Projects' });
      component.onPageChange({ first: undefined, rows: undefined });
      expect(component.myProjectsFirst()).toBe(0);
      expect(component.myProjectsRows()).toBe(10);
    });
  });

  describe('onAllProjectsPageChange', () => {
    it('should update allProjectsFirst and allProjectsRows with values', () => {
      const event = { first: 30, rows: 40 } as any;
      component.onAllProjectsPageChange(event);
      expect(component.allProjectsFirst()).toBe(30);
      expect(component.allProjectsRows()).toBe(40);
    });

    it('should set default values when undefined', () => {
      const event = { first: undefined, rows: undefined } as any;
      component.onAllProjectsPageChange(event);
      expect(component.allProjectsFirst()).toBe(0);
      expect(component.allProjectsRows()).toBe(10);
    });
  });
});
