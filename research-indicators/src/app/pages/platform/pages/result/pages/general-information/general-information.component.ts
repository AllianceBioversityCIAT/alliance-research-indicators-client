import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ApiService } from '@services/api.service';
import { CacheService } from '@services/cache/cache.service';
import { ChipsModule } from 'primeng/chips';
import { GeneralInformation } from '@interfaces/result/general-information.interface';

interface Option {
  name: string;
}

@Component({
  selector: 'app-general-information',
  standalone: true,
  imports: [DialogModule, ButtonModule, FormsModule, InputTextModule, DropdownModule, InputTextareaModule, ReactiveFormsModule, ChipsModule],
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.scss'
})
export default class GeneralInformationComponent {
  api = inject(ApiService);
  cache = inject(CacheService);
  value: undefined;
  options: Option[] | undefined;
  body: WritableSignal<GeneralInformation> = signal({ title: '', description: '', keywords: [], main_contract_person: { result_user_id: 0, result_id: 0, user_id: 0, user_role_id: 0 } });

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
  }
}
