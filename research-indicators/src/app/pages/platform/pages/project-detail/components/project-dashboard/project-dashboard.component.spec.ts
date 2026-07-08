import { Component, Input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { ProjectUtilsService } from '@shared/services/project-utils.service';
import { ResultsCenterService } from '../../../results-center/results-center.service';
import { GetGeoScopeService } from '@shared/services/get-geo-scope.service';
import { GetTopContributorsContractsService } from '@shared/services/get-top-contributors-contracts.service';
import { GetTopMainContactPersonsService } from '@shared/services/get-top-main-contact-persons.service';
import { GetTopPartnersService } from '@shared/services/get-top-partners.service';
import { GetTopPrimaryLeversService } from '@shared/services/get-top-primary-levers.service';
import { FileManagerService } from '@shared/services/file-manager.service';
import { ActionsService } from '@shared/services/actions.service';
import { ProjectDashboardComponent } from './project-dashboard.component';
import { GeoScopeCardComponent } from '../geo-scope-card/geo-scope-card.component';
import { ProjectDashboardCardComponent } from '../project-dashboard-card/project-dashboard-card.component';
import { ResultsCenterTableComponent } from '../../../results-center/components/results-center-table/results-center-table.component';

@Component({
  selector: 'app-project-dashboard-card',
  standalone: true,
  template: ''
})
class ProjectDashboardCardStubComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() compact = false;
  @Input() loading = false;
  @Input() error = false;
  @Input() empty = false;
  @Input() emptyMessage = '';
  @Input() items: unknown[] = [];
  @Input() layout = '';
  @Input() itemHeightPx: number | null = null;
  @Input() iconClass = '';
}

@Component({
  selector: 'app-geo-scope-card',
  standalone: true,
  template: ''
})
class GeoScopeCardStubComponent {}

@Component({
  selector: 'app-results-center-table',
  standalone: true,
  template: ''
})
class ResultsCenterTableStubComponent {
  @Input() hideFiltersToolbar = false;
  @Input() roundedBottom = false;
  @Input() excludedColumnFields: readonly string[] = [];
  @Input() emptyMessage = '';
}

