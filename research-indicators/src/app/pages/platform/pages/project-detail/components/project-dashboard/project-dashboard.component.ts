import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeoScopeCardComponent } from '../geo-scope-card/geo-scope-card.component';
import { ProjectDashboardCardComponent } from '../project-dashboard-card/project-dashboard-card.component';
import { GetTopContributorsContractsService } from '@services/get-top-contributors-contracts.service';
import { GetTopMainContactPersonsService } from '@services/get-top-main-contact-persons.service';
import { GetTopPartnersService } from '@services/get-top-partners.service';
import { GetTopPrimaryLeversService } from '@services/get-top-primary-levers.service';
import { GetGeoScopeService } from '@services/get-geo-scope.service';
import { ApiService } from '@shared/services/api.service';
import { GetProjectDetail, GetProjectDetailIndicator } from '@shared/interfaces/get-project-detail.interface';
import { ProjectDashboardRankedItem } from '@interfaces/project-dashboard.interface';
import { projectDashboardBarColor } from '@shared/constants/project-dashboard-chart-colors.constants';
import { ProjectUtilsService } from '@shared/services/project-utils.service';
import { ResultsCenterTableComponent } from '../../../results-center/components/results-center-table/results-center-table.component';
import { ResultsCenterService } from '../../../results-center/results-center.service';
import { Result } from '@shared/interfaces/result/result.interface';

interface ProjectStatusChartItem {
  color: string;
  label: string;
  value: number;
  result_status_id: number;
}

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [ProjectDashboardCardComponent, GeoScopeCardComponent, ResultsCenterTableComponent],
  providers: [
    GetTopContributorsContractsService,
    GetTopMainContactPersonsService,
    GetTopPartnersService,
    GetTopPrimaryLeversService,
    GetGeoScopeService
  ],
  templateUrl: './project-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly projectUtils = inject(ProjectUtilsService);
  private readonly resultsCenterService = inject(ResultsCenterService);

  readonly contractId = computed(() => this.route.parent?.snapshot.paramMap.get('id') ?? '');
  readonly project = signal<GetProjectDetail>({});

  readonly indicatorSummaries = computed(() => {
    const indicators = this.projectUtils.sortIndicators([...(this.project().indicators ?? [])]);
    const ranked = indicators
      .map((indicator, index) => ({
        id: indicator.indicator?.indicator_id ?? indicator.indicator_id ?? index,
        indicatorId: indicator.indicator?.indicator_id ?? indicator.indicator_id ?? null,
        label: formatIndicatorName(indicator),
        value: Number(indicator.count_results ?? 0),
        color: getIndicatorChartColor(indicator, index, indicators.length)
      }))
      .sort((first, second) => second.value - first.value);

    return ranked;
  });

  readonly indicatorsWithResults = computed(() => this.indicatorSummaries().filter(indicator => indicator.value > 0));

  readonly totalProjectResults = computed(() => this.indicatorSummaries().reduce((total, indicator) => total + indicator.value, 0));
  readonly statusChartItems = signal<ProjectStatusChartItem[]>([]);
  readonly statusChartLoading = signal(false);
  readonly statusChartError = signal(false);
  readonly statusBarsMax = computed(() => {
    const items = this.statusChartItems();
    if (!items.length) {
      return 0;
    }
    return Math.max(...items.map(item => item.value), 0);
  });

  readonly topContributors = inject(GetTopContributorsContractsService);
  readonly topMainContactPersons = inject(GetTopMainContactPersonsService);
  readonly topPartners = inject(GetTopPartnersService);
  readonly topPrimaryLevers = inject(GetTopPrimaryLeversService);
  private readonly geoScope = inject(GetGeoScopeService);

  readonly contributorItems = computed(() =>
    this.topContributors
      .list()
      .map((item, index) => ({
        id: item.contract_code ?? item.contract_id ?? String(index),
        label: formatContributorLabel(item),
        count: Number(item.results_count ?? item.count ?? 0)
      }))
      .sort((first, second) => second.count - first.count)
  );

  readonly contributorsEmpty = computed(
    () => !this.topContributors.loading() && !this.topContributors.loadError() && this.topContributors.list().length === 0
  );

  readonly mainContactPersonItems = computed(() =>
    this.topMainContactPersons
      .list()
      .map((item, index) => ({
        id: formatMainContactPersonName(item) ?? String(index),
        label: formatMainContactPersonName(item) ?? '—',
        count: Number(item.results_count ?? item.count ?? item.value ?? 0),
        description: item.email
      }))
      .sort((first, second) => second.count - first.count)
  );

  readonly mainContactPersonsEmpty = computed(
    () =>
      !this.topMainContactPersons.loading() &&
      !this.topMainContactPersons.loadError() &&
      this.topMainContactPersons.list().length === 0
  );

  readonly partnerItems = computed(() =>
    this.topPartners.list().map((item, index) => ({
      id: getPartnerItemId(item, index),
      label: formatPartnerLabel(item),
      count: Number(item.results_count ?? item.count ?? 0)
    }))
  );

  readonly partnersEmpty = computed(() => !this.topPartners.loading() && !this.topPartners.loadError() && this.topPartners.list().length === 0);

  readonly leverItems = computed(() =>
    this.topPrimaryLevers
      .list()
      .map(item => ({
        id: String(item.lever_id),
        label: formatLeverDisplayLabel(item.short_name, item.full_name),
        count: item.count,
        iconUrl: item.icon || undefined
      }))
      .sort((first, second) => second.count - first.count)
  );

  readonly leversEmpty = computed(
    () => !this.topPrimaryLevers.loading() && !this.topPrimaryLevers.loadError() && this.topPrimaryLevers.list().length === 0
  );

  readonly pendingRevisionExcludedColumns = ['status', 'year', 'versions', 'creation_date', 'public_link', 'project'] as const;

  constructor() {
    effect(() => {
      const contractId = this.contractId();
      if (contractId) {
        void this.loadProject(contractId);
        void this.loadProjectResultsByStatus(contractId);
        this.topContributors.main(contractId, 4);
        this.topMainContactPersons.main(contractId, 4);
        this.topPartners.main(contractId, 4);
        this.topPrimaryLevers.main(contractId, 4);
        this.geoScope.main(contractId);
        this.resultsCenterService.initializeProjectDashboardResultsTable(contractId);
      }
    });
  }

  private async loadProject(contractId: string): Promise<void> {
    const response = await this.api.GET_ResultsCount(contractId);
    if (response?.data) {
      this.project.set(response.data);
    } else {
      this.project.set({});
    }
  }

  indicatorSharePercent(value: number): number {
    const total = this.totalProjectResults();
    if (total <= 0 || value <= 0) {
      return 0;
    }

    return Math.round((value / total) * 100);
  }

  statusBarFillPercent(value: number): number {
    const max = this.statusBarsMax();
    if (max <= 0) {
      return 0;
    }
    return Math.min(100, (value / max) * 100);
  }

  private async loadProjectResultsByStatus(contractId: string): Promise<void> {
    this.statusChartLoading.set(true);
    this.statusChartError.set(false);

    try {
      const response = await this.api.GET_Results(
        { 'contract-codes': [contractId] },
        undefined,
        { page: 1, limit: 10_000, sortField: 'code', sortOrder: 'DESC' }
      );
      this.statusChartItems.set(buildStatusChartItems(response?.data?.results ?? []));
    } catch {
      this.statusChartItems.set([]);
      this.statusChartError.set(true);
    } finally {
      this.statusChartLoading.set(false);
    }
  }
}

