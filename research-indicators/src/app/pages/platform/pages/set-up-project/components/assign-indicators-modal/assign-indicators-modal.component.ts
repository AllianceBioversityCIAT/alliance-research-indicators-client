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

  targetInfo = computed(() => this.setUpProjectService.assignIndicatorsModal().targetLevel1);

  getIndicatorsFiltered = computed(() => {
    // const { structureIndex, itemIndex, type } = this.setUpProjectService.assignIndicatorsModal().target;
    // if (type === 'structure') {
    //   return this.setUpProjectService
    //     .indicatorList()
    //     .filter(indicator => !this.setUpProjectService.structures()[structureIndex].indicators.some(i => i.id === indicator.id));
    // } else if (type === 'item') {
    //   return this.setUpProjectService
    //     .indicatorList()
    //     .filter(
    //       indicator => !this.setUpProjectService.structures()[structureIndex]?.items?.[itemIndex]?.indicators?.some(i => i.id === indicator.id)
    //     );
    // }

    if (this.setUpProjectService.assignIndicatorsModal().targetLevel1) {
      return this.setUpProjectService
        .indicatorList()
        .filter(indicator => !this.setUpProjectService.assignIndicatorsModal().targetLevel1?.indicators.some(i => i.id === indicator.id));
    }

    return this.setUpProjectService.indicatorList();
  });
}
