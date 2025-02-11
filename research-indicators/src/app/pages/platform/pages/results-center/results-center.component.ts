import { Component, inject, Input, signal } from '@angular/core';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { IndicatorsTabFilterComponent } from './components/indicators-tab-filter/indicators-tab-filter.component';
import { TableFiltersSidebarComponent } from './components/table-filters-sidebar/table-filters-sidebar.component';
import { TableConfigurationComponent } from './components/table-configuration/table-configuration.component';
import { ResultsCenterTableComponent } from './components/results-center-table/results-center-table.component';
import { ResultsCenterService } from './results-center.service';
import { SectionSidebarComponent } from '../../../../shared/components/section-sidebar/section-sidebar.component';

@Component({
  selector: 'app-results-center',
  standalone: true,
  imports: [
    TabMenuModule,
    IndicatorsTabFilterComponent,
    ResultsCenterTableComponent,
    TableFiltersSidebarComponent,
    TableConfigurationComponent,
    SectionSidebarComponent
  ],
  templateUrl: './results-center.component.html',
  styleUrls: ['./results-center.component.scss']
})
export default class ResultsCenterComponent {
  @Input() showSignal = signal(false);

  resultsCenterService = inject(ResultsCenterService);

  activeItem = signal<MenuItem | undefined>(undefined);
  items: MenuItem[] = [
    { label: 'All Results', command: () => this.onTabChange('all') },
    { label: 'My Results', command: () => this.onTabChange('my') }
  ];

  constructor() {
    this.activeItem.set(this.items[0]);
  }

  onTabChange(type: 'all' | 'my'): void {
    // TODO: Implementar filtro por My Results
  }

  toggleSidebar() {
    this.showSignal.update(prev => !prev);
  }

  applyFilters() {
    this.resultsCenterService.applyFilters();
  }
}
