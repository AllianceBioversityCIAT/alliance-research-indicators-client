import { Component, inject, Input, computed, Signal } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AllModalsService } from '@services/cache/all-modals.service';
import { ModalName } from '@ts-types/modal.types';
import { CreateResultManagementService } from '@shared/components/all-modals/modals-content/create-result-modal/services/create-result-management.service';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void <=> *', animate('300ms ease-in-out'))
    ]),
    trigger('scaleIn', [
      state('void', style({ transform: 'scale(0)' })),
      state('*', style({ transform: 'scale(1)' })),
      transition('void <=> *', animate('300ms 500ms ease-out')) // 500ms delay
    ])
  ]
})
export class ModalComponent {
  allModalsService = inject(AllModalsService);
  createResultManagementService = inject(CreateResultManagementService);
  @Input() modalName!: ModalName;
  @Input() disabledConfirmIf: Signal<boolean> = computed(() => false);
  @Input() clearModal: () => void = () => {
    /* no-op */
  };

  showModal() {
    return this.allModalsService.isModalOpen(this.modalName);
  }

  getConfig() {
    return this.allModalsService.modalConfig()[this.modalName] ?? {};
  }

  getModalTitle() {
    if (this.modalName === 'createResult' && this.createResultManagementService.resultPageStep() === 2) {
      return this.createResultManagementService.modalTitle();
    }
    return this.getConfig().title;
  }
}
