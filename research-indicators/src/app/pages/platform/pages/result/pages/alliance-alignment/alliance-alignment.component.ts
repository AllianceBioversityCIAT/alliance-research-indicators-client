import { Component, effect, inject, signal } from '@angular/core';
import { GetContractsService } from '@services/control-list/get-contracts.service';
import { FormsModule } from '@angular/forms';
import { GetLeversService } from '@services/control-list/get-levers.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';

@Component({
  selector: 'app-alliance-alignment',
  standalone: true,
  imports: [MultiSelectModule, FormsModule, MultiselectComponent],
  templateUrl: './alliance-alignment.component.html',
  styleUrl: './alliance-alignment.component.scss'
})
export default class AllianceAlignmentComponent {
  getContractsService = inject(GetContractsService);
  getLeversService = inject(GetLeversService);
  body = signal({ contracts: [], levers: [] });
  apiService = inject(ApiService);
  cache = inject(CacheService);
  actions = inject(ActionsService);

  constructor() {
    this.getData();
  }

  async getData() {
    const response = await this.apiService.GET_Alignments(this.cache.currentResultId());
    this.body.set(response.data);
    console.log(response.data);
  }

  async saveData() {
    const response = await this.apiService.PATCH_Alignments(this.cache.currentResultId(), this.body());
    console.log(response);
  }

  onSaveSection = effect(() => {
    if (this.actions.saveCurrentSectionValue()) this.saveData();
  });
}
