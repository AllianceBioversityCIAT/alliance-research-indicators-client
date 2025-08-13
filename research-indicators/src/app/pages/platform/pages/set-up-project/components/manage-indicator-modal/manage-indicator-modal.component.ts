import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { SetUpProjectService } from '../../set-up-project.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import {
  AVAILABLE_YEARS,
  NUMBER_FORMAT_OPTIONS,
  NUMBER_TYPE_OPTIONS,
  NumberFormatOption,
  NumberTypeOption
} from '../../../../../../shared/interfaces/project-setup.interface';
import { PostIndicator } from '../../../../../../shared/interfaces/post-indicator.interface';

@Component({
  selector: 'app-manage-indicator-modal',
  imports: [DialogModule, ButtonModule, FormsModule, InputTextModule, TextareaModule, SelectModule, InputNumberModule, MultiSelectModule],
  templateUrl: './manage-indicator-modal.component.html',
  styleUrl: './manage-indicator-modal.component.scss'
})
export class ManageIndicatorModalComponent {
  setUpProjectService = inject(SetUpProjectService);
  api = inject(ApiService);

  numberTypeOptions = NUMBER_TYPE_OPTIONS;
  numberFormatOptions = NUMBER_FORMAT_OPTIONS;
  availableYears = AVAILABLE_YEARS.map(year => ({ label: String(year), value: year }));

  form = signal<PostIndicator>({
    name: '',
    description: '',
    numberType: '' as unknown as NumberTypeOption,
    numberFormat: '' as unknown as NumberFormatOption,
    years: [],
    targetUnit: '',
    targetValue: 0,
    baseline: 0
  });

  close() {
    this.setUpProjectService.manageIndicatorModal.set({ show: false });
  }

  async save() {
    const value = this.form();
    if (!value.name || !value.description || !value.numberType || !value.numberFormat || !value.years.length || !value.targetUnit) {
      return;
    }
    await this.api.POST_Indicator(value);
    this.close();
  }
}
