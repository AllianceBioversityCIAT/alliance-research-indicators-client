import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { GetContractsService } from '@services/control-list/get-contracts.service';
import { FormsModule } from '@angular/forms';
import { GetLeversService } from '@services/control-list/get-levers.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { MultiselectComponent } from '../../../../../../shared/components/custom-fields/multiselect/multiselect.component';
import { JsonPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-alliance-alignment',
  standalone: true,
  imports: [MultiSelectModule, FormsModule, MultiselectComponent, JsonPipe, ButtonModule],
  templateUrl: './alliance-alignment.component.html',
  styleUrl: './alliance-alignment.component.scss'
})
export default class AllianceAlignmentComponent {
  getContractsService = inject(GetContractsService);
  getLeversService = inject(GetLeversService);
  body: WritableSignal<any> = signal({
    contracts: [],
    levers: []
  });
  apiService = inject(ApiService);
  cache = inject(CacheService);
  actions = inject(ActionsService);

  constructor() {
    this.getData();
  }

  async getData() {
    const response = await this.apiService.GET_Alignments(this.cache.currentResultId());
    this.body.set(response.data);
    console.log(this.body());

    // setTimeout(() => {
    //   console.log(this.body());
    // }, 2000);
  }

  async saveData() {
    console.log(this.body());
    await this.apiService.PATCH_Alignments(this.cache.currentResultId(), this.body());
    this.actions.showToast({ severity: 'success', summary: 'Alliance Alignment', detail: 'Data saved successfully' });
  }

  onSaveSection = effect(() => {
    if (this.actions.saveCurrentSectionValue()) this.saveData();
  });

  markAsPrimary(lever: any) {
    console.log(lever);
    // this.body.update((current: any) => {
    //   return { ...current, levers: current.levers.map((item: any) => (item.lever_id === lever.lever_id ? { ...item, primary: true } : item)) };
    // });
    // console.log(this.body());
    lever.is_primary = !lever.is_primary;
    console.log(this.body());
  }
}
