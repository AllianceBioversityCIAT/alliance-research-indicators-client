import { Component, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { SetUpProjectService } from '../../set-up-project.service';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TableIndicatorItemComponent } from '../table-indicator-item/table-indicator-item.component';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-structure-table-view',
  imports: [TableModule, TagModule, ButtonModule, TableIndicatorItemComponent, TooltipModule, InputTextModule, FormsModule],
  templateUrl: './structure-table-view.component.html',
  styleUrl: './structure-table-view.component.scss'
})
export class StructureTableViewComponent {
  setUpProjectService = inject(SetUpProjectService);
  nameInput = '';
  changeEditingLevel1 = (customer: any) => {
    this.setUpProjectService.structures.update(structures => {
      const structure = structures.find(s => s.id === customer.representative.id);
      if (structure) {
        structure.editing = !structure.editing;
        this.nameInput = structure.name;
      }
      return [...structures];
    });
  };
  saveEditingLevel1 = (customer: any) => {
    this.setUpProjectService.structures.update(structures => {
      const structure = structures.find(s => s.id === customer.representative.id);
      if (structure) {
        structure.name = this.nameInput;
        structure.editing = false;
      }
      return [...structures];
    });
  };
}
