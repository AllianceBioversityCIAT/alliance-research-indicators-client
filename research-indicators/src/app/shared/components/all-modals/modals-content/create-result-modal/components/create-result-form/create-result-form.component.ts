import { ChangeDetectionStrategy, Component, effect, inject, LOCALE_ID, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AllModalsService } from '@services/cache/all-modals.service';
import { ApiService } from '@services/api.service';
import { IndicatorsService } from '../../../../../../services/control-list/indicators.service';
import { GetContractsService } from '../../../../../../services/control-list/get-contracts.service';
import { GetResultsService } from '../../../../../../services/control-list/get-results.service';
import { CacheService } from '../../../../../../services/cache/cache.service';
import { ActionsService } from '../../../../../../services/actions.service';
import { MainResponse } from '../../../../../../interfaces/responses.interface';
import { Result } from '../../../../../../interfaces/result/result.interface';
import { CreateResultManagementService } from '../../services/create-result-management.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { GetContracts } from '../../../../../../interfaces/get-contracts.interface';
import { SelectModule } from 'primeng/select';
import localeEs from '@angular/common/locales/es';
import { NgTemplateOutlet, registerLocaleData } from '@angular/common';
import { GetYearsService } from '@shared/services/control-list/get-years.service';
import { SharedResultFormComponent } from '@shared/components/shared-result-form/shared-result-form.component';
import { WordCountService } from '@shared/services/word-count.service';
import { getContractStatusClasses } from '@shared/constants/status-classes.constants';

registerLocaleData(localeEs);

@Component({
  selector: 'app-create-result-form',
  imports: [
    DialogModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    NgTemplateOutlet,
    SelectModule,
    RouterModule,
    SharedResultFormComponent,
    AutoCompleteModule
  ],
  templateUrl: './create-result-form.component.html',
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateResultFormComponent {
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

  body = signal<{ indicator_id: number | null; title: string | null; contract_id: number | null; year: number | null }>({
    indicator_id: null,
    title: null,
    year: null,
    contract_id: null
  });
  filteredPrimaryContracts = signal<GetContracts[]>([]);
  sharedFormValid = false;
  loading = false;
  contractId: number | null = null;

  public getContractStatusClasses = getContractStatusClasses;

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

  navigateToOicr() {
    this.createResultManagementService.setContractId(this.body().contract_id);
    this.createResultManagementService.setResultTitle(this.body().title);
    this.createResultManagementService.setModalTitle('OICR result');
    this.createResultManagementService.resultPageStep.set(2);
  }

  async createResult(openresult?: boolean) {
    this.loading = true;
    try {
      const result = await this.api.POST_Result(this.body());
      if (result.successfulRequest) {
        this.successRequest(result, openresult);
      } else {
        this.actions.handleBadRequest(result);
      }
    } finally {
      this.loading = false;
    }
  }

  successRequest = (result: MainResponse<Result>, openresult?: boolean) => {
    const currentYear = new Date().getFullYear();
    this.actions.showToast({
      severity: 'success',
      summary: 'Success',
      detail: `Result "${this.body().title}" created successfully`
    });

    this.body.set({ indicator_id: null, title: null, contract_id: null, year: currentYear });
    this.contractId = null;
    this.sharedFormValid = false;

    if (openresult) {
      this.cache.currentResultId.set(Number(result.data.result_official_code));

      this.router.navigate(['result', result.data.result_official_code], {
        replaceUrl: true
      });

      this.allModalsService.closeModal('createResult');
    }

    this.getResultsService.updateList();
  };

  getWordCount(): number {
    const title = this.body()?.title?.trim() || '';
    return title ? title.split(' ').filter(word => word.length > 0).length : 0;
  }

  getWordCounterColor(): string {
    const count = this.getWordCount();
    if (count === 0) return '#8d9299';
    if (count > 30) return '#CF0808';
    return '#358540';
  }
}
