import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { NewItemForm } from '../../../../../../shared/interfaces/project-setup.interface';
import { IndicatorItem } from '../../../../../../shared/interfaces/get-structures.interface';
import { SetUpProjectService } from '../../set-up-project.service';

@Component({
  selector: 'app-update-item',
  imports: [ButtonModule, InputTextModule, FormsModule],
  templateUrl: './update-item.component.html',
  styleUrl: './update-item.component.scss'
})
export class UpdateItemComponent implements OnInit {
  newItemForm = signal<NewItemForm>({ name: '', code: '', parentStructureId: '' });
  @Input() item!: IndicatorItem;
  @Input() structureIndex = 0;
  @Input() itemIndex = 0;
  setUpProjectService = inject(SetUpProjectService);

  ngOnInit() {
    this.newItemForm.set({
      name: this.item.name,
      code: this.item.code
    });
  }

  onUpdateItem() {
    this.setUpProjectService.structures.update(prev => {
      prev[this.structureIndex].items![this.itemIndex] = this.newItemForm();
      return [...prev];
    });
    this.setUpProjectService.editingElementId.set(null);
    this.setUpProjectService.saveStructures();
  }
}
