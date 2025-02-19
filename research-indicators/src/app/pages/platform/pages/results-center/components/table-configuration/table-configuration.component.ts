import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderListModule } from 'primeng/orderlist';
import { signal } from '@angular/core';
import { ResultsCenterService } from '../../results-center.service';
import { TableColumn } from '../../result-center.interface';

const STORAGE_KEY = 'results-center-columns-order';

@Component({
    selector: 'app-table-configuration',
    imports: [CommonModule, OrderListModule],
    templateUrl: './table-configuration.component.html',
    styleUrls: ['./table-configuration.component.scss']
})
export class TableConfigurationComponent implements OnInit {
  private resultsCenterService = inject(ResultsCenterService);
  auxiliaryColumns = signal<TableColumn[]>([]);

  private reorderByReference(referenceArray: TableColumn[]) {
    this.resultsCenterService.tableColumns.update(currentColumns => {
      return [...currentColumns].sort((a, b) => {
        const aIndex = referenceArray.findIndex(ref => ref.field === a.field);
        const bIndex = referenceArray.findIndex(ref => ref.field === b.field);
        return aIndex - bIndex;
      });
    });
  }

  ngOnInit() {
    // Inicializar auxiliaryColumns con el orden actual
    this.auxiliaryColumns.set([...this.resultsCenterService.tableColumns()]);

    // Intentar cargar el orden guardado
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder) as Pick<TableColumn, 'field' | 'header' | 'path'>[];
        const currentColumns = this.resultsCenterService.tableColumns();

        // Verificar que todas las columnas actuales estén en el orden guardado
        const isValidOrder = currentColumns.every(col => parsedOrder.some(saved => saved.field === col.field));

        if (isValidOrder) {
          // Actualizar auxiliaryColumns con el orden guardado
          this.auxiliaryColumns.set(parsedOrder);
          // Reordenar tableColumns según el orden guardado
          this.reorderByReference(parsedOrder);
        }
      } catch (e) {
        console.error('Error loading saved configuration:', e);
      }
    }
  }

  applyConfigurations() {
    // Guardar el orden actual en localStorage
    const orderToSave = this.auxiliaryColumns().map(({ field, header }) => ({
      field,
      header
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orderToSave));

    // Reordenar tableColumns según el orden de auxiliaryColumns
    this.reorderByReference(this.auxiliaryColumns());
  }
}
