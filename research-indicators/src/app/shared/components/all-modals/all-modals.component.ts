import { Component } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { CreateResultModalComponent } from './modals-content/create-result-modal/create-result-modal.component';

@Component({
  selector: 'app-all-modals',
  standalone: true,
  imports: [ModalComponent, CreateResultModalComponent],
  templateUrl: './all-modals.component.html',
  styleUrl: './all-modals.component.scss'
})
export class AllModalsComponent {}
