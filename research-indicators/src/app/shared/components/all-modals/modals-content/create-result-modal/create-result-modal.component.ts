import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { AllModalsService } from '@services/cache/all-modals.service';
import { ApiService } from '@services/api.service';

interface Option {
  name: string;
}

@Component({
  selector: 'app-create-result-modal',
  standalone: true,
  imports: [DialogModule, ButtonModule, FormsModule, InputTextModule, DropdownModule, RouterLink],
  templateUrl: './create-result-modal.component.html',
  styleUrl: './create-result-modal.component.scss'
})
export class CreateResultModalComponent implements OnInit {
  allModalsService = inject(AllModalsService);
  api = inject(ApiService);
  title: any;
  isModalVisible = false; // Variable booleana para el estado del modal

  options: Option[] | undefined;

  selectedOption: Option | undefined;

  ngOnInit() {
    this.options = [{ name: 'Option 1' }, { name: 'Option 2' }, { name: 'Option 3' }, { name: 'Option 4' }];
  }

  showDialog() {
    this.isModalVisible = true;
  }

  hideDialog() {
    this.isModalVisible = false;
  }

  async createResult() {
    const result = await this.api.POST_Result({ title: this.title, indicator_id: 1 });
    console.log(result);
  }
}
