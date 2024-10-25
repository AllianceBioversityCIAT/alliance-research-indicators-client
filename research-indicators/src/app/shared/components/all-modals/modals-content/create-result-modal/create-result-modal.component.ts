import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { AllModalsService } from '../../../../services/all-modals.service';

interface Indicator {
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

  value: undefined;
  isModalVisible = false; // Variable booleana para el estado del modal

  indicators: Indicator[] | undefined;

  selectedIndicator: Indicator | undefined;

  ngOnInit() {
    this.indicators = [{ name: 'Indicator1' }, { name: 'Indicator 2' }];
  }

  showDialog() {
    this.isModalVisible = true;
  }

  hideDialog() {
    this.isModalVisible = false;
  }
}
