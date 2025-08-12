import { Component, signal } from '@angular/core';
import { NewStructureForm } from '../../../../../../shared/interfaces/project-setup.interface';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-update-structure',
  imports: [ButtonModule, FormsModule],
  templateUrl: './update-structure.component.html',
  styleUrl: './update-structure.component.scss'
})
export class UpdateStructureComponent {
  newStructureForm = signal<NewStructureForm>({ name: '', code: '' });
}
