import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  LOCALE_ID,
  signal,
  computed,
  QueryList,
  ViewChildren,
  WritableSignal
} from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';

import { StepsModule } from 'primeng/steps';
import { CREATE_OICR_STEPPER_ITEMS, CREATE_OICR_STEPPER_SECTIONS } from '@shared/constants/stepper.constants';
import { AllModalsService } from '@services/cache/all-modals.service';
import { ApiService } from '@services/api.service';
import { GetResultsService } from '@shared/services/control-list/get-results.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { ActionsService } from '@shared/services/actions.service';
import { CreateResultManagementService } from '@shared/components/all-modals/modals-content/create-result-modal/services/create-result-management.service';
import { GetContracts } from '@shared/interfaces/get-contracts.interface';

import { GetYearsService } from '@shared/services/control-list/get-years.service';
import { WordCountService } from '@shared/services/word-count.service';
import { getContractStatusClasses } from '@shared/constants/status-classes.constants';
import { TextareaComponent } from '@shared/components/custom-fields/textarea/textarea.component';
import { MultiselectComponent } from '@shared/components/custom-fields/multiselect/multiselect.component';
import { RadioButtonComponent } from '@shared/components/custom-fields/radio-button/radio-button.component';
import { MultiselectInstanceComponent } from '@shared/components/custom-fields/multiselect-instance/multiselect-instance.component';
import {
  getGeoScopeMultiselectTexts,
  isCountriesRequiredByScope,
  isRegionsRequiredByScope,
  isSubNationalRequiredByScope,
  mapCountriesToSubnationalSignals,
  removeSubnationalRegionFromCountries,
  shouldShowSubnationalError,
  syncSubnationalArrayFromSignals,
  updateCountryRegions
} from '@shared/utils/geographic-scope.util';
import { Country, Region } from '@shared/interfaces/get-geo-location.interface';
import { environment } from '@envs/environment';
import { Lever } from '@shared/interfaces/oicr-creation.interface';
import { TooltipModule } from 'primeng/tooltip';
import { ServiceLocatorService } from '@shared/services/service-locator.service';
import { Router } from '@angular/router';
import { OicrFormFieldsComponent } from '@shared/components/custom-fields/oicr-form-fields/oicr-form-fields.component';
import { RolesService } from '@shared/services/cache/roles.service';
import { ProjectResultsTableService } from '@shared/components/project-results-table/project-results-table.service';
import { DownloadOicrTemplateComponent } from '@shared/components/download-oicr-template/download-oicr-template.component';

