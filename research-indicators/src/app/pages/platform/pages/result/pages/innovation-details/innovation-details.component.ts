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
import { Actor, GetInnovationDetails, Organization } from '@shared/interfaces/get-innovation-details.interface';
import { SelectComponent } from '@shared/components/custom-fields/select/select.component';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';
import { RadioButtonComponent } from '@shared/components/custom-fields/radio-button/radio-button.component';
import { TextareaComponent } from '@shared/components/custom-fields/textarea/textarea.component';
import { OrganizationItemComponent } from './components/organization-item/organization-item.component';
import { ActorItemComponent } from './components/actor-item/actor-item.component';
import { GetInnovationReadinessLevelsService } from '@shared/services/control-list/get-innovation-readiness-levels.service';

@Component({
  selector: 'app-innovation-details',
  imports: [
    MultiSelectModule,
    TextareaComponent,
    FormHeaderComponent,
    RadioButtonComponent,
    InputComponent,
    FormsModule,
    NavigationButtonsComponent,
    SelectComponent,
    OrganizationItemComponent,
    ActorItemComponent
  ],
  templateUrl: './innovation-details.component.html'
})
export default class InnovationDetailsComponent {
  getInnovationReadinessLevelsService = inject(GetInnovationReadinessLevelsService);
  body: WritableSignal<GetInnovationDetails> = signal({
    organizations: [],
    actors: [],
    short_title: '',
    innovation_nature_id: 0,
    innovation_type_id: 0,
    innovation_readiness_id: 0,
    anticipated_users_id: 0,
    no_sex_age_disaggregation: false
  });
  apiService = inject(ApiService);
  cache = inject(CacheService);
  actions = inject(ActionsService);
  router = inject(Router);
  loading = signal(false);
  submission = inject(SubmissionService);
  versionWatcher = inject(VersionWatcherService);
  route = inject(ActivatedRoute);
  selectedStep = signal<number | null>(null); // No hay paso seleccionado por defecto

  constructor() {
    this.versionWatcher.onVersionChange(() => {
      this.getData();
    });
  }

  async getData() {
    const response = await this.apiService.GET_InnovationDetails(this.cache.currentResultId());
    this.body.set(response.data);

    // Si hay un innovation_readiness_id, encontrar y establecer el step correspondiente
    if (response.data.innovation_readiness_id) {
      const levelObj = this.getInnovationReadinessLevelsService.list().find(l => l.id === response.data.innovation_readiness_id);
      if (levelObj) {
        this.selectedStep.set(levelObj.level);
      }
    }
  }

  addActor() {
    this.body().actors.push(new Actor());
  }

  deleteActor(index: number) {
    this.body().actors.splice(index, 1);
    this.actions.saveCurrentSection();
  }

  addOrganization() {
    this.body().organizations.push(new Organization());
  }

  deleteOrganization(index: number) {
    this.body().organizations.splice(index, 1);
    this.actions.saveCurrentSection();
  }

  open() {
    this.getData();
  }

  canRemove = (): boolean => {
    return this.submission.isEditableStatus();
  };

  get stepNumbers() {
    return this.getInnovationReadinessLevelsService.list().map(l => l.level);
  }

  get stepLevels() {
    return this.getInnovationReadinessLevelsService.list();
  }

  selectStep(n: number) {
    this.selectedStep.set(n);
    const levelObj = this.getInnovationReadinessLevelsService.list().find(l => l.level === n);
    if (levelObj) {
      this.body.update(b => ({ ...b, innovation_readiness_id: levelObj.id }));
    }
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
      const response = await this.apiService.PATCH_InnovationDetails(resultId, this.body());
      if (response.successfulRequest) {
        this.actions.showToast({
          severity: 'success',
          summary: 'Innovation Details',
          detail: 'Data saved successfully'
        });

        await this.getData();
      }
    }
    if (page === 'back') navigateTo('alliance-alignment');
    else if (page === 'next') navigateTo(nextPath);
    this.loading.set(false);
  }
}
