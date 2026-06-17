import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ProjectDashboardComponent } from './project-dashboard.component';
import { GetTopContributorsContractsService } from '@services/get-top-contributors-contracts.service';
import { GetTopPartnersService } from '@services/get-top-partners.service';
import { GetTopPrimaryLeversService } from '@services/get-top-primary-levers.service';
import { GetGeoScopeService } from '@services/get-geo-scope.service';
import { GetContractStaffService } from '@services/get-contract-staff.service';
import { ApiService } from '@shared/services/api.service';
import {
  ContractStaffItem,
  GeoScopeSummary,
  ProjectDashboardRankedItem,
  TopPrimaryLeverItem
} from '@interfaces/project-dashboard.interface';
import { GeoScopeCountry } from '@interfaces/geo-scope.interface';

describe('ProjectDashboardComponent', () => {
  let component: ProjectDashboardComponent;
  let fixture: ComponentFixture<ProjectDashboardComponent>;
  let topContributors: ReturnType<typeof createRankedServiceMock>;
  let topPartners: ReturnType<typeof createRankedServiceMock>;
  let topPrimaryLevers: ReturnType<typeof createPrimaryLeverServiceMock>;
  let geoScope: ReturnType<typeof createGeoScopeServiceMock>;
  let contractStaff: ReturnType<typeof createContractStaffServiceMock>;
  let api: { GET_ResultsCount: jest.Mock };
  let route: { parent?: { snapshot: { paramMap: { get(key: string): string | null } } } };

  beforeEach(async () => {
    topContributors = createRankedServiceMock();
    topPartners = createRankedServiceMock();
    topPrimaryLevers = createPrimaryLeverServiceMock();
    contractStaff = createContractStaffServiceMock();
    geoScope = createGeoScopeServiceMock();
    api = { GET_ResultsCount: jest.fn().mockResolvedValue({ data: { agreement_id: 'A100' } }) };
    route = {
      parent: { snapshot: { paramMap: { get: (key: string) => (key === 'id' ? 'A100' : null) } } }
    };

    await TestBed.configureTestingModule({
      imports: [ProjectDashboardComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: route
        },
        { provide: ApiService, useValue: api },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
      .overrideComponent(ProjectDashboardComponent, {
        set: {
          providers: [
            { provide: GetTopContributorsContractsService, useValue: topContributors },
            { provide: GetTopPartnersService, useValue: topPartners },
            { provide: GetTopPrimaryLeversService, useValue: topPrimaryLevers },
            { provide: GetContractStaffService, useValue: contractStaff },
            { provide: GetGeoScopeService, useValue: geoScope }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load dashboard data for the contract id', async () => {
    expect(component).toBeTruthy();
    expect(topContributors.main).toHaveBeenCalledWith('A100', 3);
    expect(topPartners.main).toHaveBeenCalledWith('A100', 5);
    expect(topPrimaryLevers.main).toHaveBeenCalledWith('A100', 5);
    expect(contractStaff.main).toHaveBeenCalledWith('A100');
    expect(geoScope.main).toHaveBeenCalledWith('A100');
    await Promise.resolve();
    expect(api.GET_ResultsCount).toHaveBeenCalledWith('A100');
  });

  it('should map contributor, partner, lever and staff empty states', () => {
    topContributors.list.set([
      { contract_code: 'C1', contract_description: 'Contract 1', count: 2 },
      { contract_id: 'CID', project_name: 'Project fallback', results_count: 1 },
      {}
    ]);
    topPartners.list.set([
      { institution_id: 1, institution_name: 'Partner 1', results_count: 3 },
      { partner_name: 'Partner without id', count: 1 },
      {}
    ]);
    topPrimaryLevers.list.set([
      { lever_id: 1, short_name: 'L1', full_name: 'Lever 1: Food systems', count: 4, icon: 'icon.svg' },
      { lever_id: 2, short_name: 'L2', full_name: 'Lever 2:', count: 1 },
      { lever_id: 3, short_name: '', full_name: '', count: 0 },
      { lever_id: 4, short_name: 'L4', full_name: ': Climate', count: 2 }
    ]);
    contractStaff.staff.set([{ name: 'Person', role: 'Lead' }]);

    expect(component.contributorItems()).toEqual([
      { id: 'C1', label: 'Contract 1', count: 2 },
      { id: 'CID', label: 'CID', count: 1 },
      { id: '2', label: '—', count: 0 }
    ]);
    expect(component.partnerItems()).toEqual([
      { id: '1', label: 'Partner 1', count: 3 },
      { id: 'Partner without id', label: 'Partner without id', count: 1 },
      { id: '2', label: '—', count: 0 }
    ]);
    expect(component.leverItems()).toEqual([
      { id: '1', label: 'LEVER 1 - FOOD SYSTEMS', count: 4, iconUrl: 'icon.svg' },
      { id: '2', label: 'LEVER 2', count: 1, iconUrl: undefined },
      { id: '3', label: '—', count: 0, iconUrl: undefined },
      { id: '4', label: 'L4 - CLIMATE', count: 2, iconUrl: undefined }
    ]);
    expect(component.contributorsEmpty()).toBe(false);
    expect(component.partnersEmpty()).toBe(false);
    expect(component.leversEmpty()).toBe(false);
    expect(component.staffEmpty()).toBe(false);
  });

  it('should keep empty states false while loading or errored', () => {
    topContributors.loading.set(true);
    topPartners.loadError.set(true);
    topPrimaryLevers.loading.set(true);
    contractStaff.loadError.set(true);

    expect(component.contributorsEmpty()).toBe(false);
    expect(component.partnersEmpty()).toBe(false);
    expect(component.leversEmpty()).toBe(false);
    expect(component.staffEmpty()).toBe(false);
  });

  it('should build sorted indicator summaries and donut segments', async () => {
    api.GET_ResultsCount.mockResolvedValueOnce({
      data: {
        agreement_id: 'A100',
        contract_status: 'completed',
        lever_name: 'Nutrition',
        indicators: [
          {
            indicator_id: 1,
            full_name: 'Fallback indicator',
            count_results: 0,
            indicator: {
              indicator_id: 1,
              name: 'Capacity Sharing for Development',
              icon_src: '',
              is_active: 1,
              description: '',
              other_names: null,
              long_description: '',
              indicator_type_id: 1
            }
          },
          {
            indicator_id: 2,
            count_results: 8,
            indicator: {
              indicator_id: 2,
              name: 'Very long indicator name to truncate',
              icon_src: '',
              is_active: 1,
              description: '',
              other_names: null,
              long_description: '',
              indicator_type_id: 1
            }
          },
          {
            indicator_id: 3,
            count_results: 2,
            indicator: {
              indicator_id: 3,
              name: 'Policy Change',
              icon_src: '',
              is_active: 1,
              description: '',
              other_names: null,
              long_description: '',
              indicator_type_id: 1
            }
          }
        ]
      }
    });

    await (component as unknown as { loadProject(contractId: string): Promise<void> }).loadProject('A100');

    expect(component.projectLeverName()).toBe('Nutrition');
    expect(component.projectStatus()).toEqual({ statusId: 2, statusName: 'Completed' });
    expect(component.totalProjectResults()).toBe(10);
    expect(component.indicatorSummaries().map(item => item.value)).toEqual([8, 2, 0]);
    expect(component.indicatorSummaries()[0].label).toBe('Very long indicator n.');
    expect(component.indicatorDonutSegments()).toEqual([
      expect.objectContaining({ value: 8, start: 0, end: 80 }),
      expect.objectContaining({ value: 2, start: 80, end: 100 })
    ]);
    expect(component.indicatorDonutGradient()).toContain('conic-gradient');
  });

  it('should reset project when project count endpoint returns no data', async () => {
    component.project.set({ agreement_id: 'existing' });
    api.GET_ResultsCount.mockResolvedValueOnce({});

    await (component as unknown as { loadProject(contractId: string): Promise<void> }).loadProject('A404');

    expect(component.project()).toEqual({});
    expect(component.indicatorDonutSegments()).toEqual([]);
    expect(component.indicatorDonutGradient()).toBe('conic-gradient(#e8ebed 0 100%)');
  });

  it('should handle indicator fallback ids', () => {
    component.project.set({
      indicators: [
        {
          indicator_id: 22,
          count_results: undefined,
          indicator: {
            name: 'Policy Change',
            icon_src: '',
            is_active: 1,
            description: '',
            other_names: null,
            long_description: '',
            indicator_type_id: 1
          }
        } as never,
        {
          count_results: 1,
          indicator: {
            name: 'Indicator',
            icon_src: '',
            is_active: 1,
            description: '',
            other_names: null,
            indicator_id: 0,
            long_description: '',
            indicator_type_id: 1
          }
        } as never
      ]
    });

    expect(component.indicatorSummaries()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 22, label: 'Policy Change', value: 0 }),
        expect.objectContaining({ id: 0, label: 'Indicator', value: 1 })
      ])
    );
  });

  it('should handle route and indicator name fallback branches', () => {
    const testingComponent = component as unknown as {
      projectUtils: {
        sortIndicators(indicators: unknown[]): unknown[];
        getLeverName(project: unknown): string;
        getStatusDisplay(project: unknown): { statusId: number; statusName: string };
      };
    };
    testingComponent.projectUtils = {
      sortIndicators: indicators => indicators,
      getLeverName: () => '—',
      getStatusDisplay: () => ({ statusId: 0, statusName: 'Unknown' })
    };
    component.project.set({
      indicators: [
        { indicator_id: 50, full_name: 'Fallback full name', count_results: 1 },
        { count_results: undefined }
      ] as never
    });

    expect(component.indicatorSummaries()).toEqual([
      expect.objectContaining({ id: 50, label: 'Fallback full name', value: 1 }),
      expect.objectContaining({ id: 1, label: 'Indicator', value: 0 })
    ]);

    testingComponent.projectUtils = {
      sortIndicators: () => [
        {
          indicator: {
            indicator_id: 7,
            name: 'Synthetic indicator'
          },
          count_results: 1
        }
      ],
      getLeverName: () => '—',
      getStatusDisplay: () => ({ statusId: 0, statusName: 'Unknown' })
    };
    component.project.set({});
    expect(component.indicatorSummaries()[0]).toEqual(
      expect.objectContaining({ id: 7, label: 'Synthetic indicator', value: 1 })
    );
  });

  it('should not load services when the route has no contract id', () => {
    fixture.destroy();
    api.GET_ResultsCount.mockClear();
    topContributors.main.mockClear();
    route.parent = undefined;

    const noIdFixture = TestBed.createComponent(ProjectDashboardComponent);
    const noIdComponent = noIdFixture.componentInstance;
    noIdFixture.detectChanges();

    expect(noIdComponent.contractId()).toBe('');
    expect(api.GET_ResultsCount).not.toHaveBeenCalled();
    expect(topContributors.main).not.toHaveBeenCalled();
  });
});

function createRankedServiceMock() {
  return {
    main: jest.fn(),
    list: signal<ProjectDashboardRankedItem[]>([]),
    loading: signal(false),
    loadError: signal(false),
    update: jest.fn()
  };
}

function createPrimaryLeverServiceMock() {
  return {
    main: jest.fn(),
    list: signal<TopPrimaryLeverItem[]>([]),
    loading: signal(false),
    loadError: signal(false),
    update: jest.fn()
  };
}

function createContractStaffServiceMock() {
  return {
    main: jest.fn(),
    staff: signal<ContractStaffItem[]>([]),
    loading: signal(false),
    loadError: signal(false),
    update: jest.fn()
  };
}

function createGeoScopeServiceMock() {
  return {
    main: jest.fn(),
    summary: signal<Partial<GeoScopeSummary>>({}),
    topRegionsList: signal<ProjectDashboardRankedItem[]>([]),
    topCountries: signal<GeoScopeCountry[]>([]),
    loading: signal(false),
    loadError: signal(false),
    update: jest.fn()
  };
}
