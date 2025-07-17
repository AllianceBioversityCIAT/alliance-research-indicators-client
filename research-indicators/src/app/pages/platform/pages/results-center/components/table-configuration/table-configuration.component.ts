import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderListModule } from 'primeng/orderlist';
import { ResultsCenterService } from '../../results-center.service';
import { TableColumn } from '../../result-center.interface';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';

const STORAGE_KEY = 'results-center-columns-order';

@Component({
  selector: 'app-table-configuration',
  imports: [CommonModule, OrderListModule, CdkDropList, CdkDrag],
  templateUrl: './table-configuration.component.html',
  styleUrls: ['./table-configuration.component.scss']
})
export class TableConfigurationComponent implements OnInit {
  private readonly resultsCenterService = inject(ResultsCenterService);
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
    // Initialize auxiliaryColumns with the current order
    this.auxiliaryColumns.set([...this.resultsCenterService.tableColumns()]);

    // Try to load the saved order
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder) as Pick<TableColumn, 'field' | 'header' | 'path'>[];
        const currentColumns = this.resultsCenterService.tableColumns();

        // Verify that all current columns are in the saved order
        const isValidOrder = currentColumns.every(col => parsedOrder.some(saved => saved.field === col.field));

        if (isValidOrder) {
          // Update auxiliaryColumns with the saved order
          this.auxiliaryColumns.set(parsedOrder);
          // Reorder tableColumns according to the saved order
          this.reorderByReference(parsedOrder);
        }
      } catch (e) {
        console.error('Error loading saved configuration:', e);
      }
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.auxiliaryColumns(), event.previousIndex, event.currentIndex);
  }

  applyConfigurations() {
    // Save the current order in localStorage
    const orderToSave = this.auxiliaryColumns().map(({ field, header }) => ({
      field,
      header
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orderToSave));

    // Reorder tableColumns according to the order of auxiliaryColumns
    this.reorderByReference(this.auxiliaryColumns());
  }
}
