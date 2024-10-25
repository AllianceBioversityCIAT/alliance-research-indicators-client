import { Component, computed, inject, Input } from '@angular/core';
import { AllModalsService } from '../../services/all-modals.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  allModalsService = inject(AllModalsService);
  @Input() modalName!: 'createResult' | 'createTest';

  showModal = computed(() => this.allModalsService.showModal()[this.modalName]);

  toggleModal() {
    this.allModalsService.showModal.update(modals => ({
      ...modals,
      [this.modalName]: !modals[this.modalName]
    }));
  }
}
