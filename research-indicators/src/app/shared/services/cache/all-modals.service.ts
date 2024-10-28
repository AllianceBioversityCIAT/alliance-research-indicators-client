import { Injectable, signal, WritableSignal } from '@angular/core';
import { ModalName } from '@ts-types/modal.types';

@Injectable({
  providedIn: 'root'
})
export class AllModalsService {
  showModal: WritableSignal<Record<ModalName, boolean>> = signal({
    createResult: false,
    createTest: false
  });

  toggleModal(modalName: ModalName) {
    this.showModal.update(modals => ({
      ...modals,
      [modalName]: !modals[modalName]
    }));
  }

  closeModal(modalName: ModalName) {
    this.showModal.update(modals => ({
      ...modals,
      [modalName]: false
    }));
  }

  openModal(modalName: ModalName) {
    this.showModal.update(modals => ({
      ...modals,
      [modalName]: true
    }));
  }

  isModalOpen(modalName: ModalName) {
    return this.showModal()[modalName];
  }

  isAnyModalOpen() {
    return Object.values(this.showModal()).some(value => value);
  }

  closeAllModals() {
    this.showModal.set({
      createResult: false,
      createTest: false
    });
  }
}
