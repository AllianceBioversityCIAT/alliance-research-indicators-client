import { Component, inject, signal, WritableSignal } from '@angular/core';
import { GetContractsService } from '@services/control-list/get-contracts.service';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { GetAllianceAlignment } from '../../../../../../shared/interfaces/get-alliance-alignment.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../../../../environments/environment';
import { SubmissionService } from '@shared/services/submission.service';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';
import { GetSdgsService } from '@shared/services/control-list/get-sdgs.service';

@Component({
  selector: 'app-alliance-alignment',
  imports: [MultiSelectModule, FormHeaderComponent, FormsModule, MultiselectComponent, NavigationButtonsComponent, DatePipe],
  templateUrl: './alliance-alignment.component.html'
})
export default class AllianceAlignmentComponent {
  environment = environment;
  getContractsService = inject(GetContractsService);
  getSdgsService = inject(GetSdgsService);
  body: WritableSignal<GetAllianceAlignment> = signal({
    contracts: [],
    result_sdgs: []
  });
  apiService = inject(ApiService);
  cache = inject(CacheService);
  actions = inject(ActionsService);
  router = inject(Router);
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
    const response = await this.apiService.GET_Alignments(this.cache.currentResultId());

    // Map the data back to the format expected by the multiselect
    const mappedData = {
      contracts: response.data.contracts || [],
      result_sdgs:
        response.data.result_sdgs?.map(sdg => ({
          ...sdg,
          sdg_id: sdg.clarisa_sdg_id, // Map clarisa_sdg_id to sdg_id for the multiselect
          is_primary: false // By default it is not primary
        })) || []
    };

    this.body.set(mappedData);
  }

  canRemove = (): boolean => {
    return this.submission.isEditableStatus();
  };

  async saveData(page?: 'next' | 'back') {
    this.loading.set(true);

    const resultId = Number(this.cache.currentResultId());
    const version = this.route.snapshot.queryParamMap.get('version');
    const queryParams = version ? { version } : undefined;

    const navigateTo = (path: string) => {
      this.router.navigate(['result', resultId, path], {
        queryParams,
        replaceUrl: true
      });
    };

    const nextPath = this.cache.currentResultIndicatorSectionPath();

    if (this.submission.isEditableStatus()) {
      // Map the data back to the format expected by the API
      const dataToSend = {
        ...this.body(),
        result_sdgs:
          this.body().result_sdgs?.map(sdg => ({
            created_at: sdg.created_at,
            is_active: sdg.is_active,
            updated_at: sdg.updated_at,
            clarisa_sdg_id: sdg.id,
            result_id: resultId
          })) || []
      };

      const response = await this.apiService.PATCH_Alignments(resultId, dataToSend);
      if (response.successfulRequest) {
        this.actions.showToast({
          severity: 'success',
          summary: 'Alliance Alignment',
          detail: 'Data saved successfully'
        });

        await this.getData();
      }
    }
    if (page === 'back') navigateTo('general-information');
    else if (page === 'next') navigateTo(nextPath);
    this.loading.set(false);
  }

  markAsPrimary(item: { is_primary: boolean }, type: 'contract' | 'lever' | 'sdg') {
    this.body.update(current => {
      if (type === 'contract') {
        current.contracts.forEach(contract => (contract.is_primary = false));
      }
      return { ...current };
    });
    item.is_primary = !item.is_primary;
    this.actions.saveCurrentSection();
  }
}
