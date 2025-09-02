import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';
import { SubmissionService } from '@shared/services/submission.service';
import { ActionsService } from '@shared/services/actions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';
import { SelectComponent } from '@shared/components/custom-fields/select/select.component';
import { PatchOicr } from '@shared/interfaces/oicr-creation.interface';
import { Tooltip } from 'primeng/tooltip';
import { TextareaComponent } from '@shared/components/custom-fields/textarea/textarea.component';
import { OICR_HELPER_TEXTS } from '@shared/constants/oicr-helper-texts.constants';

@Component({
  selector: 'app-oicr-details',
  imports: [NavigationButtonsComponent, TextareaComponent, FormsModule, FormHeaderComponent, Tooltip, InputComponent, SelectComponent],
  templateUrl: './oicr-details.component.html'
})
export default class OicrDetailsComponent {
  api = inject(ApiService);
  router = inject(Router);
  body: WritableSignal<PatchOicr> = signal({
    oicr_internal_code: '',
    tagging: [{ tag_id: 0 }],
    outcome_impact_statement: '',
    short_outcome_impact_statement: '',
    maturity_level_id: 0,
    link_result: [{ external_oicr_id: 0 }]
  });

  cache = inject(CacheService);
  actions = inject(ActionsService);
  loading = signal(false);
  submission = inject(SubmissionService);
  versionWatcher = inject(VersionWatcherService);
  route = inject(ActivatedRoute);

  taggingHelperText = OICR_HELPER_TEXTS.taggingHelperText;
  outcomeImpactStatementHelperText = OICR_HELPER_TEXTS.outcomeImpactStatementHelperText;
  maturityLevelHelperText = OICR_HELPER_TEXTS.maturityLevelHelperText;

  constructor() {
    this.versionWatcher.onVersionChange(() => {
      this.getData();
    });
  }
  async getData() {
    this.loading.set(true);
    const response = await this.api.GET_Oicr(this.cache.currentResultId());

    const data = response.data || {};
    this.body.set(data);
    this.loading.set(false);
  }

  async saveData(page?: 'back'): Promise<void> {
    this.loading.set(true);

    const resultId = this.cache.currentResultId().toString();
    const version = this.route.snapshot.queryParamMap.get('version');
    const queryParams = version ? { version } : undefined;

    const navigateTo = (path: string) => {
      this.router.navigate(['result', resultId, path], {
        queryParams,
        replaceUrl: true
      });
    };

    if (this.submission.isEditableStatus()) {
      const current = this.body();

      this.body.set({ ...current, tagging: current.tagging });

      const response = await this.api.PATCH_Oicr(Number(resultId), this.body());
      if (!response.successfulRequest) {
        this.loading.set(false);
        return;
      }

      await this.getData();

      this.actions.showToast({
        severity: 'success',
        summary: 'OICR Details',
        detail: 'Data saved successfully'
      });
    }

    if (page === 'back') navigateTo('alliance-alignment');

    this.loading.set(false);
  }

  clearOicrSelection(): void {
    this.body.update(current => ({
      ...current,
      link_result: []
    }));
  }
}
