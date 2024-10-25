import { Component, inject, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AllModalsService } from '../../services/all-modals.service';
import { ModalName } from '../../types/modal.types';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  animations: [
    trigger('fadeIn', [state('void', style({ opacity: 0 })), state('*', style({ opacity: 1 })), transition('void <=> *', animate('300ms ease-in-out'))]),
    trigger('scaleIn', [
      state('void', style({ transform: 'scale(0)' })),
      state('*', style({ transform: 'scale(1)' })),
      transition('void <=> *', animate('300ms 500ms ease-out')) // 500ms delay
    ])
  ]
})
export class ModalComponent {
  allModalsService = inject(AllModalsService);
  @Input() modalName!: ModalName;

  showModal() {
    return this.allModalsService.isModalOpen(this.modalName);
  }
}
