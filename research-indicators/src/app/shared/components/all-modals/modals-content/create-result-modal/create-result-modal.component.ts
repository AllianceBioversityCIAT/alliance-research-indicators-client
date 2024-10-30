import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { AllModalsService } from '@services/cache/all-modals.service';
import { ApiService } from '@services/api.service';
import { IndicatorsService } from '../../../../services/control-list/indicators.service';
import { GetContractsService } from '../../../../services/control-list/get-contracts.service';

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
  api = inject(ApiService);
  body = signal<any>({ indicator_id: null, title: null, description: null });

  async createResult() {
    const result = await this.api.POST_Result(this.body());
    console.log(result);
    this.allModalsService.closeModal('createResult');
  }
}
