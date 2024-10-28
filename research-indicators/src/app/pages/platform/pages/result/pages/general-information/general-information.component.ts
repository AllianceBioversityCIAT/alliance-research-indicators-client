import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ApiService } from '../../../../../../shared/services/api.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';

interface Option {
  name: string;
}

@Component({
  selector: 'app-general-information',
  standalone: true,
  imports: [DialogModule, ButtonModule, FormsModule, InputTextModule, DropdownModule, InputTextareaModule],
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

  constructor() {
    this.getData();
  }

  ngOnInit() {
    this.options = [{ name: 'Option 1' }, { name: 'Option 2' }, { name: 'Option 3' }, { name: 'Option 4' }];
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