function formatLeverDisplayLabel(shortName: string, fullName: string): string {
  const colonIndex = fullName.indexOf(':');
  if (colonIndex >= 0) {
    const prefix = fullName.slice(0, colonIndex).trim() || shortName;
    const suffix = fullName.slice(colonIndex + 1).trim();
    return suffix ? `${prefix} - ${suffix}`.toUpperCase() : prefix.toUpperCase();
  }

  return (fullName || shortName || '—').toUpperCase();
}

function formatMainContactPersonName(item: ProjectDashboardRankedItem): string | undefined {
  const firstLastName = [item.first_name, item.last_name].filter(Boolean).join(' ').trim();
  return item.name ?? item.full_name ?? item.contact_person_name ?? item.label ?? (firstLastName || undefined);
}

function formatContributorLabel(item: ProjectDashboardRankedItem): string {
  const contractId = item.contract_id ?? item.contract_code;
  const label = item.contract_description ?? item.project_name;
  if (contractId && label) {
    return `${contractId} - ${label}`;
  }
  return label ?? contractId ?? '—';
}

function formatPartnerLabel(item: ProjectDashboardRankedItem): string {
  const name = item.institution_name ?? item.partner_name ?? '—';
  const acronym = item.acronym?.trim();
  return acronym && name !== '—' ? `${acronym} - ${name}` : name;
}

function buildStatusChartItems(results: Result[]): ProjectStatusChartItem[] {
  const statuses = new Map<number, ProjectStatusChartItem>();

  for (const result of results) {
    const status = result.result_status;
    const statusId = Number(status?.result_status_id);
    if (!Number.isFinite(statusId)) {
      continue;
    }

    const current = statuses.get(statusId);
    if (current) {
      current.value += 1;
      continue;
    }

    statuses.set(statusId, {
      color: status?.config?.color?.text || '#1689CA',
      label: status?.name || 'Unknown status',
      value: 1,
      result_status_id: statusId
    });
  }

  return [...statuses.values()].sort((first, second) => second.value - first.value);
}

function getPartnerItemId(item: ProjectDashboardRankedItem, index: number): string {
  if (item.institution_id === null || item.institution_id === undefined) {
    return item.partner_name ?? String(index);
  }

  return String(item.institution_id);
}

function formatIndicatorName(indicator: GetProjectDetailIndicator): string {
  return indicator.indicator?.name ?? indicator.full_name ?? 'Indicator';
}

function getIndicatorChartColor(indicator: GetProjectDetailIndicator, fallbackIndex: number, totalIndicators: number): string {
  const indicatorId = indicator.indicator?.indicator_id ?? indicator.indicator_id;
  const colorsByIndicatorId: Record<number, string> = {
    1: '#1689CA',
    2: '#7CB580',
    3: '#78288c',
    4: '#CF0808',
    5: '#F58220',
    6: '#173f6f'
  };

  return typeof indicatorId === 'number'
    ? (colorsByIndicatorId[indicatorId] ?? projectDashboardBarColor(fallbackIndex, totalIndicators))
    : projectDashboardBarColor(fallbackIndex, totalIndicators);
}

