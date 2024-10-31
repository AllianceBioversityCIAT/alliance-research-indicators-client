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
  cache = inject(CacheService);
  router = inject(Router);
  api = inject(ApiService);
  actions = inject(ActionsService);
  body = signal<{ indicator_id: number | null; title: string | null; contract_id: number | null }>({ indicator_id: null, title: null, contract_id: null });

  async createResult() {
    const result = await this.api.POST_Result(this.body());
    this.actions.changeResultRoute(result.data.result_id);
    this.allModalsService.closeModal('createResult');
    this.body.set({ indicator_id: null, title: null, contract_id: null });
  }
}
