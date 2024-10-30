import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ApiService } from '../../../../../../shared/services/api.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ChipsModule } from 'primeng/chips';

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
export default class GeneralInformationComponent implements OnInit {
  api = inject(ApiService);
  cache = inject(CacheService);
  value: undefined;
  options: Option[] | undefined;
  body = signal({ title: '' });

  selectedOption: Option | undefined;
  formGroup: FormGroup | undefined;

  constructor() {
    this.getData();
  }

  ngOnInit() {
    this.options = [{ name: 'Option 1' }, { name: 'Option 2' }, { name: 'Option 3' }, { name: 'Option 4' }];
    this.formGroup = new FormGroup({
      values: new FormControl<string[] | null>(null)
    });
  }

  async getData() {
    console.log(this.cache.currentResultId());
    const data = await this.api.GET_GeneralInformation(this.cache.currentResultId());
    console.log(data);
    this.body.set({ title: data.data.title });
    console.log(this.body());
  }

  async saveData() {
    console.log(this.body());

    const data = await this.api.PATCH_GeneralInformation(this.cache.currentResultId(), this.body());
    console.log(data);
  }
}
