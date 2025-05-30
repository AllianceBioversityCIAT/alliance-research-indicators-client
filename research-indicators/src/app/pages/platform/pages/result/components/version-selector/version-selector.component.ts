import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TransformResultCodeResponse } from '@shared/interfaces/get-transform-result-code.interface';
import { ActionsService } from '@shared/services/actions.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { filter } from 'rxjs';

@Component({
  selector: 'app-version-selector',
  standalone: true,
  templateUrl: './version-selector.component.html',
  imports: [DividerModule, TooltipModule]
})
export class VersionSelectorComponent {
  private readonly api = inject(ApiService);
  private readonly cache = inject(CacheService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly actions = inject(ActionsService);

  selectedResultId = signal<number | null>(null);
  liveVersion = signal<TransformResultCodeResponse | null>(null);
  approvedVersions = signal<TransformResultCodeResponse[]>([]);

  constructor() {
    const router = inject(Router);

    router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.loadVersions();
    });

    effect(() => {
      this.loadVersions();
    });
  }
  private async loadVersions() {
    const resultId = this.cache.currentResultId();
    const response = await this.api.GET_Versions(resultId);
    const data = response.data;
    const liveData = Array.isArray(data.live) && data.live.length > 0 ? data.live[0] : null;
    this.liveVersion.set(liveData);

    const versionsArray = Array.isArray(data.versions) ? data.versions : [];
    this.approvedVersions.set(versionsArray);

    const versionParam = this.route.snapshot.queryParamMap.get('version');
    if (versionParam) {
      const versionFound = versionsArray.find(v => String(v.report_year_id) === versionParam);
      if (versionFound) {
        this.selectedResultId.set(versionFound.result_id);
        return;
      }
    }

    if (liveData && liveData.result_status_id !== 6) {
      this.selectedResultId.set(liveData.result_id);
      return;
    }

    if (!versionParam) {
      const firstApproved = versionsArray.at(0);
      if (firstApproved?.result_id) {
        this.selectedResultId.set(firstApproved.result_id);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { version: firstApproved.report_year_id },
          queryParamsHandling: '',
          replaceUrl: true
        });
      }
    }
  }

  selectVersion(version: TransformResultCodeResponse) {
    this.selectedResultId.set(version.result_id);
    const isLive = this.liveVersion()?.result_id === version.result_id;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: isLive ? {} : { version: String(version.report_year_id) },
      queryParamsHandling: '',
      replaceUrl: true
    });
  }

  isSelected(version: TransformResultCodeResponse) {
    return this.selectedResultId() === version.result_id;
  }

  get hasLiveVersion() {
    return this.liveVersion() !== null && this.liveVersion()?.result_status_id !== 6;
  }

  get liveVersionData(): TransformResultCodeResponse {
    return this.liveVersion()!;
  }

  updateResult() {
    this.actions.showGlobalAlert({
      severity: 'confirm',
      summary: 'CONFIRM UPDATING',
      detail: 'Please confirm the reporting year associated with this update:',
      selectorLabel: 'Reporting year',
      serviceName: 'getYearsByCode',
      selectorRequired: true,
      confirmCallback: {
        label: 'Confirm',
        event: (data?: { comment?: string; selected?: string }) => {
          (async () => {
            const response = await this.api.PATCH_ReportingCycle(this.cache.currentResultId(), data?.selected ?? '');

            if (!response.successfulRequest) {
              this.actions.showToast({ severity: 'error', summary: 'Error', detail: response.errorDetail.errors });
            } else {
              this.router.navigate(['/result', this.cache.currentMetadata().result_official_code]);
              this.loadVersions();

              this.actions.showGlobalAlert({
                severity: 'success',
                hasNoButton: true,
                summary: 'RESULT UPDATED',
                detail: 'The result was updated successfully.'
              });
            }
          })();
        }
      },
      buttonColor: '#035BA9'
    });
  }
}
