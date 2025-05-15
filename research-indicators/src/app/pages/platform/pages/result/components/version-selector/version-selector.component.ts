import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransformResultCodeResponse } from '@shared/interfaces/get-transform-result-code.interface';
import { ApiService } from '@shared/services/api.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-version-selector',
  standalone: true,
  templateUrl: './version-selector.component.html',
  imports: [DividerModule]
})
export class VersionSelectorComponent {
  private readonly api = inject(ApiService);
  private readonly cache = inject(CacheService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  selectedResultId = signal<number | null>(null);
  liveVersion = signal<TransformResultCodeResponse | null>(null);
  approvedVersions = signal<TransformResultCodeResponse[]>([]);

  constructor() {
    effect(() => {
      this.loadVersions();
    });
  }

  private async loadVersions() {
    const resultId = this.cache.currentResultId();
    const response = await this.api.GET_Versions(resultId);
    const data = response.data;

    this.liveVersion.set(data.live ?? null);

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

    if (data.live) {
      this.selectedResultId.set(data.live.result_id);
    }
  }

  selectVersion(version: TransformResultCodeResponse) {
    this.selectedResultId.set(version.result_id);
    const isLive = this.liveVersion()?.result_id === version.result_id;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: isLive ? {} : { version: version.report_year_id },
      queryParamsHandling: '',
      replaceUrl: true
    });
  }

  isSelected(version: TransformResultCodeResponse) {
    return this.selectedResultId() === version.result_id;
  }

  get hasLiveVersion() {
    return this.liveVersion() !== null;
  }

  get liveVersionData(): TransformResultCodeResponse {
    return this.liveVersion()!;
  }
}
