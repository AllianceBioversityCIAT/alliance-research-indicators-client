import { Component, inject, signal, WritableSignal } from '@angular/core';
import { GetContractsService } from '@services/control-list/get-contracts.service';
import { FormsModule } from '@angular/forms';
import { GetLeversService } from '@services/control-list/get-levers.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { ButtonModule } from 'primeng/button';
import { GetAllianceAlignment } from '../../../../../../shared/interfaces/get-alliance-alignment.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alliance-alignment',
  standalone: true,
  imports: [MultiSelectModule, FormsModule, MultiselectComponent, ButtonModule],
  templateUrl: './alliance-alignment.component.html',
  styleUrl: './alliance-alignment.component.scss'
})
export default class AllianceAlignmentComponent {
  getContractsService = inject(GetContractsService);
  getLeversService = inject(GetLeversService);
  body: WritableSignal<GetAllianceAlignment> = signal({
    contracts: [],
    levers: []
  });
  apiService = inject(ApiService);
  cache = inject(CacheService);
  actions = inject(ActionsService);
  router = inject(Router);
  constructor() {
    this.getData();
  }

  async getData() {
    const response = await this.apiService.GET_Alignments(this.cache.currentResultId());
    this.body.set(response.data);
  }

  async saveData(page?: 'next' | 'back') {
    await this.apiService.PATCH_Alignments(this.cache.currentResultId(), this.body());
    if (page === 'back') this.router.navigate(['result', this.cache.currentResultId(), 'general-information']);
    if (page === 'next') this.router.navigate(['result', this.cache.currentResultId(), 'partners']);
    this.actions.showToast({ severity: 'success', summary: 'Alliance Alignment', detail: 'Data saved successfully' });
    this.getData();
  }

  // onSaveSection = effect(() => {
  //   if (this.actions.saveCurrentSectionValue()) this.saveData();
  // });

  markAsPrimary(item: { is_primary: boolean }, type: 'contract' | 'lever') {
    this.body.update(current => {
      if (type === 'contract') {
        current.contracts.map(contract => (contract.is_primary = false));
      } else if (type === 'lever') {
        current.levers.map(lever => (lever.is_primary = false));
      }
      return { ...current };
    });
    item.is_primary = !item.is_primary;
    this.actions.saveCurrentSection();
  }
}
