import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService } from '@services/api.service';
import { CacheService } from '@services/cache/cache.service';
import { ChipModule } from 'primeng/chip';
import { GeneralInformation } from '@interfaces/result/general-information.interface';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InputComponent } from '../../../../../../shared/components/custom-fields/input/input.component';
import { TextareaComponent } from '../../../../../../shared/components/custom-fields/textarea/textarea.component';
import { GetResultsService } from '../../../../../../shared/services/control-list/get-results.service';
import { GetUserStaffService } from '../../../../../../shared/services/control-list/get-user-staff.service';
import { SelectComponent } from '../../../../../../shared/components/custom-fields/select/select.component';
import { GetMetadataService } from '../../../../../../shared/services/get-metadata.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SubmissionService } from '@shared/services/submission.service';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';

interface Option {
  name: string;
}

@Component({
  selector: 'app-general-information',
  imports: [
    DialogModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    DropdownModule,
    ReactiveFormsModule,
    ChipModule,
    NavigationButtonsComponent,
    FormHeaderComponent,
    InputComponent,
    TextareaComponent,
    SelectComponent,
    AutoCompleteModule
  ],
  templateUrl: './general-information.component.html'
})
export default class GeneralInformationComponent {
  api = inject(ApiService);
  router = inject(Router);
  cache = inject(CacheService);
  route = inject(ActivatedRoute);
  actions = inject(ActionsService);
  metadata = inject(GetMetadataService);
  getResultsService = inject(GetResultsService);
  versionWatcher = inject(VersionWatcherService);
  getUserStaffService = inject(GetUserStaffService);
  options: Option[] | undefined;
  body: WritableSignal<GeneralInformation> = signal({
    title: '',
    description: '',
    year: '',
    keywords: [],
    user_id: '',
    main_contact_person: { user_id: '' }
  });
  loading = signal(false);
  submission = inject(SubmissionService);

  constructor() {
    this.versionWatcher.onVersionChange(() => {
      this.getData();
    });
  }

  async getData() {
    const response = await this.api.GET_GeneralInformation(this.cache.getCurrentNumericResultId());
    if (response.data?.main_contact_person?.user_id) response.data.user_id = response.data.main_contact_person.user_id;
    this.body.set(response.data);
  }

  async saveData(page?: 'next') {
    if (this.submission.isEditableStatus()) {
      this.loading.set(true);
      this.body.update((current: GeneralInformation) => {
        current.main_contact_person = { user_id: current.user_id };
        return { ...current };
      });
      
      const response = await this.api.PATCH_GeneralInformation(this.cache.getCurrentNumericResultId(), this.body());
      
      if (response.successfulRequest && response.status !== 409) {
        this.actions.showToast({ severity: 'success', summary: 'General Information', detail: 'Data saved successfully' });
        this.getResultsService.updateList();
        await this.getData();
        await this.metadata.update(this.cache.getCurrentNumericResultId());
      } else {
        const errorMessage = response.errorDetail?.errors || response.errorDetail?.detail || 'Unable to save data, please try again';
        this.actions.showToast({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.loading.set(false);
        return;
      }
    }

    if (page === 'next') {
      const version = this.route.snapshot.queryParamMap.get('version');
      const commands: string[] = ['result', this.cache.currentResultId().toString(), 'alliance-alignment'];
      const queryParams = version ? { version } : undefined;

      this.router.navigate(commands, {
        queryParams,
        replaceUrl: true
      });
    }
    this.loading.set(false);
  }
}
