import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ResultsCenterService } from '../../results-center.service';

@Component({
  selector: 'app-results-center-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, MenuModule],
  templateUrl: './results-center-table.component.html',
  styleUrls: ['./results-center-table.component.scss']
})
export class ResultsCenterTableComponent {
  resultsCenterService = inject(ResultsCenterService);
  searchQuery = signal('');
  @ViewChild('dt2') dt2!: Table;

  menuItems: MenuItem[] = [
    { label: 'Edit', icon: 'pi pi-pencil' },
    { label: 'Delete', icon: 'pi pi-trash' },
    { label: 'Export', icon: 'pi pi-download' }
  ];

  applyFilterGlobal($event: Event, stringVal: string) {
    this.dt2.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  showFiltersSidebar() {
    this.resultsCenterService.showFiltersSidebar.set(true);
  }

  showConfiguratiosnSidebar() {
    this.resultsCenterService.showConfigurationsSidebar.set(true);
  }

  getIndicatorName(id: number): string {
    // TODO: Implement indicator name mapping
    return `Indicator ${id}`;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | undefined {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      SUBMITTED: 'info',
      ACCEPTED: 'success',
      EDITING: 'warning'
    };
    return severityMap[status];
  }
}
