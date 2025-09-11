import { Component, inject, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputComponent } from '../../../../../../shared/components/custom-fields/input/input.component';
import { SetUpProjectService } from '../../set-up-project.service';
import { Level } from '../../../../../../shared/interfaces/get-structures.interface';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-levels-modal',
  imports: [DialogModule, ButtonModule, InputComponent, InputTextModule, FormsModule],
  templateUrl: './manage-levels-modal.component.html',
  styleUrl: './manage-levels-modal.component.scss'
})
export class ManageLevelsModalComponent {
  visible = signal(true);
  setUpProjectService = inject(SetUpProjectService);
  body = signal({ title: null });
  addCustomField = (level: Level) => {
    console.log('addCustomField', level);
    level.custom_fields.push({ fieldID: null, field_name: '' });
  };
  constructor() {
    console.log('hola');
  }
}
