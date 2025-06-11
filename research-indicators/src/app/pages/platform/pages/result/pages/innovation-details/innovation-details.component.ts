import { Component, inject, signal, WritableSignal } from '@angular/core';
import { GetContractsService } from '@services/control-list/get-contracts.service';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../../../environments/environment';
import { SubmissionService } from '@shared/services/submission.service';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';
import { GetInnovationDetails } from '@shared/interfaces/get-innovation-details.interface';
import { SelectComponent } from '@shared/components/custom-fields/select/select.component';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';
import { RadioButtonComponent } from '@shared/components/custom-fields/radio-button/radio-button.component';

@Component({
  selector: 'app-innovation-details',
  imports: [MultiSelectModule, FormHeaderComponent, RadioButtonComponent, InputComponent, FormsModule, NavigationButtonsComponent, SelectComponent],
  templateUrl: './innovation-details.component.html'
})
export default class InnovationDetailsComponent {
  environment = environment;
  getContractsService = inject(GetContractsService);
  body: WritableSignal<GetInnovationDetails> = signal({
    contracts: []
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
    this.body.set(response.data);
  }

  open() {
    this.getData();
  }

  canRemove = (): boolean => {
    return this.submission.isEditableStatus();
  };

  stepNumbers = Array.from({ length: 10 }, (_, i) => i);
  selectedStep = signal(7); // Por defecto el 7, como en la imagen

  selectStep(n: number) {
    this.selectedStep.set(n);
  }

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
      const response = await this.apiService.PATCH_Alignments(resultId, this.body());
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
}
