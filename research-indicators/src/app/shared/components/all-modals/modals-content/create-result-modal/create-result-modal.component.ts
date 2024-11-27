import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { AllModalsService } from '@services/cache/all-modals.service';
import { ApiService } from '@services/api.service';
import { IndicatorsService } from '../../../../services/control-list/indicators.service';
import { GetContractsService } from '../../../../services/control-list/get-contracts.service';
import { CacheService } from '../../../../services/cache/cache.service';
import { ActionsService } from '../../../../services/actions.service';
import { Result } from '../../../../interfaces/result/result.interface';
import { MainResponse } from '../../../../interfaces/responses.interface';
import { GetResultsService } from '../../../../services/control-list/get-results.service';
import { SoundService } from '../../../../services/sound.service';

@Component({
  selector: 'app-create-result-modal',
  standalone: true,
  imports: [DialogModule, ButtonModule, FormsModule, InputTextModule, DropdownModule, RouterLink],
  templateUrl: './create-result-modal.component.html',
  styleUrl: './create-result-modal.component.scss'
})
export class CreateResultModalComponent {
  allModalsService = inject(AllModalsService);
  indicatorsService = inject(IndicatorsService);
  getContractsService = inject(GetContractsService);
  getResultsService = inject(GetResultsService);
  cache = inject(CacheService);
  router = inject(Router);
  api = inject(ApiService);
  actions = inject(ActionsService);
  body = signal<{ indicator_id: number | null; title: string | null; contract_id: number | null }>({ indicator_id: null, title: null, contract_id: null });
  soundService = inject(SoundService);

  async createResult(openresult?: boolean) {
    const result = await this.api.POST_Result(this.body());
    if (result.successfulRequest) {
      this.successRequest(result, openresult);
    } else {
      this.badRequest(result);
    }
  }

  successRequest = (result: MainResponse<Result>, openresult?: boolean) => {
    this.actions.showToast({
      severity: 'success',
      summary: 'Success',
      detail: `Result "${this.body().title}" created successfully`
    });
    this.soundService.playCreationAudio();
    this.allModalsService.closeModal('createResult');
    this.body.set({ indicator_id: null, title: null, contract_id: null });
    if (openresult) this.actions.changeResultRoute(result.data.result_id);
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
