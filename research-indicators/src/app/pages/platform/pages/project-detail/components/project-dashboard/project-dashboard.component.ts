import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeoScopeCardComponent } from '../geo-scope-card/geo-scope-card.component';
import { ProjectDashboardCardComponent } from '../project-dashboard-card/project-dashboard-card.component';
import { ProjectGeneralInfoComponent } from '@shared/components/project-general-info/project-general-info.component';
import { GetTopContributorsContractsService } from '@services/get-top-contributors-contracts.service';
import { GetTopPartnersService } from '@services/get-top-partners.service';
import { GetTopPrimaryLeversService } from '@services/get-top-primary-levers.service';
import { GetGeoScopeService } from '@services/get-geo-scope.service';
import { ApiService } from '@shared/services/api.service';
import { GetProjectDetail } from '@shared/interfaces/get-project-detail.interface';

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [ProjectDashboardCardComponent, GeoScopeCardComponent, ProjectGeneralInfoComponent],
  providers: [GetTopContributorsContractsService, GetTopPartnersService, GetTopPrimaryLeversService, GetGeoScopeService],
  templateUrl: './project-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  readonly contractId = computed(() => this.route.parent?.snapshot.paramMap.get('id') ?? '');
  readonly project = signal<GetProjectDetail>({});

  readonly topContributors = inject(GetTopContributorsContractsService);
  readonly topPartners = inject(GetTopPartnersService);
  readonly topPrimaryLevers = inject(GetTopPrimaryLeversService);
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
      id: item.institution_id != null ? String(item.institution_id) : (item.partner_name ?? String(index)),
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

  constructor() {
    effect(() => {
      const contractId = this.contractId();
      if (contractId) {
        void this.loadProject(contractId);
        this.topContributors.main(contractId, 3);
        this.topPartners.main(contractId, 5);
        this.topPrimaryLevers.main(contractId, 5);
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
