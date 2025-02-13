import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderListModule } from 'primeng/orderlist';
import { signal } from '@angular/core';
import { ResultsCenterService } from '../../results-center.service';
import { TableColumn } from '../../result-center.interface';
@Component({
  selector: 'app-table-configuration',
  standalone: true,
  imports: [CommonModule, OrderListModule],
  templateUrl: './table-configuration.component.html',
  styleUrls: ['./table-configuration.component.scss']
})
export class TableConfigurationComponent implements OnInit {
  resultsCenterService = inject(ResultsCenterService);

  filters = signal<TableColumn[]>([]);

  ngOnInit() {
    // Inicializar la copia local con los valores actuales
    this.filters.set([...this.resultsCenterService.tableColumns()]);
  }

  applyConfigurations() {
    // Actualizar la configuración real con la copia local
    this.resultsCenterService.tableColumns.set([...this.filters()]);
  }
}
