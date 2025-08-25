import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TabMenuModule } from 'primeng/tabmenu';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { signal, computed, Component } from '@angular/core';
import { MultiSelectModule } from 'primeng/multiselect';

import ResultsCenterComponent from './results-center.component';
import { ResultsCenterService } from './results-center.service';
import { GetResultsService } from '../../../../shared/services/control-list/get-results.service';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { ApiService } from '../../../../shared/services/api.service';
import { ActionsService } from '../../../../shared/services/actions.service';

// Mock components
@Component({
  selector: 'app-results-center-table',
  template: '<div>Mock Results Center Table</div>'
})
class MockResultsCenterTableComponent {}

@Component({
  selector: 'app-indicators-tab-filter',
  template: '<div>Mock Indicators Tab Filter</div>'
})
class MockIndicatorsTabFilterComponent {}

@Component({
  selector: 'app-table-filters-sidebar',
  template: '<div>Mock Table Filters Sidebar</div>'
})
class MockTableFiltersSidebarComponent {}

@Component({
  selector: 'app-table-configuration',
  template: '<div>Mock Table Configuration</div>'
})
class MockTableConfigurationComponent {}

@Component({
  selector: 'app-section-sidebar',
  template: '<div>Mock Section Sidebar</div>'
})
class MockSectionSidebarComponent {}

describe('ResultsComponent', () => {
  let component: ResultsCenterComponent;
  let fixture: ComponentFixture<ResultsCenterComponent>;
  let resultsCenterService: ResultsCenterService;
  let getResultsService: GetResultsService;

  beforeEach(async () => {
    const mockCacheService = {
      windowHeight: signal(window.innerHeight),
      hasSmallScreen: computed(() => window.innerHeight < 768),
      headerHeight: signal(50),
      navbarHeight: signal(50),
      tableFiltersSidebarHeight: signal(50),
      dataCache: signal({
        access_token: 'mock_token',
        user: { sec_user_id: 123 }
      }),
      isLoggedIn: signal(true),
      currentResultIsLoading: signal(false),
      currentResultIndicatorSectionPath: computed(() => ''),
      toggleSidebar: jest.fn()
    };

    const mockApiService = {
      GET_Configuration: jest.fn().mockResolvedValue({ data: { all: '1', self: '0' } }),
      PATCH_Configuration: jest.fn().mockResolvedValue({}),
      indicatorTabs: {
        lazy: () => ({
          list: signal([]),
          isLoading: signal(false),
          hasValue: signal(false)
        })
      }
    };

    const mockActionsService = {
      showToast: jest.fn()
    };

    const mockResultsCenterService = {
      api: mockApiService,
      multiselectRefs: signal<Record<string, any>>({}),
      resultsFilter: signal({
        'indicator-codes': [],
        'indicator-codes-filter': [],
        'indicator-codes-tabs': [],
        'lever-codes': [],
        'create-user-codes': [],
        'status-codes': [],
        'contract-codes': [],
        years: []
      }),
      showFiltersSidebar: signal(false),
      showConfigurationsSidebar: signal(false),
      applyFilters: jest.fn(),
      clearAllFilters: jest.fn(),
      cleanFilters: jest.fn(),
      resetState: jest.fn(),
      main: jest.fn(),
      list: signal([]),
      onActiveItemChange: jest.fn(),
      myResultsFilterItem: signal(undefined),
      myResultsFilterItems: [
        { id: 'all', label: 'All Results' },
        { id: 'my', label: 'My Results' }
      ],
      indicatorsTabFilterList: signal([]),
      countFiltersSelected: computed(() => undefined),
      countTableFiltersSelected: computed(() => undefined),
      loading: signal(false),
      tableColumns: signal([
        {
          field: 'result_official_code',
          header: 'Code',
          path: 'result_official_code',
          getValue: (result: any) => result.result_official_code,
          hideIf: () => false,
          hideFilterIf: () => false
        },
        {
          field: 'title',
          header: 'Title',
          path: 'title',
          getValue: (result: any) => result.title,
          hideIf: () => false,
          hideFilterIf: () => false
        }
      ]),
      getAllPathsAsArray: computed(() => ['result_official_code', 'title']),
      tableFilters: signal({
        indicators: []
      }),
      searchInput: signal(''),
      tableRef: signal<Table | undefined>(undefined),
      onSelectFilterTab: jest.fn(),
      getActiveFilters: computed(() => []),
      showFilterSidebar: jest.fn(),
      showConfigSidebar: jest.fn(),
      cleanMultiselects: jest.fn(),
      resultsConfig: signal({}),
      getResultsService: {
        getInstance: jest.fn().mockResolvedValue(signal([]))
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        ResultsCenterComponent,
        HttpClientTestingModule,
        RouterModule,
        BrowserAnimationsModule,
        TabMenuModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        TagModule,
        MenuModule,
        FormsModule,
        MultiSelectModule,
        MockResultsCenterTableComponent,
        MockIndicatorsTabFilterComponent,
        MockTableFiltersSidebarComponent,
        MockTableConfigurationComponent,
        MockSectionSidebarComponent
      ],
      providers: [
        { provide: ResultsCenterService, useValue: mockResultsCenterService },
        { provide: GetResultsService, useValue: {} },
        { provide: CacheService, useValue: mockCacheService },
        { provide: ApiService, useValue: mockApiService },
        { provide: ActionsService, useValue: mockActionsService },
        {
          provide: RouterModule,
          useValue: {
            navigate: jest.fn()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jest.fn()
              }
            }
          }
        },
        {
          provide: MockSectionSidebarComponent,
          useValue: {
            showSignal: signal(false)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsCenterComponent);
    component = fixture.componentInstance;
    resultsCenterService = TestBed.inject(ResultsCenterService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle sidebar', () => {
    const initialValue = component.showSignal();
    component.toggleSidebar();
    expect(component.showSignal()).toBe(!initialValue);
  });

  it('should apply filters', () => {
    const spy = jest.spyOn(resultsCenterService, 'applyFilters');
    component.applyFilters();
    expect(spy).toHaveBeenCalled();
  });

  it('should have showSignal initialized as false', () => {
    expect(component.showSignal()).toBe(false);
  });

  it('should toggle showSignal from false to true', () => {
    expect(component.showSignal()).toBe(false);
    component.toggleSidebar();
    expect(component.showSignal()).toBe(true);
  });

  it('should toggle showSignal from true to false', () => {
    component.showSignal.set(true);
    expect(component.showSignal()).toBe(true);
    component.toggleSidebar();
    expect(component.showSignal()).toBe(false);
  });

  it('should have injected services', () => {
    expect(component.api).toBeDefined();
    expect(component.resultsCenterService).toBeDefined();
    expect(component.cache).toBeDefined();
  });
});
