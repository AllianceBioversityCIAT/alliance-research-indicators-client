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
import { DatePipe, registerLocaleData } from '@angular/common';
import { GetYearsService } from '@shared/services/control-list/get-years.service';

registerLocaleData(localeEs);
@Component({
  selector: 'app-create-result-form',
  imports: [DialogModule, DatePipe, ButtonModule, FormsModule, InputTextModule, SelectModule, RouterModule, AutoCompleteModule],
  templateUrl: './create-result-form.component.html',
  styleUrl: './create-result-form.component.scss',
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
  body = signal<{ indicator_id: number | null; title: string | null; contract_id: number | null; year: number | null }>({
    indicator_id: null,
    title: null,
    year: null,
    contract_id: null
  });
  filteredPrimaryContracts = signal<GetContracts[]>([]);

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

  async createResult(openresult?: boolean) {
    const result = await this.api.POST_Result(this.body());
    if (result.successfulRequest) {
      this.successRequest(result, openresult);
    } else {
      this.badRequest(result);
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
    if (openresult) this.actions.changeResultRoute(Number(result.data.result_official_code));
    this.getResultsService.updateList();
  };

  badRequest = (result: MainResponse<Result>) => {
    const isWarning = result.status == 409;
    this.actions.showGlobalAlert({
      severity: isWarning ? 'warning' : 'error',
      summary: isWarning ? 'Warning' : 'Error',
      detail: isWarning ? `${result.errorDetail.errors} "${this.body().title}"` : result.errorDetail.errors
    });
  };
}
