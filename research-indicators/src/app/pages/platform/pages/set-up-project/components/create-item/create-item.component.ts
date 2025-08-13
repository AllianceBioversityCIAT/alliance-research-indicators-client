import { Component, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IndicatorsStructure } from '../../../../../../shared/interfaces/get-structures.interface';
import { NewItemForm } from '../../../../../../shared/interfaces/project-setup.interface';
import { SetUpProjectService } from '../../set-up-project.service';

@Component({
  selector: 'app-create-item',
  imports: [ButtonModule, InputTextModule, FormsModule],
  templateUrl: './create-item.component.html',
  styleUrl: './create-item.component.scss'
})
export class CreateItemComponent {
  @Input() structure!: IndicatorsStructure;
  @Input() index = 0;
  newItemForm = signal<NewItemForm>({ name: '', code: '' });

  setUpProjectService = inject(SetUpProjectService);

  addItem() {
    this.setUpProjectService.structures.update(prev => {
      prev[this.index].items?.push({
        name: this.newItemForm().name,
        code: this.newItemForm().code
      });
      return [...prev];
    });
    this.setUpProjectService.editingElementId.set(null);
  }
}
