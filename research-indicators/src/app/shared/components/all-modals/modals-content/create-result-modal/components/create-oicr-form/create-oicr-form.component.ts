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
import { MenuItem } from 'primeng/api';
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
import { SelectComponent } from '@shared/components/custom-fields/select/select.component';
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
import { OicrCreation } from '@shared/interfaces/oicr-creation.interface';
import { TooltipModule } from 'primeng/tooltip';

// Interfaz extendida para incluir contract_id
interface GetContractsExtended extends GetContracts {
  contract_id: string;
}
@Component({
  selector: 'app-create-oicr-form',
  templateUrl: './create-oicr-form.component.html',
  styleUrl: './create-oicr-form.component.scss',
  imports: [
    StepsModule,
    SelectComponent,
    TextareaComponent,
    RadioButtonComponent,
    MultiselectComponent,
    MultiselectInstanceComponent,
    DatePipe,
    NgTemplateOutlet,
    TooltipModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateOicrFormComponent {
  @ViewChildren(MultiselectInstanceComponent) multiselectInstances!: QueryList<MultiselectInstanceComponent>;

  createResultManagementService = inject(CreateResultManagementService);
  getResultsService = inject(GetResultsService);
  allModalsService = inject(AllModalsService);
  wordCountService = inject(WordCountService);
  yearsService = inject(GetYearsService);
  actions = inject(ActionsService);
  elementRef = inject(ElementRef);
  cache = inject(CacheService);
  api = inject(ApiService);

  filteredPrimaryContracts = signal<GetContracts[]>([]);
  contracts = signal<GetContractsExtended[]>([]);

  contractId: number | null = null;
  private isFirstSelect = true;
  environment = environment;
  loading = false;
  activeIndex = 0;

  public getContractStatusClasses = getContractStatusClasses;
  private stepSectionIds = [...CREATE_OICR_STEPPER_SECTIONS];

  isRegionsRequired = computed(() => isRegionsRequiredByScope(Number(this.body().step_three.geo_scope_id)));
  isCountriesRequired = computed(() => isCountriesRequiredByScope(Number(this.body().step_three.geo_scope_id)));
  getMultiselectLabel = computed(() => getGeoScopeMultiselectTexts(Number(this.body().step_three.geo_scope_id)));
  isSubNationalRequired = computed(() => isSubNationalRequiredByScope(Number(this.body().step_three.geo_scope_id)));
  showSubnationalError = computed(() => shouldShowSubnationalError(Number(this.body().step_three.geo_scope_id), this.body().step_three.countries));

  stepItems = signal<MenuItem[]>(
    CREATE_OICR_STEPPER_ITEMS.map((item, idx) => ({
      ...item,
      command: () => this.onStepClick(idx, CREATE_OICR_STEPPER_SECTIONS[idx])
    }))
  );

  body: WritableSignal<OicrCreation> = signal({
    step_one: {
      main_contact_person: {
        result_user_id: 0,
        result_id: 0,
        user_id: 0,
        user_role_id: 0
      },
      tagging: {
        tag_id: 0
      },
      linked_result: [],
      outcome_impact_statement: ''
    },
    step_two: {
      initiatives: [],
      primary_lever: [],
      contributor_lever: []
    },
    step_three: {
      geo_scope_id: 0,
      countries: [],
      regions: [],
      comment_geo_scope: ''
    },
    step_four: {
      general_comment: {
        comment_geo_scope: ''
      }
    },
    base_information: {
      indicator_id: 5,
      contract_id: String(this.createResultManagementService.contractId() || ''),
      title: this.createResultManagementService.resultTitle() || '',
      description: '',
      year: String(this.createResultManagementService.year() || ''),
      is_ai: false
    }
  });

  onInit = effect(() => {
    if (this.createResultManagementService.resultPageStep() === 2) {
      this.allModalsService.setGoBackFunction(() => this.goBackToCreateResult());
    }
  });

  currentContract = computed(() => {
    const contractId = this.body().base_information.contract_id;
    const contractsList = this.contracts();
    return contractsList.find(contract => contract.contract_id === String(contractId)) || null;
  });

  leverParts = computed(() => {
    const lever = this.currentContract()?.lever;
    if (!lever || !lever.includes(':')) return { first: '', second: '' };
    const parts = lever.split(':');
    return { first: parts[0] || '', second: parts[1] || '' };
  });

  onActiveIndexChange(event: number) {
    this.activeIndex = event;
  }
  removeSubnationalRegion(country: Country, region: Region) {
    this.body.update(current => {
      const removedId = removeSubnationalRegionFromCountries(current.step_three.countries, country.isoAlpha2, region.sub_national_id);
      const instance = this.multiselectInstances.find(m => m.endpointParams?.isoAlpha2 === country.isoAlpha2);
      if (removedId !== undefined) instance?.removeRegionById(removedId);
      return current;
    });
  }

  updateCountryRegions = (isoAlpha2: string, newRegions: Region[]) => {
    this.body.update(current => {
      updateCountryRegions(current.step_three.countries, isoAlpha2, newRegions);
      return current;
    });
  };

  onContractIdSync = effect(
    async () => {
      const contractId = this.createResultManagementService.contractId();
      if (contractId !== null) {
        this.body.update(body => ({
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

  get isDisabled(): boolean {
    const b = this.body();
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
    const b = this.body();
    return b.step_one.main_contact_person.user_id > 0 && b.step_one.tagging.tag_id > 0 && b.step_one.outcome_impact_statement.length > 0;
  }

  get isCompleteStepTwo(): boolean {
    const b = this.body();
    return b.step_two.primary_lever.length > 0;
  }

  get isCompleteStepThree(): boolean {
    const b = this.body();
    return (
      b.step_three.geo_scope_id > 0 &&
      (this.getMultiselectLabel().region.label ? b.step_three.regions.length > 0 : true) &&
      (this.getMultiselectLabel().country.label ? b.step_three.countries.length > 0 : true)
    );
  }

  onContractIdChange(newContractId: number | null) {
    this.contractId = newContractId;
    this.body.update(b => ({ ...b, contract_id: newContractId }));
  }

  onStepClick(stepIndex: number, sectionId: string) {
    this.activeIndex = stepIndex;
    this.scrollTo(sectionId);
  }

  private scrollTo(sectionId: string) {
    const el: HTMLElement | null = this.elementRef.nativeElement.querySelector(`#${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }

  onSelect = () => {
    this.body.update(current => {
      mapCountriesToSubnationalSignals(current.step_three.countries);
      syncSubnationalArrayFromSignals(current.step_three.countries);
      return current;
    });
    const currentId = Number(this.body().step_three.geo_scope_id);

    if (!this.isFirstSelect && currentId === 5) {
      this.body.update(value => ({
        ...value,
        step_three: {
          ...value.step_three,
          countries: []
        }
      }));
    }

    this.isFirstSelect = false;
  };

  createResult() {
    console.log(this.body());
  }

  goNext() {
    const current = this.activeIndex;
    const lastIndex = this.stepItems().length - 1;
    if (current < lastIndex) {
      const next = current + 1;
      const sectionId = this.stepSectionIds[next] ?? this.stepSectionIds[0];
      this.onStepClick(next, sectionId);
    }
  }

  goBack() {
    const current = this.activeIndex;
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
}
