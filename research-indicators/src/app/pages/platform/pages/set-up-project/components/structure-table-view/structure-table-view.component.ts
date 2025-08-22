import { Component, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { SetUpProjectService } from '../../set-up-project.service';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TableIndicatorItemComponent } from '../table-indicator-item/table-indicator-item.component';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { IndicatorItem, IndicatorsStructure } from '../../../../../../shared/interfaces/get-structures.interface';

@Component({
  selector: 'app-structure-table-view',
  imports: [TableModule, TagModule, ButtonModule, TableIndicatorItemComponent, TooltipModule, InputTextModule, FormsModule],
  templateUrl: './structure-table-view.component.html',
  styleUrl: './structure-table-view.component.scss'
})
export class StructureTableViewComponent {
  setUpProjectService = inject(SetUpProjectService);
  level1NameInput = '';
  level2NameInput = '';
  changeEditingLevel1 = (customer: IndicatorItem) => {
    this.setUpProjectService.structures.update(structures => {
      const structure = structures.find(s => s.id === customer.representative.id);
      if (structure) {
        structure.editing = !structure.editing;
        this.level1NameInput = structure.name;
      }
      return [...structures];
    });
  };
  saveEditingLevel1 = (customer: IndicatorItem) => {
    this.setUpProjectService.structures.update(structures => {
      const structure = structures.find(s => s.id === customer.representative.id);
      if (structure) {
        structure.name = this.level1NameInput;
        structure.editing = false;
      }
      return [...structures];
    });
    this.setUpProjectService.saveStructures();
  };
  changeEditingLevel2 = (customer: IndicatorItem) => {
    this.setUpProjectService.structures.update(structures => {
      const item = structures.find(s => s.id === customer.representative.id)?.items?.find(i => i.id === customer.id);
      if (item) {
        item.editing = !item.editing;
        this.level2NameInput = item.name;
      }
      return [...structures];
    });
  };
  saveEditingLevel2 = (customer: IndicatorItem) => {
    this.setUpProjectService.structures.update(structures => {
      const item = structures.find(s => s.id === customer.representative.id)?.items?.find(i => i.id === customer.id);
      if (item) {
        item.name = this.level2NameInput;
        item.editing = false;
      }
      return [...structures];
    });
    this.setUpProjectService.saveStructures();
  };
}
