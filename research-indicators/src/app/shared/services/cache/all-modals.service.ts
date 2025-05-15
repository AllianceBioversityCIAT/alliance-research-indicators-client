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
  disabledConfirmAction?: () => boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AllModalsService {
  partnerRequestSection = signal<string | null>(null);
  createResultManagementService = inject(CreateResultManagementService);
  goBackFunction?: () => void;
  setGoBackFunction = (fn: () => void) => (this.goBackFunction = fn);
  submitReview?: () => void;
  setSubmitReview = (fn: () => void) => (this.submitReview = fn);
  createPartner?: () => void;
  setCreatePartner = (fn: () => void) => (this.createPartner = fn);
  disabledConfirmPartner?: () => boolean;
  setDisabledConfirmPartner = (fn: () => boolean) => (this.disabledConfirmPartner = fn);
  disabledSubmitReview?: () => boolean;
  setDisabledSubmitReview = (fn: () => boolean) => (this.disabledSubmitReview = fn);

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
      confirmAction: () => this.submitReview?.(),
      disabledConfirmAction: () => this.disabledSubmitReview?.() ?? false
    },
    requestPartner: {
      isOpen: false,
      title: 'Partners Request'
      // disabledConfirmAction: () => this.disabledConfirmPartner?.() ?? false
    }
  });

  constructor() {
    effect(() => {
      const step = this.createResultManagementService.resultPageStep();
      this.updateModal(step);
    });
  }

  setPartnerRequestSection(section: string) {
    this.partnerRequestSection.set(section);
  }

  updateModal(step: number): void {
    this.modalConfig.update(modal => {
      modal.createResult = {
        isOpen: modal.createResult.isOpen,
        title: 'Create A Result',
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
      requestPartner: { ...this.modalConfig().requestPartner, isOpen: false }
    });

    this.createResultManagementService.resultPageStep.set(0);
  }
}
