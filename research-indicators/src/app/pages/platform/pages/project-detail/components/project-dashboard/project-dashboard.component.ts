import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeoScopeCardComponent } from '../geo-scope-card/geo-scope-card.component';
import { ProjectDashboardCardComponent } from '../project-dashboard-card/project-dashboard-card.component';
import { GetTopContributorsContractsService } from '@services/get-top-contributors-contracts.service';
import { GetTopPartnersService } from '@services/get-top-partners.service';
import { GetTopPrimaryLeversService } from '@services/get-top-primary-levers.service';
import { GetGeoScopeService } from '@services/get-geo-scope.service';
import { GetContractStaffService } from '@services/get-contract-staff.service';
import { ApiService } from '@shared/services/api.service';
import { GetProjectDetail, GetProjectDetailIndicator } from '@shared/interfaces/get-project-detail.interface';
import { ProjectDashboardRankedItem } from '@interfaces/project-dashboard.interface';
import { projectDashboardBarColor } from '@shared/constants/project-dashboard-chart-colors.constants';
import { ProjectUtilsService } from '@shared/services/project-utils.service';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';
import { ResultsCenterTableComponent } from '../../../results-center/components/results-center-table/results-center-table.component';
import { ResultsCenterService } from '../../../results-center/results-center.service';

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [DatePipe, ProjectDashboardCardComponent, GeoScopeCardComponent, CustomTagComponent, ResultsCenterTableComponent],
  providers: [
    GetTopContributorsContractsService,
    GetTopPartnersService,
    GetTopPrimaryLeversService,
    GetGeoScopeService,
    GetContractStaffService
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

  readonly projectLeverName = computed(() => this.projectUtils.getLeverName(this.project()));
  readonly projectStatus = computed(() => this.projectUtils.getStatusDisplay(this.project()));

  readonly indicatorSummaries = computed(() => {
    const ranked = this.projectUtils
      .sortIndicators([...(this.project().indicators ?? [])])
      .map((indicator, index) => ({
        id: indicator.indicator?.indicator_id ?? indicator.indicator_id ?? index,
        label: formatIndicatorName(indicator),
        value: Number(indicator.count_results ?? 0)
      }))
      .sort((first, second) => second.value - first.value);

    return ranked.map((indicator, index) => ({
      ...indicator,
      color: projectDashboardBarColor(index, ranked.length)
    }));
  });

  readonly indicatorsWithResults = computed(() => this.indicatorSummaries().filter(indicator => indicator.value > 0));

  readonly totalProjectResults = computed(() =>
    this.indicatorSummaries().reduce((total, indicator) => total + indicator.value, 0)
  );

  readonly topContributors = inject(GetTopContributorsContractsService);
  readonly topPartners = inject(GetTopPartnersService);
  readonly topPrimaryLevers = inject(GetTopPrimaryLeversService);
  readonly contractStaff = inject(GetContractStaffService);
  private readonly geoScope = inject(GetGeoScopeService);

  readonly contributorItems = computed(() =>
    this.topContributors
      .list()
      .map((item, index) => ({
        id: item.contract_code ?? item.contract_id ?? String(index),
        label: item.contract_description ?? item.contract_code ?? item.contract_id ?? item.project_name ?? '—',
        count: Number(item.results_count ?? item.count ?? 0)
      }))
      .sort((first, second) => second.count - first.count)
  );

  readonly contributorsEmpty = computed(
    () => !this.topContributors.loading() && !this.topContributors.loadError() && this.topContributors.list().length === 0
  );

  readonly partnerItems = computed(() =>
    this.topPartners.list().map((item, index) => ({
      id: getPartnerItemId(item, index),
      label: item.institution_name ?? item.partner_name ?? '—',
      count: Number(item.results_count ?? item.count ?? 0)
    }))
  );

  readonly partnersEmpty = computed(
    () => !this.topPartners.loading() && !this.topPartners.loadError() && this.topPartners.list().length === 0
  );

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

  readonly staffEmpty = computed(
    () => !this.contractStaff.loading() && !this.contractStaff.loadError() && this.contractStaff.staff().length === 0
  );

  readonly pendingRevisionExcludedColumns = ['status', 'year', 'versions', 'creation_date', 'public_link'] as const;

  constructor() {
    effect(() => {
      const contractId = this.contractId();
      if (contractId) {
        void this.loadProject(contractId);
        this.topContributors.main(contractId, 3);
        this.topPartners.main(contractId, 5);
        this.topPrimaryLevers.main(contractId, 5);
        this.contractStaff.main(contractId);
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

  getContactInitials(name: string): string {
    return getContactInitialsFromName(name);
  }

  indicatorSharePercent(value: number): number {
    const total = this.totalProjectResults();
    if (total <= 0 || value <= 0) {
      return 0;
    }

    return Math.round((value / total) * 100);
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

function getPartnerItemId(item: ProjectDashboardRankedItem, index: number): string {
  if (item.institution_id === null || item.institution_id === undefined) {
    return item.partner_name ?? String(index);
  }

  return String(item.institution_id);
}

function formatIndicatorName(indicator: GetProjectDetailIndicator): string {
  return indicator.indicator?.name ?? indicator.full_name ?? 'Indicator';
}

function getContactInitialsFromName(name: string): string {
  const parts = name.split(',').map(part => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
  }

  return (words[0]?.charAt(0) ?? '?').toUpperCase();
}
