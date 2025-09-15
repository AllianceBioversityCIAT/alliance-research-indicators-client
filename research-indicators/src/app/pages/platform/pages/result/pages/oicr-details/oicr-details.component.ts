import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import { SubmissionService } from '@shared/services/submission.service';
import { ActionsService } from '@shared/services/actions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';
import { OicrFormFieldsComponent } from '@shared/components/custom-fields/oicr-form-fields/oicr-form-fields.component';
import { PatchOicr } from '@shared/interfaces/oicr-creation.interface';

@Component({
  selector: 'app-oicr-details',
  imports: [NavigationButtonsComponent, FormsModule, FormHeaderComponent, OicrFormFieldsComponent],
  templateUrl: './oicr-details.component.html'
})
export default class OicrDetailsComponent {
  api = inject(ApiService);
  router = inject(Router);
  body: WritableSignal<PatchOicr> = signal({
    oicr_internal_code: '',
    tagging: { tag_id: 0 },
    outcome_impact_statement: '',
    short_outcome_impact_statement: '',
    maturity_level_id: 0,
    link_result: { external_oicr_id: 0 }
  });

  cache = inject(CacheService);
  actions = inject(ActionsService);
  loading = signal(false);
  submission = inject(SubmissionService);
  versionWatcher = inject(VersionWatcherService);
  route = inject(ActivatedRoute);

  constructor() {
    this.versionWatcher.onVersionChange(() => {
      this.getData();
    });
  }
  async getData() {
    this.loading.set(true);
    const response = await this.api.GET_Oicr(this.cache.getCurrentNumericResultId());

    const data = response.data || {};

    this.body.set(data);
    this.loading.set(false);
  }

  async saveData(page?: 'back' | 'next'): Promise<void> {
    try {
      this.loading.set(true);
      const numericResultId = this.cache.getCurrentNumericResultId();
      const version = this.route.snapshot.queryParamMap.get('version');
      const queryParams = version ? { version } : undefined;

      if (this.submission.isEditableStatus()) {
        const current = this.body();
        const response = await this.api.PATCH_Oicr(numericResultId, current);

        if (!response.successfulRequest) {
          return;
        }

        await this.getData();
        this.actions.showToast({
          severity: 'success',
          summary: 'OICR Details',
          detail: 'Data saved successfully'
        });
      }

      if (page === 'back') {
        this.router.navigate(['result', this.cache.currentResultId(), 'alliance-alignment'], {
          queryParams,
          replaceUrl: true
        });
      }
      if (page === 'next')
        this.router.navigate(['result', this.cache.currentResultId(), 'partners'], {
          queryParams,
          replaceUrl: true
        });
    } finally {
      this.loading.set(false);
    }
  }

  clearOicrSelection(): void {
    this.body.update(current => ({
      ...current,
      link_result: { external_oicr_id: 0 }
    }));
  }
}
