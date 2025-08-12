import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SetUpProjectService } from '../../set-up-project.service';
import { CommonModule } from '@angular/common';
import { GetIndicators } from '../../../../../../shared/interfaces/get-indicators.interface';

@Component({
  selector: 'app-assign-indicators-modal',
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './assign-indicators-modal.component.html',
  styleUrl: './assign-indicators-modal.component.scss'
})
export class AssignIndicatorsModalComponent {
  setUpProjectService = inject(SetUpProjectService);

  visible = computed(() => this.setUpProjectService.assignIndicatorsModal().show);
  targetInfo = computed(() => this.setUpProjectService.assignIndicatorsModal().target);
}
