import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import ProjectDetailComponent from './project-detail.component';
import { ApiService } from '@services/api.service';
import { signal } from '@angular/core';
import { ResultsCenterService } from '../results-center/results-center.service';

describe('ProjectComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let apiService: { GET_ResultsCount: jest.Mock };
  let router: { events: Subject<unknown>; navigate: jest.Mock; parseUrl: jest.Mock; url: string };
  let resultsCenterService: {
    primaryContractId: ReturnType<typeof signal<string>>;
    showFiltersSidebar: ReturnType<typeof signal<boolean>>;
    showConfigurationsSidebar: ReturnType<typeof signal<boolean>>;
    tableFilters: ReturnType<typeof signal<any>>;
    resultsFilter: ReturnType<typeof signal<any>>;
    appliedFilters: ReturnType<typeof signal<any>>;
    searchInput: ReturnType<typeof signal<string>>;
    myResultsFilterItem: ReturnType<typeof signal<any>>;
    myResultsFilterItems: { id: string; label: string }[];
    restorePersistedState: jest.Mock;
    activateStatePersistence: jest.Mock;
    deactivateStatePersistence: jest.Mock;
    resetState: jest.Mock;
    main: jest.Mock;
    applyFilters: jest.Mock;
  };
  const activatedRoute = {
    snapshot: {
      paramMap: new Map(),
      params: { id: 'mock-id' }
    },
    params: of({ id: 'mock-id' })
  };

  beforeEach(async () => {
    const emptyResultFilter = {
      'indicator-codes': [],
      'lever-codes': [],
      'indicator-codes-tabs': [],
      'indicator-codes-filter': [],
      'status-codes': [],
      'contract-codes': [],
      'platform-code': [],
      years: [],
      'create-user-codes': []
    };
    apiService = {
      GET_ResultsCount: jest.fn().mockResolvedValue({ data: {} })
    };
    router = {
      events: new Subject<unknown>(),
      navigate: jest.fn(),
      parseUrl: jest.fn((url: string) => ({
        root: {
          children: {
            [PRIMARY_OUTLET]: {
              segments: url
                .split('/')
                .filter(Boolean)
                .map(path => ({ path }))
            }
          }
        }
      })),
      url: '/projects/mock-id/project-results'
    };
    resultsCenterService = {
      primaryContractId: signal(''),
      showFiltersSidebar: signal(true),
      showConfigurationsSidebar: signal(true),
      tableFilters: signal({ indicators: [], statusCodes: [], sources: [], years: [], contracts: [], levers: [] }),
      resultsFilter: signal({ ...emptyResultFilter }),
      appliedFilters: signal({ ...emptyResultFilter }),
      searchInput: signal(''),
      myResultsFilterItems: [
        { id: 'all', label: 'All Results' },
        { id: 'my', label: 'My Results' }
      ],
      myResultsFilterItem: signal({ id: 'all', label: 'All Results' }),
      restorePersistedState: jest.fn(() => null),
      activateStatePersistence: jest.fn(),
      deactivateStatePersistence: jest.fn(),
      resetState: jest.fn(),
      main: jest.fn(),
      applyFilters: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: [
        { provide: ApiService, useValue: apiService },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute
        },
        { provide: Router, useValue: router },
        { provide: ResultsCenterService, useValue: resultsCenterService }
      ]
    })
      .overrideComponent(ProjectDetailComponent, {
        set: {
          imports: [],
          template: `<div class="w-full"></div>`
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose dashboard and results tabs', () => {
    expect(component.tabs()).toEqual([
      { label: 'Project Dashboard', route: 'project-dashboard' },
      { label: 'Project Results', route: 'project-results' }
    ]);
  });

  it('should build the project title from the current project data', () => {
    component.currentProject.set({
      projectDescription: 'EMBRAPA',
      description: 'Establishment of the international coconut gene bank'
    });

    expect(component.projectTitle()).toBe('EMBRAPA - Establishment of the international coconut gene bank');
  });

  it('should set contractId and call getProjectDetail on ngOnInit', () => {
    const getProjectDetailSpy = jest.spyOn(component, 'getProjectDetail').mockImplementation(jest.fn());
    component.ngOnInit();
    expect(component.contractId()).toBe('mock-id');
    expect(getProjectDetailSpy).toHaveBeenCalled();
    expect(resultsCenterService.primaryContractId()).toBe('mock-id');
    expect(resultsCenterService.activateStatePersistence).toHaveBeenCalledWith('project-detail:mock-id');
    expect(resultsCenterService.resetState).toHaveBeenCalled();
    getProjectDetailSpy.mockRestore();
  });

  it('should restore persisted results center state when available', () => {
    const getProjectDetailSpy = jest.spyOn(component, 'getProjectDetail').mockImplementation(jest.fn());
    resultsCenterService.main.mockClear();
    resultsCenterService.resetState.mockClear();
    resultsCenterService.restorePersistedState.mockReturnValue(true);

    component.ngOnInit();

    expect(resultsCenterService.main).toHaveBeenCalled();
    expect(resultsCenterService.resetState).not.toHaveBeenCalled();
    getProjectDetailSpy.mockRestore();
  });

  it('should discard a restored pending revision-only filter from the dashboard fixed table', () => {
    const getProjectDetailSpy = jest.spyOn(component, 'getProjectDetail').mockImplementation(jest.fn());
    resultsCenterService.restorePersistedState.mockReturnValue(true);
    resultsCenterService.tableFilters.set({
      indicators: [],
      statusCodes: [{ result_status_id: 5, name: 'Pending Revision' }],
      sources: [],
      years: [],
      contracts: [],
      levers: []
    });
    resultsCenterService.resultsFilter.update(prev => ({ ...prev, 'status-codes': [5] }));
    resultsCenterService.appliedFilters.update(prev => ({ ...prev, 'status-codes': [5] }));
    resultsCenterService.main.mockClear();
    resultsCenterService.resetState.mockClear();

    component.ngOnInit();

    expect(resultsCenterService.resetState).toHaveBeenCalled();
    expect(resultsCenterService.main).not.toHaveBeenCalled();
    getProjectDetailSpy.mockRestore();
  });

  it('should update the last segment when navigation ends', () => {
    const getLastSegmentSpy = jest.spyOn(component, 'getLastSegment');
    router.url = '/projects/mock-id/project-dashboard';

    router.events.next(new NavigationEnd(1, '/projects/mock-id/project-dashboard', '/projects/mock-id/project-dashboard'));

    expect(getLastSegmentSpy).toHaveBeenCalledTimes(1);
    expect(component.lastSegment()).toBe('project-dashboard');
  });

  it('should keep project results as the selected segment when the URL ends with contract id or has no path', () => {
    component.contractId.set('mock-id');

    router.url = '/projects/mock-id';
    component.getLastSegment();
    expect(component.lastSegment()).toBe('project-results');

    router.url = '';
    component.getLastSegment();
    expect(component.lastSegment()).toBe('project-results');
  });

  it('should keep project results as the selected segment when the primary outlet is missing', () => {
    router.parseUrl.mockReturnValueOnce({ root: { children: {} } });

    component.getLastSegment();

    expect(component.lastSegment()).toBe('project-results');
  });

  it('should navigate to the project results root tab and restore persisted state', () => {
    resultsCenterService.restorePersistedState.mockReturnValue(true);
    jest.clearAllMocks();

    component.onTabClick({ label: 'Project Results', route: 'project-results' });

    expect(component.lastSegment()).toBe('project-results');
    expect(router.navigate).toHaveBeenCalledWith(['./'], { relativeTo: activatedRoute });
    expect(resultsCenterService.restorePersistedState).toHaveBeenCalledWith('project-detail:mock-id');
    expect(resultsCenterService.resetState).not.toHaveBeenCalled();
    expect(resultsCenterService.main).toHaveBeenCalled();
  });

  it('should navigate to child tabs', () => {
    component.onTabClick({ label: 'Project Dashboard', route: 'project-dashboard' });

    expect(component.lastSegment()).toBe('project-dashboard');
    expect(resultsCenterService.deactivateStatePersistence).toHaveBeenCalledWith('project-detail:mock-id');
    expect(router.navigate).toHaveBeenCalledWith(['project-dashboard'], { relativeTo: activatedRoute });
  });

  it('should not activate project results persistence when initialized on the dashboard tab', () => {
    router.url = '/projects/mock-id/project-dashboard';
    resultsCenterService.restorePersistedState.mockClear();
    resultsCenterService.activateStatePersistence.mockClear();
    resultsCenterService.resetState.mockClear();

    const dashboardFixture = TestBed.createComponent(ProjectDetailComponent);
    const dashboardComponent = dashboardFixture.componentInstance;
    jest.spyOn(dashboardComponent, 'getProjectDetail').mockImplementation(jest.fn());

    dashboardFixture.detectChanges();

    expect(dashboardComponent.lastSegment()).toBe('project-dashboard');
    expect(resultsCenterService.restorePersistedState).not.toHaveBeenCalled();
    expect(resultsCenterService.activateStatePersistence).not.toHaveBeenCalled();
    expect(resultsCenterService.resetState).not.toHaveBeenCalled();

    dashboardFixture.destroy();
  });

  it('should deactivate persisted state and close sidebars on destroy', () => {
    component.contractId.set('mock-id');

    component.ngOnDestroy();

    expect(resultsCenterService.deactivateStatePersistence).toHaveBeenCalledWith('project-detail:mock-id');
    expect(resultsCenterService.showFiltersSidebar()).toBe(false);
    expect(resultsCenterService.showConfigurationsSidebar()).toBe(false);
  });

  it('should set currentProject with indicators and set full_name', async () => {
    const mockResponse = {
      data: {
        indicators: [{ indicator: { name: 'Test' } }]
      }
    };
    apiService.GET_ResultsCount.mockResolvedValue(mockResponse as any);
    await component.getProjectDetail();
    expect(component.currentProject()).toBe(mockResponse.data);
    expect(component.currentProject()?.indicators?.[0]?.full_name).toBe('Test');
  });

  it('should set currentProject with no indicators', async () => {
    const mockResponse = { data: {} };
    apiService.GET_ResultsCount.mockResolvedValue(mockResponse as any);
    await component.getProjectDetail();
    expect(component.currentProject()).toBe(mockResponse.data);
  });

  it('should handle null response', async () => {
    apiService.GET_ResultsCount.mockResolvedValue(null as any);
    await component.getProjectDetail();
    expect(component.currentProject()).toBe(undefined);
  });

  it('should handle empty response', async () => {
    apiService.GET_ResultsCount.mockResolvedValue({} as any);
    await component.getProjectDetail();
    expect(component.currentProject()).toBe(undefined);
  });

  describe('onIndicatorClick', () => {
    it('should clear indicator filters, set the clicked indicator, and apply filters', () => {
      const updateSpy = jest.spyOn(component.resultsCenterService.tableFilters, 'update');
      const applyFiltersSpy = jest.spyOn(component.resultsCenterService, 'applyFilters');
      const indicator = { indicator_id: 1, name: 'Innovation Development' };

      component.onIndicatorClick(indicator);

      expect(updateSpy).toHaveBeenCalledTimes(2);
      expect(updateSpy).toHaveBeenNthCalledWith(1, expect.any(Function));
      const firstUpdateFn = updateSpy.mock.calls[0][0];
      expect(firstUpdateFn({ indicators: [{ indicator_id: 99, name: 'Previous' }] } as any)).toEqual({ indicators: [] });

      expect(updateSpy).toHaveBeenNthCalledWith(2, expect.any(Function));
      const secondUpdateFn = updateSpy.mock.calls[1][0];
      expect(secondUpdateFn({} as any)).toEqual({
        indicators: [{ indicator_id: 1, name: 'Innovation Development' }]
      });

      expect(applyFiltersSpy).toHaveBeenCalled();
    });
  });
});
