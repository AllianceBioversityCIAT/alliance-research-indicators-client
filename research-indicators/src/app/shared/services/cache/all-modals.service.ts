import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { CreateResultManagementService } from '@shared/components/all-modals/modals-content/create-result-modal/services/create-result-management.service';
import { ModalName } from '@ts-types/modal.types';

interface ModalConfig {
  isOpen: boolean;
  title: string;
  icon?: string;
  cancelText?: string;
  confirmText?: string;
  iconAction?: () => void;
  cancelAction?: () => void;
  confirmAction?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class AllModalsService {
  createResultManagementService = inject(CreateResultManagementService);
  goBackFunction?: () => void;
  setGoBackFunction = (fn: () => void) => (this.goBackFunction = fn);
  submitReview?: () => void;
  setSubmitReview = (fn: () => void) => (this.submitReview = fn);

  modalConfig: WritableSignal<Record<ModalName, ModalConfig>> = signal({
    createResult: {
      isOpen: false,
      title: 'Create a result'
    },
    submitResult: {
      isOpen: false,
      title: 'Review Result',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      cancelAction: () => this.toggleModal('submitResult'),
      confirmAction: () => this.submitReview?.()
    },
    requestPartner: {
      isOpen: false,
      title: 'Partners Request',
      // cancelText: 'Cancel',
      confirmText: 'Request',
      // cancelAction: () => this.toggleModal('submitResult'),
      confirmAction: () => this.submitReview?.()
    }
  });

  constructor() {
    effect(() => {
      const step = this.createResultManagementService.resultPageStep();
      this.updateModal(step);
    });
  }

  updateModal(step: number): void {
    this.modalConfig.update(modal => {
      modal.createResult = {
        isOpen: modal.createResult.isOpen,
        title: step === 1 ? 'File Upload AI' : 'Create a result',
        ...(step === 1 ? { iconAction: () => this.goBackFunction?.(), icon: 'arrow_back' } : {})
      };
      return modal;
    });
  }

  toggleModal(modalName: ModalName): void {
    this.modalConfig.update(modals => ({
      ...modals,
      [modalName]: {
        ...modals[modalName],
        isOpen: !modals[modalName]?.isOpen
      }
    }));

    if (modalName === 'createResult') {
      this.createResultManagementService.resultPageStep.set(0);
    }
  }

  closeModal(modalName: ModalName): void {
    this.modalConfig.update(modals => ({
      ...modals,
      [modalName]: {
        ...modals[modalName],
        isOpen: false
      }
    }));

    if (modalName === 'createResult') {
      this.createResultManagementService.resultPageStep.set(0);
    }
  }

  openModal(modalName: ModalName): void {
    this.modalConfig.update(modals => ({
      ...modals,
      [modalName]: {
        ...modals[modalName],
        isOpen: true
      }
    }));
  }

  isModalOpen(modalName: ModalName): ModalConfig {
    return this.modalConfig()[modalName];
  }

  isAnyModalOpen(): boolean {
    return Object.values(this.modalConfig()).some(value => value);
  }

  closeAllModals(): void {
    this.modalConfig.set({
      createResult: { ...this.modalConfig().createResult, isOpen: false },
      submitResult: { ...this.modalConfig().submitResult, isOpen: false },
      requestPartner: { ...this.modalConfig().submitResult, isOpen: false }
    });

    this.createResultManagementService.resultPageStep.set(0);
  }
}
