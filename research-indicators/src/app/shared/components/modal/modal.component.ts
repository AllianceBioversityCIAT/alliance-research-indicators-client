import { Component, inject, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AllModalsService } from '@services/cache/all-modals.service';
import { ModalName } from '@ts-types/modal.types';

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
  @Input() clearModal: () => void = () => {
    /* no-op */
  };

  showModal() {
    return this.allModalsService.isModalOpen(this.modalName);
  }
}
