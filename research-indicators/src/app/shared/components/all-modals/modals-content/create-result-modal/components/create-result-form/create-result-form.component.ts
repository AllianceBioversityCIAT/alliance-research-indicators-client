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
import { WordCountService, InputValueType } from '@shared/services/word-count.service';

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
    this.allModalsService.closeModal('createResult');
    this.body.set({ indicator_id: null, title: null, contract_id: null, year: currentYear });
    this.contractId = null;
    this.sharedFormValid = false;

    if (openresult) this.actions.changeResultRoute(Number(result.data.result_official_code));
    this.getResultsService.updateList();
  };

  getContractStatusClasses(status: string): string {
    const normalizedStatus = status?.toUpperCase() ?? '';

    const styles: Record<string, string> = {
      SUSPENDED: 'text-[#F58220] border border-[#F58220]',
      DISCONTINUED: 'text-[#777c83] border border-[#777c83]',
      ONGOING: 'text-[#153C71] border border-[#7C9CB9]',
      DEFAULT: 'text-[#235B2D] border border-[#7CB580]'
    };

    return styles[normalizedStatus] || styles['DEFAULT'];
  }
}
