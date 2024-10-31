import { Component, effect, inject, signal, WritableSignal, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ApiService } from '@services/api.service';
import { CacheService } from '@services/cache/cache.service';
import { ChipsModule } from 'primeng/chips';
import { GeneralInformation } from '@interfaces/result/general-information.interface';
import { GetContractsService } from '../../../../../../shared/services/control-list/get-contracts.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { SaveOnWritingDirective } from '../../../../../../shared/directives/save-on-writing.directive';
import { ActivatedRoute, Router } from '@angular/router';

interface Option {
  name: string;
}

@Component({
  selector: 'app-general-information',
  standalone: true,
  imports: [DialogModule, ButtonModule, FormsModule, InputTextModule, DropdownModule, InputTextareaModule, ReactiveFormsModule, ChipsModule, SaveOnWritingDirective],
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.scss'
})
export default class GeneralInformationComponent {
  actions = inject(ActionsService);
  api = inject(ApiService);
  cache = inject(CacheService);
  getContractsService = inject(GetContractsService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  options: Option[] | undefined;
  body: WritableSignal<GeneralInformation> = signal({ title: '', description: '', keywords: [], main_contract_person: null });

  constructor() {
    this.getData();
  }

  async getData() {
    const response = await this.api.GET_GeneralInformation(this.cache.currentResultId());
    this.body.set(response.data);
  }

  async saveData() {
    const data = await this.api.PATCH_GeneralInformation(this.cache.currentResultId(), this.body());
    console.log(data);
    this.actions.showToast('success', 'General Information', 'Data saved successfully');
    this.router.navigate(['result', this.cache.currentResultId(), 'partners']);
  }
  onSaveSection = effect(() => {
    if (this.actions.saveCurrentSectionValue()) this.saveData();
  });
}
