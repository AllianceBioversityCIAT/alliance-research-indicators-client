import { Component, effect, inject, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TransformResultCodeResponse } from '@shared/interfaces/get-transform-result-code.interface';
import { ActionsService } from '@shared/services/actions.service';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-version-selector',
  standalone: true,
  templateUrl: './version-selector.component.html',
  imports: [DividerModule, TooltipModule]
})
export class VersionSelectorComponent implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly cache = inject(CacheService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly actions = inject(ActionsService);

  selectedResultId = signal<number | null>(null);
  liveVersion = signal<TransformResultCodeResponse | null>(null);
  approvedVersions = signal<TransformResultCodeResponse[]>([]);

  private versionEffectCleanup: any;
  private routerEventsSub: Subscription | undefined;
  private hasAutoNavigated = false;

  constructor() {
    this.routerEventsSub = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.loadVersions();
    });

    this.versionEffectCleanup = effect(() => {
      this.loadVersions();
    });
  }

  ngOnDestroy() {
    if (this.versionEffectCleanup && typeof this.versionEffectCleanup.destroy === 'function') {
      this.versionEffectCleanup.destroy();
    }
    if (this.routerEventsSub) {
      this.routerEventsSub.unsubscribe();
    }
  }

  private async loadVersions() {
    const resultId = this.cache.currentResultId();
    if (!resultId || resultId <= 0) return;
    const response = await this.api.GET_Versions(resultId);
    const data = response.data;
    const liveData = Array.isArray(data.live) && data.live.length > 0 ? data.live[0] : null;
    this.liveVersion.set(liveData);

    const versionsArray = Array.isArray(data.versions) ? data.versions : [];
    this.approvedVersions.set(versionsArray);

    const versionParam = this.route.snapshot.queryParamMap.get('version');
    let selectedVersion = null;

    if (versionParam) {
      selectedVersion = versionsArray.find(v => String(v.report_year_id) === versionParam);
      if (selectedVersion) {
        if (this.selectedResultId() !== selectedVersion.result_id) {
          this.selectedResultId.set(selectedVersion.result_id);
        }
        // No navegar, ya está correcto
        return;
      }
    }

    if (!versionParam && liveData && liveData.result_status_id !== 6) {
      if (this.selectedResultId() !== liveData.result_id) {
        this.selectedResultId.set(liveData.result_id);
      }
      return;
    }

    // Si no hay parámetro version y no hay live version, navega a la primera versión aprobada
    if (!versionParam && !liveData && versionsArray.length > 0 && !this.hasAutoNavigated) {
      const firstApproved = versionsArray[0];
      this.selectedResultId.set(firstApproved.result_id);
      const urlParts = this.router.url.split('/');
      const currentChild = urlParts.length > 3 ? urlParts[3].split('?')[0] : 'general-information';
      if (currentChild === 'general-information') {
        this.router.navigate(['/result', resultId, currentChild], {
          queryParams: { version: firstApproved.report_year_id },
          replaceUrl: true
        });
        this.hasAutoNavigated = true;
      }
      return;
    }

    // Si hay live version y no hay parámetro, selecciona la live version
    if (liveData && liveData.result_status_id !== 6) {
      if (this.selectedResultId() !== liveData.result_id) {
        this.selectedResultId.set(liveData.result_id);
      }
      // Solo navega si la subruta actual es general-information y falta versionParam
      const urlParts = this.router.url.split('/');
      const currentChild = urlParts.length > 3 ? urlParts[3].split('?')[0] : 'general-information';
      if (!versionParam && currentChild === 'general-information') {
        this.router.navigate(['/result', resultId, currentChild], { replaceUrl: true });
      }
      // Si estás en otra subruta, no navegues
      return;
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

  private isResultRouteActive(resultId: string | number): boolean {
    // Verifica que la URL actual contiene /result/{id}
    return this.router.url.startsWith(`/result/${resultId}`);
  }
}
