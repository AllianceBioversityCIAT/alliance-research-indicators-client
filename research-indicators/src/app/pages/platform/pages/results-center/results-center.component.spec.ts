import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TabMenuModule } from 'primeng/tabmenu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { PrimeNGConfig } from 'primeng/api';
import { signal, computed } from '@angular/core';
import { MultiSelectModule } from 'primeng/multiselect';

import ResultsCenterComponent from './results-center.component';
import { ResultsCenterService } from './results-center.service';
import { GetResultsService } from '../../../../shared/services/control-list/get-results.service';
import { ResultsCenterTableComponent } from './components/results-center-table/results-center-table.component';
import { IndicatorsTabFilterComponent } from './components/indicators-tab-filter/indicators-tab-filter.component';
import { TableFiltersSidebarComponent } from './components/table-filters-sidebar/table-filters-sidebar.component';
import { TableConfigurationComponent } from './components/table-configuration/table-configuration.component';
import { SectionSidebarComponent } from '../../../../shared/components/section-sidebar/section-sidebar.component';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { Table } from 'primeng/table';

describe('ResultsComponent', () => {
  let component: ResultsCenterComponent;
  let fixture: ComponentFixture<ResultsCenterComponent>;
  let resultsCenterService: ResultsCenterService;
  let getResultsService: GetResultsService;
  let primeNGConfig: PrimeNGConfig;

  beforeEach(async () => {
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
        ResultsCenterTableComponent,
        IndicatorsTabFilterComponent,
        TableFiltersSidebarComponent,
        TableConfigurationComponent,
        SectionSidebarComponent
      ],
      providers: [
        { provide: ResultsCenterService, useValue: {} },
        { provide: GetResultsService, useValue: {} },
        PrimeNGConfig,
        {
          provide: CacheService,
          useValue: {
            dataCache: signal({
              user: {
                sec_user_id: '123'
              }
            }),
            currentResultIsLoading: () => signal(false),
            navbarHeight: signal(0),
            headerHeight: signal(0)
          }
        },
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
          provide: ResultsCenterService,
          useValue: {
            api: {
              indicatorTabs: {
                lazy: () => ({
                  list: signal([]),
                  isLoading: signal(false),
                  hasValue: signal(false)
                })
              }
            },
            multiselectRefs: signal<Record<string, any>>({}),
            resultsFilter: signal({
              'indicator-codes': [],
              'indicator-codes-filter': [],
              'indicator-codes-tabs': [],
              'lever-codes': []
            }),
            showFiltersSidebar: signal(false),
            showConfigurationsSidebar: signal(false),
            applyFilters: jest.fn(),
            clearAllFilters: jest.fn(),
            list: signal([]),
            onActiveItemChange: jest.fn(),
            myResultsFilterItem: signal(undefined),
            myResultsFilterItems: [
              { id: 'all', label: 'All Results' },
              { id: 'my', label: 'My Results' }
            ],
            indicatorsTabFilterList: signal([]),
            countFiltersSelected: signal(undefined),
            loading: signal(false),
            tableColumns: signal([
              {
                field: 'result_official_code',
                header: 'Code',
                getValue: (result: any) => result.result_official_code
              },
              {
                field: 'title',
                header: 'Title',
                getValue: (result: any) => result.title
              }
            ]),
            getAllPathsAsArray: computed(() => ['result_official_code', 'title']),
            tableFilters: signal({
              indicators: []
            }),
            searchInput: signal(''),
            tableRef: signal<Table | undefined>(undefined),
            onSelectFilterTab: jest.fn(),
            getActiveFilters: computed(() => [])
          }
        },
        {
          provide: SectionSidebarComponent,
          useValue: {
            showSignal: signal(false)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsCenterComponent);
    component = fixture.componentInstance;
    resultsCenterService = TestBed.inject(ResultsCenterService);
    getResultsService = TestBed.inject(GetResultsService);
    primeNGConfig = TestBed.inject(PrimeNGConfig);
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
});
