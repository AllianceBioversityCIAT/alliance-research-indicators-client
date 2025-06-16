import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SubmissionService } from '@shared/services/submission.service';
import { FormHeaderComponent } from '@shared/components/form-header/form-header.component';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { NavigationButtonsComponent } from '@shared/components/navigation-buttons/navigation-buttons.component';
import { Actor, GetInnovationDetails, InstitutionType } from '@shared/interfaces/get-innovation-details.interface';
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
  private readonly getInnovationReadinessLevelsService = inject(GetInnovationReadinessLevelsService);
  private readonly apiService = inject(ApiService);
  private readonly cache = inject(CacheService);
  private readonly actions = inject(ActionsService);
  private readonly router = inject(Router);
  readonly submission = inject(SubmissionService);
  private readonly versionWatcher = inject(VersionWatcherService);
  private readonly route = inject(ActivatedRoute);

  body: WritableSignal<GetInnovationDetails> = signal({
    short_title: '',
    innovation_nature_id: 0,
    innovation_type_id: 0,
    innovation_readiness_id: 0,
    no_sex_age_disaggregation: true,
    anticipated_users_id: 0,
    expected_outcome: '',
    intended_beneficiaries_description: '',
    actors: [],
    institution_types: []
  });

  loading = signal(false);
  selectedStep = signal<number | null>(null);

  constructor() {
    this.versionWatcher.onVersionChange(() => this.getData());
  }

  async getData() {
    const response = await this.apiService.GET_InnovationDetails(this.cache.currentResultId());
    this.body.set(response.data);

    if (response.data.innovation_readiness_id) {
      const levelObj = this.getInnovationReadinessLevelsService.list().find(l => l.id === response.data.innovation_readiness_id);
      if (levelObj) {
        this.selectedStep.set(levelObj.level);
      }
    }

    if (!response.data.institution_types || response.data.institution_types.length === 0) {
      response.data.institution_types = [new InstitutionType()];
    }
    if (!response.data.actors || response.data.actors.length === 0) {
      response.data.actors = [new Actor()];
    }
  }

  private updateArray<T>(array: T[], item: T | null, action: 'add' | 'remove', index?: number): T[] {
    const newArray = [...array];
    if (action === 'add' && item !== null) {
      newArray.push(item);
    } else if (action === 'remove' && index !== undefined) {
      newArray.splice(index, 1);
    }
    return newArray;
  }

  addActor() {
    const currentBody = this.body();
    const updatedActors = this.updateArray<Actor>(currentBody.actors || [], new Actor(), 'add');
    this.body.set({ ...currentBody, actors: updatedActors });
    this.actions.saveCurrentSection();
  }

  deleteActor(index: number) {
    const currentBody = this.body();
    if (currentBody.actors) {
      const updatedActors = this.updateArray<Actor>(currentBody.actors, null, 'remove', index);
      this.body.set({ ...currentBody, actors: updatedActors });
      this.actions.saveCurrentSection();
    }
  }

  addInstitutionType() {
    const currentBody = this.body();
    const updatedTypes = this.updateArray<InstitutionType>(currentBody.institution_types || [], new InstitutionType(), 'add');
    this.body.set({ ...currentBody, institution_types: updatedTypes });
    this.actions.saveCurrentSection();
  }

  deleteInstitutionType(index: number) {
    const currentBody = this.body();
    if (currentBody.institution_types) {
      const updatedTypes = this.updateArray<InstitutionType>(currentBody.institution_types, null, 'remove', index);
      this.body.set({ ...currentBody, institution_types: updatedTypes });
      this.actions.saveCurrentSection();
    }
  }

  open() {
    this.getData();
  }

  canRemove = (): boolean => this.submission.isEditableStatus();

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

    const navigateTo = (path: string) => {
      this.router.navigate(['result', resultId, path], {
        queryParams,
        replaceUrl: true
      });
    };

    if (page === 'back') {
      navigateTo('alliance-alignment');
    } else if (page === 'next') {
      navigateTo(this.cache.currentResultIndicatorSectionPath());
    }

    this.loading.set(false);
  }
}
