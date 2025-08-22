import { Component, inject } from '@angular/core';
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
import { ActionsService } from '../../../../../../shared/services/actions.service';

@Component({
  selector: 'app-manage-indicator-modal',
  imports: [DialogModule, ButtonModule, FormsModule, InputTextModule, TextareaModule, SelectModule, InputNumberModule, MultiSelectModule],
  templateUrl: './manage-indicator-modal.component.html',
  styleUrl: './manage-indicator-modal.component.scss'
})
export class ManageIndicatorModalComponent {
  setUpProjectService = inject(SetUpProjectService);
  api = inject(ApiService);
  actions = inject(ActionsService);
  numberTypeOptions = NUMBER_TYPE_OPTIONS;
  numberFormatOptions = NUMBER_FORMAT_OPTIONS;
  availableYears = AVAILABLE_YEARS.map(year => ({ label: String(year), value: year }));

  close() {
    this.setUpProjectService.manageIndicatorModal.set({ show: false, assignModal: false, editingMode: false });
    this.cleanForm();
  }

  cleanForm() {
    this.setUpProjectService.manageIndicatorform.set({
      name: '',
      description: '',
      numberType: '' as unknown as NumberTypeOption,
      numberFormat: '' as unknown as NumberFormatOption,
      years: [],
      targetUnit: '',
      targetValue: 0,
      baseline: 0,
      agreement_id: this.setUpProjectService.currentAgreementId() as number,
      code: '',
      id: null
    });
  }

  async save() {
    const value = this.setUpProjectService.manageIndicatorform();
    if (!value.name || !value.numberType || !value.numberFormat || !value.years.length || !value.targetUnit) {
      return;
    }
    const response = await this.api.POST_Indicator({ ...value, agreement_id: this.setUpProjectService.currentAgreementId() as number });
    if (!response.successfulRequest) {
      this.actions.showToast({ severity: 'error', summary: 'Error', detail: 'Failed to create indicator' });
      return;
    }

    // Si está en modo assign, asignar el indicador al elemento correspondiente
    if (this.setUpProjectService.manageIndicatorModal().assignModal) {
      const createdIndicator = response.data;

      // Determinar si es level 1 (estructura) o level 2 (tema)
      const targetLevel1 = this.setUpProjectService.assignIndicatorsModal().targetLevel1;
      const targetLevel2 = this.setUpProjectService.assignIndicatorsModal().targetLevel2;

      if (targetLevel1) {
        // Asignar a estructura (level 1)
        this.setUpProjectService.structures.update(prev => {
          const targetStructureIndex = prev.findIndex(structure => structure.id === targetLevel1.id);
          if (targetStructureIndex !== -1) {
            const structuresCopy = [...prev];
            if (!structuresCopy[targetStructureIndex].indicators) {
              structuresCopy[targetStructureIndex].indicators = [];
            }
            structuresCopy[targetStructureIndex].indicators.push(createdIndicator);
            return structuresCopy;
          }
          return prev;
        });
      } else if (targetLevel2) {
        // Asignar a tema (level 2)
        this.setUpProjectService.structures.update(prev => {
          const structuresCopy = [...prev];
          for (const structure of structuresCopy) {
            if (structure.items) {
              const itemIndex = structure.items.findIndex(item => item.id === targetLevel2.id);
              if (itemIndex !== -1) {
                const targetItem = structure.items[itemIndex];
                if (targetItem) {
                  if (!targetItem.indicators) {
                    targetItem.indicators = [];
                  }
                  targetItem.indicators.push(createdIndicator);
                  break;
                }
              }
            }
          }
          return structuresCopy;
        });
      }
      this.setUpProjectService.assignIndicatorsModal.set({
        show: false,
        targetLevel1: undefined,
        targetLevel2: undefined
      });
      // Guardar las estructuras después de la asignación
      await this.setUpProjectService.saveStructures();
    }

    this.setUpProjectService.getIndicators();
    this.actions.showToast({ severity: 'success', summary: 'Success', detail: 'Indicator created successfully' });
    this.close();
  }
}
