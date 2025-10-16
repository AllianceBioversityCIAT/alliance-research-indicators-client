import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '@shared/components/custom-fields/select/select.component';
import { AllModalsService } from '@shared/services/cache/all-modals.service';

export interface ContactPersonData {
  contact_person_id: number | null;
  role_id: number | null;
}

@Component({
  selector: 'app-add-contact-person-modal',
  standalone: true,
  imports: [FormsModule, SelectComponent],
  templateUrl: './add-contact-person-modal.component.html'
})
export class AddContactPersonModalComponent {
  allModalsService = inject(AllModalsService);

  body: WritableSignal<ContactPersonData> = signal({
    contact_person_id: null,
    role_id: null
  });

  onConfirm() {
    this.allModalsService.toggleModal('addContactPerson');
  }

  onCancel() {
    this.allModalsService.toggleModal('addContactPerson');
  }
}
