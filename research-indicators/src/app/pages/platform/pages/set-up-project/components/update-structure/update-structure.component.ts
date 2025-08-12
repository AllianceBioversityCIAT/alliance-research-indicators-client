import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { IndicatorsStructure } from '../../../../../../shared/interfaces/get-structures.interface';

@Component({
  selector: 'app-update-structure',
  imports: [ButtonModule, FormsModule],
  templateUrl: './update-structure.component.html',
  styleUrl: './update-structure.component.scss'
})
export class UpdateStructureComponent {
  newStructureForm = signal<IndicatorsStructure>({ name: '', code: '' });
}
