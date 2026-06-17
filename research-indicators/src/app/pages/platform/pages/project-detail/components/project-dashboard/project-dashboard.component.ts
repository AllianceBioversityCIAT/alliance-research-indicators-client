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

interface IndicatorSummarySegment {
  id: number;
  label: string;
  value: number;
  color: string;
  start: number;
  end: number;
}

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [DatePipe, ProjectDashboardCardComponent, GeoScopeCardComponent, CustomTagComponent],
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

  readonly contractId = computed(() => this.route.parent?.snapshot.paramMap.get('id') ?? '');
  readonly project = signal<GetProjectDetail>({});

  readonly projectLeverName = computed(() => this.projectUtils.getLeverName(this.project()));
  readonly projectStatus = computed(() => this.projectUtils.getStatusDisplay(this.project()));

  readonly indicatorSummaries = computed(() =>
    this.projectUtils
      .sortIndicators([...(this.project().indicators ?? [])])
      .map((indicator, index) => ({
        id: indicator.indicator?.indicator_id ?? indicator.indicator_id ?? index,
        label: formatIndicatorName(indicator),
        value: Number(indicator.count_results ?? 0),
        color: projectDashboardBarColor(index, this.project().indicators?.length ?? 0)
      }))
      .sort((first, second) => second.value - first.value)
  );

  readonly totalProjectResults = computed(() =>
    this.indicatorSummaries().reduce((total, indicator) => total + indicator.value, 0)
  );

  readonly indicatorDonutSegments = computed<IndicatorSummarySegment[]>(() => {
    const total = this.totalProjectResults();
    if (total <= 0) {
      return [];
    }

    let accumulated = 0;
    return this.indicatorSummaries()
      .filter(indicator => indicator.value > 0)
      .map(indicator => {
        const start = (accumulated / total) * 100;
        accumulated += indicator.value;
        return {
          ...indicator,
          start,
          end: (accumulated / total) * 100
        };
      });
  });

  readonly indicatorDonutGradient = computed(() => {
    const segments = this.indicatorDonutSegments();
    if (!segments.length) {
      return 'conic-gradient(#e8ebed 0 100%)';
    }

    return `conic-gradient(${segments.map(formatDonutSegment).join(', ')})`;
  });

  readonly topContributors = inject(GetTopContributorsContractsService);
  readonly topPartners = inject(GetTopPartnersService);
  readonly topPrimaryLevers = inject(GetTopPrimaryLeversService);
  readonly contractStaff = inject(GetContractStaffService);
  private readonly geoScope = inject(GetGeoScopeService);

  readonly contributorItems = computed(() =>
    this.topContributors.list().map((item, index) => ({
      id: item.contract_code ?? item.contract_id ?? String(index),
      label: item.contract_description ?? item.contract_code ?? item.contract_id ?? item.project_name ?? '—',
      count: Number(item.results_count ?? item.count ?? 0)
    }))
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
    this.topPrimaryLevers.list().map(item => ({
      id: String(item.lever_id),
      label: formatLeverDisplayLabel(item.short_name, item.full_name),
      count: item.count,
      iconUrl: item.icon || undefined
    }))
  );

  readonly leversEmpty = computed(
    () => !this.topPrimaryLevers.loading() && !this.topPrimaryLevers.loadError() && this.topPrimaryLevers.list().length === 0
  );

  readonly staffEmpty = computed(
    () => !this.contractStaff.loading() && !this.contractStaff.loadError() && this.contractStaff.staff().length === 0
  );

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
  const name = indicator.indicator?.name ?? indicator.full_name ?? 'Indicator';
  const maxLength = 22;
  if (name.length <= maxLength) {
    return name;
  }

  return `${name.slice(0, maxLength - 1).trimEnd()}.`;
}

function formatDonutSegment(segment: IndicatorSummarySegment): string {
  return [segment.color, `${segment.start}%`, `${segment.end}%`].join(' ');
}
