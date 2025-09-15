import { Component, inject, OnInit, effect, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { SetUpProjectService } from '../../set-up-project.service';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TableIndicatorItemComponent } from '../table-indicator-item/table-indicator-item.component';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { IndicatorItem, IndicatorsStructure } from '../../../../../../shared/interfaces/get-structures.interface';
import { DriverjsService } from '@shared/services/driverjs.service';

@Component({
  selector: 'app-structure-table-view',
  imports: [TableModule, TagModule, ButtonModule, TableIndicatorItemComponent, TooltipModule, InputTextModule, FormsModule],
  templateUrl: './structure-table-view.component.html',
  styleUrl: './structure-table-view.component.scss'
})
export class StructureTableViewComponent implements OnInit {
  driverjs = inject(DriverjsService);
  setUpProjectService = inject(SetUpProjectService);
  expandedRowKeys: Record<string, boolean> = {};

  constructor() {
    // Effect para escuchar cambios en allStructuresExpanded
    effect(() => {
      // Referenciar el signal para que el effect se reactive
      this.setUpProjectService.allStructuresExpanded();
      this.updateExpandedRows();
    });
  }

  ngOnInit() {
    // Inicializar todas las filas como expandidas
    this.updateExpandedRows();
  }

  openStructureDetailModal = (structure: IndicatorsStructure) => {
    console.log(structure.custom_values);
    this.setUpProjectService.structureDetailModal.set({ show: true, structure, editingMode: true });
    this.setUpProjectService.structureDetailBody.set({
      code: structure.code,
      name: structure.name,
      custom_values: structure.custom_values.map(customValue => signal(customValue))
    });
  };

  updateExpandedRows() {
    this.expandedRowKeys = {};
    if (this.setUpProjectService.allStructuresExpanded()) {
      this.setUpProjectService.strcutureGrouped().forEach((item: IndicatorItem) => {
        if (item.representative?.code) {
          this.expandedRowKeys[item.representative.code] = true;
        }
      });
    }
  }

  addNewItem = (customer: IndicatorItem, toggleRowId: string) => {
    this.setUpProjectService.structures.update(structures => {
      const structure = structures.find(s => s.id === customer.representative?.id);
      if (structure?.items) {
        structure.items.push({ id: '', name: '', code: '', indicators: [], newItem: true, custom_values: [] });
      }
      return [...structures];
    });
    setTimeout(() => {
      const isExpanded = Boolean(Number(document.getElementById(toggleRowId)?.getAttribute('isExpanded')));
      if (!isExpanded) document.getElementById(toggleRowId)?.click();
    }, 100);
  };
  deleteStructure = (customer: IndicatorItem) => {
    this.setUpProjectService.structures.update(structures => {
      const structure = structures.find(s => s.id === customer.representative?.id);
      if (structure) {
        structures.splice(structures.indexOf(structure), 1);
      }
      return [...structures];
    });
    this.setUpProjectService.saveStructures();
  };

  deleteItem = (customer: IndicatorItem, toggleRowId: string) => {
    this.setUpProjectService.structures.update(structures => {
      const structure = structures.find(s => s.id === customer.representative?.id);
      if (structure) {
        structure.items?.splice(structure.items?.indexOf(customer) || 0, 1);
        if (!structure.items?.length) document.getElementById(toggleRowId)?.click();
      }
      return [...structures];
    });

    this.setUpProjectService.saveStructures();
  };
}
