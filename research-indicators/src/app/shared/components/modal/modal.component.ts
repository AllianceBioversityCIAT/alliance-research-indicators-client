import { Component, computed, inject, Input } from '@angular/core';
import { AllModalsService } from '../../services/all-modals.service';
import { ModalName } from '../../types/modal.types';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  allModalsService = inject(AllModalsService);
  @Input() modalName!: ModalName;
  showModal = computed(() => this.allModalsService.showModal()[this.modalName]);
}
