import { Component, inject, signal } from '@angular/core';
import { SetUpProjectService } from '../../set-up-project.service';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { NewStructureForm } from '../../../../../../shared/interfaces/project-setup.interface';

@Component({
  selector: 'app-create-structure',
  imports: [ButtonModule, FormsModule],
  templateUrl: './create-structure.component.html',
  styleUrl: './create-structure.component.scss'
})
export class CreateStructureComponent {
  setUpProjectService = inject(SetUpProjectService);
  newStructureForm = signal<NewStructureForm>({ name: '', code: '' });
}
