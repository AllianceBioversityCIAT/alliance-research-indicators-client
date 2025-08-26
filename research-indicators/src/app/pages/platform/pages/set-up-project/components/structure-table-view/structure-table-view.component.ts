import { Component, inject, OnInit, effect } from '@angular/core';
import { TableModule } from 'primeng/table';
import { SetUpProjectService } from '../../set-up-project.service';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TableIndicatorItemComponent } from '../table-indicator-item/table-indicator-item.component';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { IndicatorItem } from '../../../../../../shared/interfaces/get-structures.interface';
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
  level1NameInput = '';
  level1CodeInput = '';
  level2NameInput = '';
  level2CodeInput = '';
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

  changeEditingLevel1 = (customer: IndicatorItem) => {
    this.setUpProjectService.structures.update(structures => {
      const structure = structures.find(s => s.id === customer.representative?.id);
      if (structure) {
        structure.editing = !structure.editing;
        this.level1NameInput = structure.name;
        this.level1CodeInput = structure.code;
        if (structure.editing) this.setUpProjectService.editingFocus.set(true);
      }
      return [...structures];
    });
  };
  saveEditingLevel1 = (customer: IndicatorItem) => {
    if (!this.level1NameInput || !this.level1CodeInput) return;
    this.setUpProjectService.structures.update(structures => {
      const structure = structures.find(s => s.id === customer.representative?.id);
      if (structure) {
        structure.name = this.level1NameInput;
        structure.code = this.level1CodeInput;
        structure.editing = false;
        this.setUpProjectService.editingFocus.set(false);
      }
      return [...structures];
    });
    this.setUpProjectService.saveStructures();
    this.setUpProjectService.editingFocus.set(false);
    this.level1NameInput = '';
    this.level1CodeInput = '';
    this.driverjs.nextStep();
  };
  changeEditingLevel2 = (customer: IndicatorItem) => {
    this.setUpProjectService.structures.update(structures => {
      const item = structures.find(s => s.id === customer.representative?.id)?.items?.find(i => i.id === customer.id);
      if (item) {
        item.editing = !item.editing;
        this.level2NameInput = item.name;
        this.level2CodeInput = item.code;
        if (item.editing) this.setUpProjectService.editingFocus.set(true);
      }
      return [...structures];
    });
  };
  saveEditingLevel2 = (customer: IndicatorItem) => {
    if (!this.level2NameInput || !this.level2CodeInput) return;
    this.setUpProjectService.structures.update(structures => {
      const item = structures.find(s => s.id === customer.representative?.id)?.items?.find(i => i.id === customer.id);
      if (item) {
        item.name = this.level2NameInput;
        item.code = this.level2CodeInput;
        item.editing = false;
        this.setUpProjectService.editingFocus.set(false);
      }
      return [...structures];
    });
    this.setUpProjectService.saveStructures();
    this.setUpProjectService.editingFocus.set(false);
    this.level2NameInput = '';
    this.level2CodeInput = '';
  };

  addNewItem = (customer: IndicatorItem, toggleRowId: string) => {
    this.setUpProjectService.editingFocus.set(true);
    this.setUpProjectService.structures.update(structures => {
      const structure = structures.find(s => s.id === customer.representative?.id);
      if (structure?.items) {
        structure.items.push({ id: '', name: '', editing: true, code: '', indicators: [], newItem: true });
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
  cancelEditingLevel1 = (customer: IndicatorItem) => {
    this.setUpProjectService.structures.update(structures => {
      const structure = structures.find(s => s.id === customer.representative?.id);
      if (structure) {
        if (structure.newStructure) {
          // Si es nueva estructura, eliminarla completamente
          const index = structures.indexOf(structure);
          structures.splice(index, 1);
        } else {
          // Si es estructura existente, solo cancelar edición
          structure.editing = false;
        }
        this.setUpProjectService.editingFocus.set(false);
      }
      return [...structures];
    });
    this.cleanInputs();
    this.driverjs.nextStep();
  };
  cancelEditingLevel2 = (customer: IndicatorItem) => {
    this.setUpProjectService.structures.update(structures => {
      const structure = structures.find(s => s.id === customer.representative?.id);
      const item = structure?.items?.find(i => i.id === customer.id);
      if (item && structure) {
        if (item.newItem) {
          // Si es nuevo item, eliminarlo completamente
          const index = structure.items?.indexOf(item) || 0;
          structure.items?.splice(index, 1);
        } else {
          // Si es item existente, solo cancelar edición
          item.editing = false;
        }
        this.setUpProjectService.editingFocus.set(false);
      }
      return [...structures];
    });
    this.cleanInputs();
  };

  cleanInputs = () => {
    this.level1NameInput = '';
    this.level1CodeInput = '';
    this.level2NameInput = '';
    this.level2CodeInput = '';
  };
}
