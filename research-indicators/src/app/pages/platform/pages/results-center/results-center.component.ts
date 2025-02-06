import { Component, inject, signal } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { IndicatorsTabFilterComponent } from './components/indicators-tab-filter/indicators-tab-filter.component';
import { TableFiltersSidebarComponent } from './components/table-filters-sidebar/table-filters-sidebar.component';
import { TableConfigurationComponent } from './components/table-configuration/table-configuration.component';
import { ResultsCenterTableComponent } from './components/results-center-table/results-center-table.component';
import { ResultsCenterService } from './results-center.service';

@Component({
  selector: 'app-results-center',
  standalone: true,
  imports: [TabViewModule, IndicatorsTabFilterComponent, ResultsCenterTableComponent, TableFiltersSidebarComponent, TableConfigurationComponent],
  templateUrl: './results-center.component.html',
  styleUrls: ['./results-center.component.scss']
})
export default class ResultsCenterComponent {
  private resultsCenterService = inject(ResultsCenterService);
  activeTab = signal(0);

  onTabChange(index: number): void {
    this.activeTab.set(index);
    // TODO: Implementar filtro por My Results cuando index === 1
  }
}
