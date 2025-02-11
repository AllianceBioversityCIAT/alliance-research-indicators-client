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
import { signal } from '@angular/core';

import ResultsCenterComponent from './results-center.component';
import { ResultsCenterService } from './results-center.service';
import { GetResultsService } from '../../../../shared/services/control-list/get-results.service';
import { ResultsCenterTableComponent } from './components/results-center-table/results-center-table.component';
import { IndicatorsTabFilterComponent } from './components/indicators-tab-filter/indicators-tab-filter.component';
import { TableFiltersSidebarComponent } from './components/table-filters-sidebar/table-filters-sidebar.component';
import { TableConfigurationComponent } from './components/table-configuration/table-configuration.component';
import { SectionSidebarComponent } from '../../../../shared/components/section-sidebar/section-sidebar.component';
import { CacheService } from '../../../../shared/services/cache/cache.service';

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
        ResultsCenterTableComponent,
        IndicatorsTabFilterComponent,
        TableFiltersSidebarComponent,
        TableConfigurationComponent,
        SectionSidebarComponent
      ],
      providers: [
        ResultsCenterService,
        GetResultsService,
        PrimeNGConfig,
        {
          provide: CacheService,
          useValue: {
            dataCache: signal({
              user: {
                sec_user_id: '123'
              }
            }),
            currentResultIsLoading: () => signal(false)
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
            resultsFilter: signal({
              indicatorsCodes: []
            }),
            showFiltersSidebar: signal(false),
            showConfigurationsSidebar: signal(false),
            applyFilters: jest.fn(),
            list: jest.fn(),
            onActiveItemChange: jest.fn()
          }
        },
        {
          provide: SectionSidebarComponent,
          useValue: {
            showSignal: () => true
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
});
