import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SetUpProjectService } from '../../set-up-project.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assign-indicators-modal',
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './assign-indicators-modal.component.html',
  styleUrl: './assign-indicators-modal.component.scss'
})
export class AssignIndicatorsModalComponent {
  setUpProjectService = inject(SetUpProjectService);

  targetInfo = computed(
    () => this.setUpProjectService.assignIndicatorsModal().targetLevel1 || this.setUpProjectService.assignIndicatorsModal().targetLevel2
  );

  getIndicatorsFiltered = computed(() => {
    // Level 1 - Structure indicators
    if (this.setUpProjectService.assignIndicatorsModal().targetLevel1) {
      return this.setUpProjectService.indicatorList().map(indicator => ({
        ...indicator,
        adding: !this.setUpProjectService.assignIndicatorsModal().targetLevel1?.indicators.some(i => i.id == indicator.id)
      }));
    }

    // Level 2 - Item indicators
    if (this.setUpProjectService.assignIndicatorsModal().targetLevel2) {
      return this.setUpProjectService.indicatorList().map(indicator => ({
        ...indicator,
        adding: !this.setUpProjectService.assignIndicatorsModal().targetLevel2?.indicators?.some(i => i.id == indicator.id)
      }));
    }

    return this.setUpProjectService.indicatorList();
  });

  openCreateIndicatorModal() {
    // Close the current modal
    this.setUpProjectService.assignIndicatorsModal.set({
      show: false,
      targetLevel1: undefined,
      targetLevel2: undefined
    });

    // Open the create indicator modal
    this.setUpProjectService.manageIndicatorModal.set({
      show: true,
      editingMode: false,
      level1Data: this.setUpProjectService.assignIndicatorsModal().targetLevel1,
      level2Data: this.setUpProjectService.assignIndicatorsModal().targetLevel2
    });
  }
}
