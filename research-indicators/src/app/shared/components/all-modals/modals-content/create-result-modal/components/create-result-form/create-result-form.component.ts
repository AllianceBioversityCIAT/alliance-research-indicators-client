import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { AllModalsService } from '@services/cache/all-modals.service';
import { ApiService } from '@services/api.service';
import { IndicatorsService } from '../../../../../../services/control-list/indicators.service';
import { GetContractsService } from '../../../../../../services/control-list/get-contracts.service';
import { GetResultsService } from '../../../../../../services/control-list/get-results.service';
import { CacheService } from '../../../../../../services/cache/cache.service';
import { ActionsService } from '../../../../../../services/actions.service';
import { SoundService } from '../../../../../../services/sound.service';
import { MainResponse } from '../../../../../../interfaces/responses.interface';
import { Result } from '../../../../../../interfaces/result/result.interface';
import { CreateResultManagementService } from '../../services/create-result-management.service';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { GetContracts } from '../../../../../../interfaces/get-contracts.interface';

@Component({
  selector: 'app-create-result-form',
  standalone: true,
  imports: [DialogModule, ButtonModule, FormsModule, InputTextModule, DropdownModule, RouterModule, AutoCompleteModule],
  templateUrl: './create-result-form.component.html',
  styleUrl: './create-result-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateResultFormComponent {
  allModalsService = inject(AllModalsService);
  indicatorsService = inject(IndicatorsService);
  getContractsService = inject(GetContractsService);
  getResultsService = inject(GetResultsService);
  createResultManagementService = inject(CreateResultManagementService);
  cache = inject(CacheService);
  router = inject(Router);
  api = inject(ApiService);
  actions = inject(ActionsService);
  body = signal<{ indicator_id: number | null; title: string | null; contract_id: number | null }>({
    indicator_id: null,
    title: null,
    contract_id: null
  });
  soundService = inject(SoundService);
  filteredPrimaryContracts = signal<GetContracts[]>([]);

  async createResult(openresult?: boolean) {
    const result = await this.api.POST_Result(this.body());
    if (result.successfulRequest) {
      this.successRequest(result, openresult);
    } else {
      this.badRequest(result);
    }
  }

  filterPrimaryContract(event: AutoCompleteCompleteEvent) {
    const filtered: GetContracts[] = [];
    const query = event.query.toLowerCase();

    for (const item of this.getContractsService.list()) {
      if (
        item.description.toLowerCase().includes(query) ||
        item.agreement_id.toString().toLowerCase().includes(query) ||
        item.project_lead_description.toLowerCase().includes(query)
      ) {
        filtered.push(item);
      }
    }

    this.filteredPrimaryContracts.set(filtered);
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
      detail: isWarning ? `${result.errorDetail.errors} "${this.body().title}"` : result.errorDetail.errors,
      callbacks: [
        {
          label: 'Close',
          event: () => {
            return;
          }
        }
      ]
    });
  };
}
