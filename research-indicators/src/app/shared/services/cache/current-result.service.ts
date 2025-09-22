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
  constructor() {}
  openEditRequestdOicrsModal(id: number) {
    this.createResultManagementService.currentRequestedResultCode.set(id);
    this.createResultManagementService.editingOicr.set(true);
    this.api.GET_OICRModal(id).then(response => {
      this.createResultManagementService.createOicrBody.set(response.data);
      this.allModalsService.openModal('createResult');
      this.createResultManagementService.resultPageStep.set(2);
      this.createResultManagementService.modalTitle.set('Edit OICR');
    });
  }
}
