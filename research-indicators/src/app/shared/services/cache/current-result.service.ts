import { Injectable, inject } from '@angular/core';
import { AllModalsService } from './all-modals.service';
import { CreateResultManagementService } from '../../components/all-modals/modals-content/create-result-modal/services/create-result-management.service';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentResultService {
  createResultManagementService = inject(CreateResultManagementService);
  api = inject(ApiService);
  allModalsService = inject(AllModalsService);

  async openEditRequestdOicrsModal(indicatorId: number, resultStatusId: number, resultCode: number) {
    if (!this.validateOpenResult(indicatorId, resultStatusId)) return false;
    this.createResultManagementService.currentRequestedResultCode.set(resultCode);
    this.createResultManagementService.editingOicr.set(true);
    await this.api.GET_OICRModal(resultCode).then(response => {
      this.createResultManagementService.createOicrBody.set(response.data);
      this.allModalsService.openModal('createResult');
      this.createResultManagementService.resultPageStep.set(2);
      this.createResultManagementService.modalTitle.set('Edit OICR');
    });
    return true;
  }

  validateOpenResult(indicatorId: number, resultStatusId: number) {
    return indicatorId === 5 || resultStatusId === 9;
  }
}