describe('ProjectDashboardComponent', () => {
  let fixture: ComponentFixture<ProjectDashboardComponent>;
  let component: ProjectDashboardComponent;
  let apiMock: { GET_ResultsCount: jest.Mock; GET_Results: jest.Mock };
  let topContributorsMock: ReturnType<typeof createRankedServiceMock>;
  let topMainContactsMock: ReturnType<typeof createRankedServiceMock>;
  let topPartnersMock: ReturnType<typeof createRankedServiceMock>;
  let topLeversMock: ReturnType<typeof createRankedServiceMock>;
  let geoScopeMock: { main: jest.Mock };
  let resultsCenterServiceMock: { initializeProjectDashboardResultsTable: jest.Mock };

  function createRankedServiceMock() {
    return {
      list: signal<any[]>([]),
      loading: signal(false),
      loadError: signal(false),
      main: jest.fn(),
      update: jest.fn()
    };
  }

  async function setup(contractId: string | null = 'C-1') {
    topContributorsMock = createRankedServiceMock();
    topMainContactsMock = createRankedServiceMock();
    topPartnersMock = createRankedServiceMock();
    topLeversMock = createRankedServiceMock();
    geoScopeMock = { main: jest.fn() };
    resultsCenterServiceMock = { initializeProjectDashboardResultsTable: jest.fn() };
    apiMock = {
      GET_ResultsCount: jest.fn().mockResolvedValue({
        data: {
          grant_amount: 1234,
          divisionId: 'D1',
          division: 'Division',
          unitId: 'U1',
          unit: 'Unit',
          indicators: [
            { indicator: { indicator_id: 1, name: 'Output' }, count_results: 2 },
            { indicator_id: 99, full_name: 'Fallback indicator', count_results: 4 },
            { indicator_id: null, count_results: undefined }
          ]
        }
      }),
      GET_Results: jest.fn().mockResolvedValue({
        data: {
          results: [
            { result_status: { result_status_id: 2, name: 'Submitted', config: { color: { text: '#111111' } } } },
            { result_status: { result_status_id: 2, name: 'Submitted', config: { color: { text: '#111111' } } } },
            { result_status: { result_status_id: 1 } },
            { result_status: { result_status_id: 'invalid' } }
          ]
        }
      })
    };

    await TestBed.configureTestingModule({
      imports: [ProjectDashboardComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { parent: { snapshot: { paramMap: convertToParamMap(contractId ? { id: contractId } : {}) } } } },
        { provide: ApiService, useValue: apiMock },
        {
          provide: ProjectUtilsService,
          useValue: {
            getLeverName: jest.fn().mockReturnValue('Lever name'),
            sortIndicators: jest.fn((items: any[]) => items)
          }
        },
        { provide: ResultsCenterService, useValue: resultsCenterServiceMock },
        { provide: FileManagerService, useValue: { uploadFile: jest.fn() } },
        { provide: ActionsService, useValue: { showToast: jest.fn() } }
      ]
    })
      .overrideComponent(ProjectDashboardComponent, {
        remove: {
          imports: [ProjectDashboardCardComponent, GeoScopeCardComponent, ResultsCenterTableComponent],
          providers: [
            GetTopContributorsContractsService,
            GetTopMainContactPersonsService,
            GetTopPartnersService,
            GetTopPrimaryLeversService,
            GetGeoScopeService
          ]
        },
        add: {
          imports: [ProjectDashboardCardStubComponent, GeoScopeCardStubComponent, ResultsCenterTableStubComponent],
          providers: [
            { provide: GetTopContributorsContractsService, useValue: topContributorsMock },
            { provide: GetTopMainContactPersonsService, useValue: topMainContactsMock },
            { provide: GetTopPartnersService, useValue: topPartnersMock },
            { provide: GetTopPrimaryLeversService, useValue: topLeversMock },
            { provide: GetGeoScopeService, useValue: geoScopeMock }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should load project dashboard data for the parent contract', async () => {
    await setup();

    expect(apiMock.GET_ResultsCount).toHaveBeenCalledWith('C-1');
    expect(apiMock.GET_Results).toHaveBeenCalledWith(
      { 'contract-codes': ['C-1'] },
      undefined,
      { page: 1, limit: 10000, sortField: 'code', sortOrder: 'DESC' }
    );
    expect(topContributorsMock.main).toHaveBeenCalledWith('C-1', 4);
    expect(topMainContactsMock.main).toHaveBeenCalledWith('C-1', 4);
    expect(topPartnersMock.main).toHaveBeenCalledWith('C-1', 4);
    expect(topLeversMock.main).toHaveBeenCalledWith('C-1', 4);
    expect(geoScopeMock.main).toHaveBeenCalledWith('C-1');
    expect(resultsCenterServiceMock.initializeProjectDashboardResultsTable).toHaveBeenCalledWith('C-1');
  });

  it('should compute project summaries and formatted labels', async () => {
    await setup();

    expect(component.indicatorSummaries().map(item => item.label)).toEqual(['Fallback indicator', 'Output', 'Indicator']);
    expect(component.totalProjectResults()).toBe(6);
    expect(component.indicatorsWithResults().map(item => item.value)).toEqual([4, 2]);
    expect(component.indicatorSharePercent(3)).toBe(50);
  });

  it('should handle empty project response and empty contract id', async () => {
    await setup(null);

    expect(apiMock.GET_ResultsCount).not.toHaveBeenCalled();
    expect(component.contractId()).toBe('');
    expect(component.indicatorSharePercent(1)).toBe(0);
  });

  it('should set empty project when the project endpoint has no data', async () => {
    await setup();
    apiMock.GET_ResultsCount.mockResolvedValueOnce({});

    await (component as any).loadProject('C-2');

    expect(component.project()).toEqual({});
  });

  it('should build and sort ranked service items', async () => {
    await setup();

    topContributorsMock.list.set([
      { contract_code: 'C-2', contract_description: 'Contributor', results_count: 1 },
      { project_name: 'Only project', count: 3 },
      { contract_id: 'C-3' },
      {}
    ]);
    topMainContactsMock.list.set([
      { name: 'Named', results_count: 1, email: 'named@example.com' },
      { full_name: 'Full Name', count: 2 },
      { contact_person_name: 'Contact Name', value: 3 },
      { label: 'Label Name' },
      { first_name: 'First', last_name: 'Last' },
      {}
    ]);
    topPartnersMock.list.set([
      { institution_id: 2, acronym: 'ABC', institution_name: 'Institution', results_count: 1 },
      { institution_id: null, partner_name: 'Partner', count: 2 },
      { institution_id: undefined, count: 3 },
      {}
    ]);
    topLeversMock.list.set([
      { lever_id: 1, short_name: 'RA', full_name: 'RA: Research area', count: 1, icon: 'icon.svg' },
      { lever_id: 2, short_name: 'L', full_name: 'L:', count: 3 },
      { lever_id: 3, short_name: '', full_name: '', count: 2 }
    ]);

    expect(component.contributorItems().map(item => item.label)).toEqual(['Only project', 'C-2 - Contributor', 'C-3', '—']);
    expect(component.mainContactPersonItems().map(item => item.label)).toEqual([
      'Contact Name',
      'Full Name',
      'Named',
      'Label Name',
      'First Last',
      '—'
    ]);
    expect(component.partnerItems().map(item => item.id)).toEqual(['2', 'Partner', '2', '3']);
    expect(component.partnerItems().map(item => item.label)).toContain('ABC - Institution');
    expect(component.leverItems().map(item => item.label)).toEqual(['L', '—', 'RA - RESEARCH AREA']);
  });

  it('should handle status response without result rows and lever labels with empty prefixes', async () => {
    await setup();
    apiMock.GET_Results.mockResolvedValueOnce({});

    await (component as any).loadProjectResultsByStatus('C-2');

    expect(component.statusChartItems()).toEqual([]);

    topLeversMock.list.set([{ lever_id: 4, short_name: 'RA', full_name: ': Research area', count: 1 }]);
    expect(component.leverItems()[0].label).toBe('RA - RESEARCH AREA');
  });

  it('should compute empty states from loading, error, and list signals', async () => {
    await setup();

    expect(component.contributorsEmpty()).toBe(true);
    expect(component.mainContactPersonsEmpty()).toBe(true);
    expect(component.partnersEmpty()).toBe(true);
    expect(component.leversEmpty()).toBe(true);

    topContributorsMock.loading.set(true);
    topMainContactsMock.loadError.set(true);
    topPartnersMock.list.set([{}]);
    topLeversMock.list.set([{}]);

    expect(component.contributorsEmpty()).toBe(false);
    expect(component.mainContactPersonsEmpty()).toBe(false);
    expect(component.partnersEmpty()).toBe(false);
    expect(component.leversEmpty()).toBe(false);
  });

  it('should compute status chart values and handle failures', async () => {
    await setup();

    expect(component.statusChartItems()).toEqual([
      { color: '#111111', label: 'Submitted', value: 2, result_status_id: 2 },
      { color: '#1689CA', label: 'Unknown status', value: 1, result_status_id: 1 }
    ]);
    expect(component.statusBarsMax()).toBe(2);
    expect(component.statusBarFillPercent(1)).toBe(50);
    expect(component.statusBarFillPercent(5)).toBe(100);

    apiMock.GET_Results.mockRejectedValueOnce(new Error('fail'));
    await (component as any).loadProjectResultsByStatus('C-2');

    expect(component.statusChartItems()).toEqual([]);
    expect(component.statusChartError()).toBe(true);
    expect(component.statusChartLoading()).toBe(false);
    expect(component.statusBarsMax()).toBe(0);
    expect(component.statusBarFillPercent(1)).toBe(0);
  });

  it('should compute zero share when indicator value is not positive', async () => {
    await setup();

    expect(component.indicatorSharePercent(0)).toBe(0);
  });
});
