import { Component, effect, inject, signal } from '@angular/core';
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

  // Versión seleccionada
  selectedResultId = signal<number | null>(null);

  // Datos de la API
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
  }

  selectVersion(version: TransformResultCodeResponse) {
    this.selectedResultId.set(version.result_id);
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