interface GetContractsExtended extends GetContracts {
  contract_id: string;
}
@Component({
  selector: 'app-create-oicr-form',
  templateUrl: './create-oicr-form.component.html',
  styleUrl: './create-oicr-form.component.scss',
  imports: [
    StepsModule,
    TextareaComponent,
    RadioButtonComponent,
    MultiselectComponent,
    MultiselectInstanceComponent,
    OicrFormFieldsComponent,
    DatePipe,
    NgTemplateOutlet,
    TooltipModule,
    DownloadOicrTemplateComponent
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateOicrFormComponent {
  @ViewChildren(MultiselectInstanceComponent) multiselectInstances!: QueryList<MultiselectInstanceComponent>;

  createResultManagementService = inject(CreateResultManagementService);
  serviceLocator = inject(ServiceLocatorService);
  getResultsService = inject(GetResultsService);
  allModalsService = inject(AllModalsService);
  wordCountService = inject(WordCountService);
  yearsService = inject(GetYearsService);
  actions = inject(ActionsService);
  elementRef = inject(ElementRef);
  cache = inject(CacheService);
  api = inject(ApiService);
  router = inject(Router);
  rolesService = inject(RolesService);
  projectResultsTableService = inject(ProjectResultsTableService);
  step4opened = signal(false);
  filteredPrimaryContracts = signal<GetContracts[]>([]);
  contracts = signal<GetContractsExtended[]>([]);
  contractId: number | null = null;
  private isFirstSelect = true;
  environment = environment;
  loading = false;
  activeIndex = signal(0);

  optionsDisabled: WritableSignal<Lever[]> = signal([]);
  primaryOptionsDisabled: WritableSignal<Lever[]> = signal([]);

  public getContractStatusClasses = getContractStatusClasses;
  private stepSectionIds = [...CREATE_OICR_STEPPER_SECTIONS];

  isRegionsRequired = computed(() => isRegionsRequiredByScope(Number(this.createResultManagementService.createOicrBody().step_three.geo_scope_id)));
  isCountriesRequired = computed(() =>
    isCountriesRequiredByScope(Number(this.createResultManagementService.createOicrBody().step_three.geo_scope_id))
  );
  getMultiselectLabel = computed(() =>
    getGeoScopeMultiselectTexts(Number(this.createResultManagementService.createOicrBody().step_three.geo_scope_id))
  );
  isSubNationalRequired = computed(() =>
    isSubNationalRequiredByScope(Number(this.createResultManagementService.createOicrBody().step_three.geo_scope_id))
  );
  showSubnationalError = computed(() =>
    shouldShowSubnationalError(
      Number(this.createResultManagementService.createOicrBody().step_three.geo_scope_id),
      this.createResultManagementService.createOicrBody().step_three.countries
    )
  );

  currentContract = computed(() => {
    const contractId = this.createResultManagementService.createOicrBody().base_information.contract_id;
    const contractsList = this.contracts();
    return contractsList.find(contract => contract.contract_id === String(contractId)) || null;
  });

  leverParts = computed(() => {
    const lever = this.currentContract()?.lever;
    if (!lever?.includes(':')) return { first: '', second: '' };
    const parts = lever.split(':');
    return { first: parts[0] || '', second: parts[1] || '' };
  });

  constructor() {
    this.createResultManagementService.stepItems.set(
      CREATE_OICR_STEPPER_ITEMS.map((item, idx) => ({
        ...item,
        command: () => this.onStepClick(idx, CREATE_OICR_STEPPER_SECTIONS[idx])
      }))
    );
  }

  stepOneCompletionEffect = effect(
    () => {
      const completed = this.isCompleteStepOne;
      this.createResultManagementService.stepItems.update(items =>
        items.map((item, idx) => (idx === 0 ? { ...item, styleClass: completed ? 'oicr-step1-complete' : '' } : item))
      );
    },
    { allowSignalWrites: true }
  );

  stepTwoCompletionEffect = effect(
    () => {
      const completed = this.isCompleteStepTwo;
      this.createResultManagementService.stepItems.update(items =>
        items.map((item, idx) => (idx === 1 ? { ...item, styleClass: completed ? 'oicr-step2-complete' : '' } : item))
      );
    },
    { allowSignalWrites: true }
  );

  stepThreeCompletionEffect = effect(
    () => {
      const completed = this.isCompleteStepThree;
      this.createResultManagementService.stepItems.update(items =>
        items.map((item, idx) => (idx === 2 ? { ...item, styleClass: completed ? 'oicr-step3-complete' : '' } : item))
      );
    },
    { allowSignalWrites: true }
  );

  onInit = effect(() => {
    if (this.createResultManagementService.resultPageStep() === 2) {
      this.allModalsService.setGoBackFunction(() => this.goBackToCreateResult());
    }
  });

  stepFourCompletionEffect = effect(
    () => {
      const completed =
        this.isCompleteStepOne &&
        this.isCompleteStepTwo &&
        this.isCompleteStepThree &&
        (this.createResultManagementService.editingOicr() ? true : this.step4opened());
      this.createResultManagementService.stepItems.update(items =>
        items.map((item, idx) => (idx === 3 ? { ...item, styleClass: completed ? 'oicr-step4-complete' : '' } : item))
      );
    },
    { allowSignalWrites: true }
  );

  updateOptionsDisabledEffect = effect(
    () => {
      const primaryLevers = this.createResultManagementService.createOicrBody().step_two?.primary_lever || [];
      this.optionsDisabled.set(primaryLevers);
    },
    { allowSignalWrites: true }
  );

  updatePrimaryOptionsDisabledEffect = effect(
    () => {
      const contributorLevers = this.createResultManagementService.createOicrBody().step_two?.contributor_lever || [];
      this.primaryOptionsDisabled.set([...this.createResultManagementService.oicrPrimaryOptionsDisabled(), ...contributorLevers]);
    },
    { allowSignalWrites: true }
  );

  onContractIdSync = effect(
    async () => {
      const contractId = this.createResultManagementService.contractId();
      if (contractId !== null) {
        this.createResultManagementService.createOicrBody.update(body => ({
          ...body,
          contract_id: contractId
        }));
        try {
          const response = await this.api.GET_Contracts(contractId);
          if (response.successfulRequest && response.data) {
            const contractsWithId = response.data.map(contract => ({
              ...contract,
              contract_id: contract.agreement_id
            }));
            this.contracts.set(contractsWithId);
          }
        } catch (error) {
          console.error('Error loading contracts:', error);
        }
      }
    },
    { allowSignalWrites: true }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  printht(c: Country) {
    // Debug method - console statements removed for linting compliance
  }

  onActiveIndexChange(event: number) {
    this.activeIndex.set(event);
    if (event === 3) this.step4opened.set(true);
  }
  removeSubnationalRegion(country: Country, region: Region) {
    this.createResultManagementService.createOicrBody.update(current => {
      const removedId = removeSubnationalRegionFromCountries(current.step_three.countries, country.isoAlpha2, region.sub_national_id);
      const instance = this.multiselectInstances.find(m => m.endpointParams?.isoAlpha2 === country.isoAlpha2);
      if (removedId !== undefined) instance?.removeRegionById(removedId);
      return current;
    });
  }

  updateCountryRegions = (isoAlpha2: string, newRegions: Region[]) => {
    this.createResultManagementService.createOicrBody.update(current => {
      updateCountryRegions(current.step_three.countries, isoAlpha2, newRegions);
      return current;
    });
  };

  get isDisabled(): boolean {
    const b = this.createResultManagementService.createOicrBody();
    return (
      !b.base_information.title?.length ||
      !b.base_information.indicator_id ||
      !b.base_information.contract_id ||
      !b.base_information.year ||
      !this.isCompleteStepOne ||
      !this.isCompleteStepTwo ||
      !this.isCompleteStepThree
    );
  }

  get isCompleteStepOne(): boolean {
    const b = this.createResultManagementService.createOicrBody();
    const userIdValid = String(b.step_one.main_contact_person.user_id).trim().length > 0;
    const tagIdValid = b.step_one.tagging.tag_id > 0;
    const outcomeLen = (b.step_one.outcome_impact_statement ?? '').length;

    const showOicrSelection = b.step_one.tagging.tag_id === 2 || b.step_one.tagging.tag_id === 3;
    const oicrSelectionValid = !showOicrSelection || b.step_one.link_result.external_oicr_id > 0;

    return userIdValid && tagIdValid && outcomeLen > 0 && oicrSelectionValid;
  }

  get isCompleteStepTwo(): boolean {
    const b = this.createResultManagementService.createOicrBody();
    return b.step_two.primary_lever.length > 0;
  }

  get isCompleteStepThree(): boolean {
    const b = this.createResultManagementService.createOicrBody();
    const geoScopeId = b.step_three.geo_scope_id;
    const multiselectLabels = this.getMultiselectLabel();

    const hasValidGeoScope = geoScopeId !== undefined && geoScopeId > 0;

    if (!hasValidGeoScope) {
      return false;
    }

    if (geoScopeId <= 1) {
      return true;
    }

    const hasValidRegions = !multiselectLabels.region.label || b.step_three.regions.length > 0;
    const hasValidCountries = !multiselectLabels.country.label || b.step_three.countries.length > 0;

    return hasValidRegions && hasValidCountries;
  }

  onContractIdChange(newContractId: number | null) {
    this.contractId = newContractId;
    this.createResultManagementService.createOicrBody.update(b => ({ ...b, contract_id: newContractId }));
  }

  onStepClick(stepIndex: number, sectionId: string) {
    this.activeIndex.set(stepIndex);
    this.scrollTo(sectionId);
  }

  private scrollTo(sectionId: string) {
    const el: HTMLElement | null = this.elementRef.nativeElement.querySelector(`#${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }

  onSelect = () => {
    this.createResultManagementService.createOicrBody.update(current => {
      mapCountriesToSubnationalSignals(current.step_three.countries);
      syncSubnationalArrayFromSignals(current.step_three.countries);
      return current;
    });
    if (this.createResultManagementService.autofillinOicr()) return;
    const currentId = Number(this.createResultManagementService.createOicrBody().step_three.geo_scope_id);

    if (!this.isFirstSelect && currentId === 5) {
      this.createResultManagementService.createOicrBody.update(value => ({
        ...value,
        step_three: {
          ...value.step_three
        }
      }));
    }

    this.isFirstSelect = false;
  };

  initializeCountriesWithSignals = effect(() => {
    const countries = this.createResultManagementService.createOicrBody().step_three.countries;
    if (countries && countries.length > 0) {
      const needsInitialization = countries.some(country => !country.result_countries_sub_nationals_signal);

      if (needsInitialization) {
        this.createResultManagementService.createOicrBody.update(current => {
          mapCountriesToSubnationalSignals(current.step_three.countries);
          return current;
        });
      }
    }
  });

  async createResult() {
    const response = await this.api.POST_CreateOicr(
      this.createResultManagementService.createOicrBody(),
      this.createResultManagementService.currentRequestedResultCode() || undefined
    );
    // clean currentRequestedResultCode

    if (response.status !== 200 && response.status !== 201) {
      this.actions.handleBadRequest(response, () => {
        this.createResultManagementService.resultPageStep.set(0);
      });
    } else {
      this.actions.showGlobalAlert({
        severity: 'success',
        summary: `Thank you for ${(this.createResultManagementService.currentRequestedResultCode() && 'update') || ''} your submission`,
        hasNoCancelButton: true,
        detail:
          'Your OICR will be reviewed by PISA-SPRM and the assigned regional MEL specialist will reach out to support you in finalizing the next steps of the OICR development process.',
        confirmCallback: {
          label: 'Done',
          event: () => {
            // Modern Angular approach - Navigate with reload
            const targetRoute =
              this.createResultManagementService.createOicrBody().base_information.indicator_id === 5
                ? ['project-detail/', this.createResultManagementService.createOicrBody()?.base_information?.contract_id]
                : ['result', response.data.result_official_code];

            // Navigate to results-center first to ensure component refresh
            const navigate = () => {
              this.router.navigate(targetRoute, {
                replaceUrl: true,
                onSameUrlNavigation: 'reload'
              });
              this.allModalsService.closeModal('createResult');
              this.getResultsService.updateList();
              this.createResultManagementService.currentRequestedResultCode.set(null);
              this.projectResultsTableService.getData();
              this.cache.projectResultsSearchValue.set(this.createResultManagementService.createOicrBody().base_information.title);
              this.createResultManagementService.clearOicrBody();
            };

            if (
              this.createResultManagementService.createOicrBody().base_information.indicator_id === 5 &&
              this.router.url.includes('/project-detail/')
            ) {
              this.router.navigate(['/home']).then(() => {
                // Then navigate to the target with a small delay
                setTimeout(() => {
                  navigate();
                }, 300);
              });
            } else {
              navigate();
            }
          }
        }
      });
    }
  }

  goNext() {
    const current = this.activeIndex();
    const lastIndex = this.createResultManagementService.stepItems().length - 1;
    if (current < lastIndex) {
      const next = current + 1;
      const sectionId = this.stepSectionIds[next] ?? this.stepSectionIds[0];
      this.onStepClick(next, sectionId);
    }
    if (current === 3) this.step4opened.set(true);
  }

  goBack() {
    const current = this.activeIndex();
    if (current > 0) {
      const prev = current - 1;
      const sectionId = this.stepSectionIds[prev] ?? this.stepSectionIds[0];
      this.onStepClick(prev, sectionId);
    }
  }

  goBackToCreateResult() {
    this.createResultManagementService.setModalTitle('Create A Result');
    this.createResultManagementService.resultPageStep.set(0);
  }

  isGeoScopeId(value: number | string): boolean {
    return Number(this.createResultManagementService.createOicrBody().step_three.geo_scope_id) === value;
  }

  clearOicrSelection(): void {
    this.createResultManagementService.createOicrBody.update(current => ({
      ...current,
      step_one: {
        ...current.step_one,
        link_result: { external_oicr_id: 0 }
      }
    }));
  }
}
