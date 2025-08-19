import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SetUpProjectService } from '../../set-up-project.service';
import { ManageIndicatorModalComponent } from '../../components/manage-indicator-modal/manage-indicator-modal.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { GetIndicators } from '../../../../../../shared/interfaces/get-indicators.interface';

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

    this.actions.showToast({
      severity: response.successfulRequest ? 'success' : 'error',
      summary: response.successfulRequest ? 'Success' : 'Error',
      detail: response.successfulRequest ? 'Indicator deleted successfully' : 'Failed to delete indicator'
    });

    if (!response.successfulRequest) return;
    this.setUpProjectService.getIndicators();
    this.setUpProjectService.getStructures();
  };
  onEditIndicator = (indicator: GetIndicators) => {
    this.setUpProjectService.manageIndicatorModal.set({ show: true, editingMode: true, indicator });
    this.setUpProjectService.manageIndicatorform.set({
      name: indicator.name,
      description: indicator.description,
      numberType: indicator.numberType,
      numberFormat: indicator.numberFormat,
      years: indicator.years,
      targetUnit: indicator.targetUnit,
      targetValue: Number(indicator.targetValue),
      baseline: Number(indicator.baseline),
      agreement_id: this.setUpProjectService.currentAgreementId() as number,
      code: indicator.code,
      id: indicator.id
    });
  };
}
