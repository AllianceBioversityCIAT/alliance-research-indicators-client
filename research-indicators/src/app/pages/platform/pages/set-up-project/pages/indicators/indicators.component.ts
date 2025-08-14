import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SetUpProjectService } from '../../set-up-project.service';
import { ManageIndicatorModalComponent } from '../../components/manage-indicator-modal/manage-indicator-modal.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';

@Component({
  selector: 'app-indicators',
  imports: [ButtonModule, TooltipModule, ManageIndicatorModalComponent],
  templateUrl: './indicators.component.html',
  styleUrl: './indicators.component.scss'
})
export default class IndicatorsComponent {
  setUpProjectService = inject(SetUpProjectService);
  api = inject(ApiService);
  actions = inject(ActionsService);
  onDeleteIndicator = async (indicatorId: number | string) => {
    const response = await this.api.DELETE_Indicator(Number(indicatorId));
    if (!response.successfulRequest)
      return this.actions.showToast({
        severity: 'error',
        summary: 'Indicator deleted',
        detail: 'Indicator deleted successfully'
      });
    this.actions.showToast({
      severity: 'success',
      summary: 'Indicator deleted',
      detail: 'Indicator deleted successfully'
    });
    this.setUpProjectService.getIndicators();
    this.setUpProjectService.getStructures();
  };
}
