import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, LOCALE_ID, signal, computed, QueryList, ViewChildren } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import { CREATE_OICR_STEPPER_ITEMS, CREATE_OICR_STEPPER_SECTIONS } from '@shared/constants/stepper.constants';
import { AllModalsService } from '@services/cache/all-modals.service';
import { ApiService } from '@services/api.service';
import { IndicatorsService } from '@shared/services/control-list/indicators.service';
import { GetContractsService } from '@shared/services/control-list/get-contracts.service';
import { GetResultsService } from '@shared/services/control-list/get-results.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { ActionsService } from '@shared/services/actions.service';
import { CreateResultManagementService } from '@shared/components/all-modals/modals-content/create-result-modal/services/create-result-management.service';
import { GetContracts } from '@shared/interfaces/get-contracts.interface';
import { SelectModule } from 'primeng/select';
import { NgTemplateOutlet } from '@angular/common';
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
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-create-oicr-result',
  imports: [
    DialogModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    StepsModule,
    NgTemplateOutlet,
    SelectModule,
    RouterModule,
    TextareaComponent,
    RadioButtonComponent,
    MultiselectComponent,
    MultiselectInstanceComponent,
    SelectComponent
  ],
  templateUrl: './create-oicr-result.component.html',
  styleUrl: './create-oicr-result.component.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateOicrResultComponent {
  allModalsService = inject(AllModalsService);
  indicatorsService = inject(IndicatorsService);
  yearsService = inject(GetYearsService);
  getContractsService = inject(GetContractsService);
  getResultsService = inject(GetResultsService);
  createResultManagementService = inject(CreateResultManagementService);
  cache = inject(CacheService);
  router = inject(Router);
  api = inject(ApiService);
  actions = inject(ActionsService);
  wordCountService = inject(WordCountService);
  elementRef = inject(ElementRef);
  private isFirstSelect = true;
  environment = environment;

  stepItems = signal<MenuItem[]>(
    CREATE_OICR_STEPPER_ITEMS.map((item, idx) => ({
      ...item,
      command: () => this.onStepClick(idx, CREATE_OICR_STEPPER_SECTIONS[idx])
    }))
  );
  activeIndex = 0;
  isRegionsRequired = computed(() => isRegionsRequiredByScope(Number(this.body().geo_scope_id)));
  isCountriesRequired = computed(() => isCountriesRequiredByScope(Number(this.body().geo_scope_id)));
  isSubNationalRequired = computed(() => isSubNationalRequiredByScope(Number(this.body().geo_scope_id)));
  showSubnationalError = computed(() => shouldShowSubnationalError(Number(this.body().geo_scope_id), this.body().countries));

  private stepSectionIds = [...CREATE_OICR_STEPPER_SECTIONS];
  getMultiselectLabel = computed(() => getGeoScopeMultiselectTexts(Number(this.body().geo_scope_id)));
  @ViewChildren(MultiselectInstanceComponent) multiselectInstances!: QueryList<MultiselectInstanceComponent>;

  body = signal<{
    indicator_id: number | null;
    title: string | null;
    contract_id: number | null;
    year: number | null;
    geo_scope_id: number | null;
    countries: Country[];
  }>({
    indicator_id: null,
    title: null,
    geo_scope_id: null,
    year: null,
    contract_id: null,
    countries: []
  });
  onActiveIndexChange(event: number) {
    this.activeIndex = event;
  }

  filteredPrimaryContracts = signal<GetContracts[]>([]);
  sharedFormValid = false;
  loading = false;
  contractId: number | null = null;

  public getContractStatusClasses = getContractStatusClasses;

  removeSubnationalRegion(country: Country, region: Region) {
    this.body.update(current => {
      const removedId = removeSubnationalRegionFromCountries(current.countries, country.isoAlpha2, region.sub_national_id);
      const instance = this.multiselectInstances.find(m => m.endpointParams?.isoAlpha2 === country.isoAlpha2);
      if (removedId !== undefined) instance?.removeRegionById(removedId);
      return current;
    });
  }

  updateCountryRegions = (isoAlpha2: string, newRegions: Region[]) => {
    this.body.update(current => {
      updateCountryRegions(current.countries, isoAlpha2, newRegions);
      return current;
    });
  };
  onYearsLoaded = effect(
    () => {
      const years = this.yearsService.list();
      const currentYear = new Date().getFullYear();

      if (years.length > 0 && years.some(y => y.report_year === currentYear)) {
        this.body.update(body => ({
          ...body,
          year: currentYear
        }));
      }
    },
    { allowSignalWrites: true }
  );

  get isYearMissing(): boolean {
    return !this.body()?.year;
  }

  get isTitleMissing(): boolean {
    return !this.body()?.title;
  }

  get isIndicatorIdMissing(): boolean {
    return !this.body()?.indicator_id;
  }

  get isDisabled(): boolean {
    const b = this.body();
    return !this.sharedFormValid || !b.title?.length || !b.indicator_id || !b.contract_id || !b.year;
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
  createResult(openresult?: boolean) {
    console.log(openresult);
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

  onSelect = () => {
    this.body.update(current => {
      mapCountriesToSubnationalSignals(current.countries);
      syncSubnationalArrayFromSignals(current.countries);
      return current;
    });
    const currentId = Number(this.body().geo_scope_id);

    if (!this.isFirstSelect && currentId === 5) {
      this.body.update(value => ({
        ...value,
        countries: []
      }));
    }

    this.isFirstSelect = false;
  };
}
