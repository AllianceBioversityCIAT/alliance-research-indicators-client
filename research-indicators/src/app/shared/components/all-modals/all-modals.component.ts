import { Component, inject } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { CreateResultModalComponent } from './modals-content/create-result-modal/create-result-modal.component';
import { CreateResultManagementService } from './modals-content/create-result-modal/services/create-result-management.service';
import { RequestPartnerModalComponent } from './modals-content/request-partner-modal/request-partner-modal.component';

@Component({
  selector: 'app-all-modals',
  imports: [ModalComponent, CreateResultModalComponent, RequestPartnerModalComponent],
  templateUrl: './all-modals.component.html',
  styleUrl: './all-modals.component.scss'
})
export class AllModalsComponent {
  createResultManagementService = inject(CreateResultManagementService);

  clearModal = () => {
    setTimeout(() => {
      this.createResultManagementService.resultPageStep.set(0);
    }, 300);
  };
}
