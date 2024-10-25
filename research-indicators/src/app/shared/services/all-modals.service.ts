import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AllModalsService {
  showModal = signal({
    createResult: true,
    createTest: false
  });

  toggleModal(modalName: 'createResult' | 'createTest') {
    this.showModal.update(modals => ({
      ...modals,
      [modalName]: !modals[modalName]
    }));
  }

  closeModal(modalName: 'createResult' | 'createTest') {
    this.showModal.update(modals => ({
      ...modals,
      [modalName]: false
    }));
  }

  openModal(modalName: 'createResult' | 'createTest') {
    this.showModal.update(modals => ({
      ...modals,
      [modalName]: true
    }));
  }

  isModalOpen(modalName: 'createResult' | 'createTest') {
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
