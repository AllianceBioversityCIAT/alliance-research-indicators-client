import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
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
import {
  Actor,
  GetInnovationDetails,
  InstitutionType,
  KnowledgeSharingForm,
  ScalingPotentialForm
} from '@shared/interfaces/get-innovation-details.interface';
import { SelectComponent } from '@shared/components/custom-fields/select/select.component';
import { InputComponent } from '@shared/components/custom-fields/input/input.component';
import { RadioButtonComponent } from '@shared/components/custom-fields/radio-button/radio-button.component';
import { TextareaComponent } from '@shared/components/custom-fields/textarea/textarea.component';
import { OrganizationItemComponent } from './components/organization-item/organization-item.component';
import { ActorItemComponent } from './components/actor-item/actor-item.component';
import { GetInnovationReadinessLevelsService } from '@shared/services/control-list/get-innovation-readiness-levels.service';
import { TooltipModule } from 'primeng/tooltip';
import { MultiselectComponent } from '@shared/components/custom-fields/multiselect/multiselect.component';
import { CustomTagComponent } from '@shared/components/custom-tag/custom-tag.component';

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
    ActorItemComponent,
    MultiselectComponent,
    TooltipModule,
    CustomTagComponent
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
    innovation_nature_id: undefined,
    innovation_type_id: undefined,
    innovation_readiness_id: undefined,
    anticipated_users_id: undefined,
    expected_outcome: '',
    intended_beneficiaries_description: '',
    actors: [],
    institution_types: [],
    knowledge_sharing_form: new KnowledgeSharingForm(),
    scaling_potential_form: new ScalingPotentialForm()
  });

  loading = signal(false);
  selectedStep = signal<number | null>(null);
  scalingHelperText =
    'You may consult the Alliance’s <a class="text-[#1689CA] underline" href="https://alliancebioversityciat.org/tools-innovations" target="_blank"> Tools and Innovations list</a>.';
  scalingHelperText2 =
    'For more information please visit the following <a class="text-[#1689CA] underline" href="https://alliancebioversityciat.org/tools-innovations" target="_blank">  Resource</a>.';

  constructor() {
    this.versionWatcher.onVersionChange(() => this.getData());

    effect(() => {
      const levels = this.getInnovationReadinessLevelsService.list();
      const readinessId = this.body().innovation_readiness_id;
      if (levels.length && readinessId) {
        const levelObj = levels.find(l => l.id === readinessId);
        if (levelObj) {
          this.selectedStep.set(levelObj.level);
        }
      }
    });
  }

  async getData() {
    const response = await this.apiService.GET_InnovationDetails(this.cache.currentResultId());
    if (Array.isArray(response.data.knowledge_sharing_form?.link_to_result)) {
      response.data.knowledge_sharing_form.link_to_result = response.data.knowledge_sharing_form.link_to_result.map(link => {
        if (link.other_result_id) {
          return { ...link, result_id: link.other_result_id };
        }
        return link;
      });
    }
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

  canRemove = (): boolean => this.submission.isEditableStatus();

  get stepNumbers() {
    return this.getInnovationReadinessLevelsService.list().map(l => l.level);
  }

  get stepLevels() {
    return this.getInnovationReadinessLevelsService.list();
  }

  get selectedLevel() {
    return this.stepLevels.find(l => l.level === this.selectedStep());
  }

  getStepTooltip(level: number): string {
    const step = this.stepLevels.find(l => l.level === level);
    return step ? `<strong>${step.name}</strong> - ${step.definition}` : '';
  }

  selectStep(n: number) {
    this.selectedStep.set(n);
    const levelObj = this.getInnovationReadinessLevelsService.list().find(l => l.level === n);
    if (levelObj) {
      this.body.update(b => ({ ...b, innovation_readiness_id: levelObj.id }));
    }
  }

  onAnticipatedUsersChange() {
    if (this.body().anticipated_users_id === 2) {
      setTimeout(() => {
        const el = document.getElementById('anticipated-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  async saveData(page?: 'next' | 'back') {
    this.loading.set(true);
    const cleanedBody = { ...this.body() };

    if (Array.isArray(cleanedBody.institution_types)) {
      cleanedBody.institution_types = cleanedBody.institution_types.filter(
        i =>
          i &&
          (i.result_institution_type_id !== undefined ||
            i.result_id !== undefined ||
            i.institution_type_id !== undefined ||
            i.sub_institution_type_id !== undefined ||
            (i.institution_type_custom_name !== undefined && i.institution_type_custom_name !== ''))
      );
    }

    if (Array.isArray(cleanedBody.knowledge_sharing_form.link_to_result)) {
      cleanedBody.knowledge_sharing_form.link_to_result = cleanedBody.knowledge_sharing_form.link_to_result
        .filter(link => link?.result_id)
        .map(link => {
          if (link.link_result_id) {
            return {
              link_result_id: link.link_result_id,
              result_id: link.result_id,
              other_result_id: link.other_result_id,
              link_result_role_id: link.link_result_role_id
            };
          }
          return {
            other_result_id: link.result_id
          };
        });
    }

    const resultId = Number(this.cache.currentResultId());
    const version = this.route.snapshot.queryParamMap.get('version');
    const queryParams = version ? { version } : undefined;
    if (this.submission.isEditableStatus()) {
      const response = await this.apiService.PATCH_InnovationDetails(resultId, cleanedBody);
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
      navigateTo('partners');
    }

    this.loading.set(false);
  }
}
