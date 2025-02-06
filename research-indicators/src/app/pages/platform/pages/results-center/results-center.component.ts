import { Component } from '@angular/core';
import { IndicatorsTabFilterComponent } from './components/indicators-tab-filter/indicators-tab-filter.component';
import { TableFiltersSidebarComponent } from './components/table-filters-sidebar/table-filters-sidebar.component';
import { TableConfigurationComponent } from './components/table-configuration/table-configuration.component';
import { ResultsCenterTableComponent } from './components/results-center-table/results-center-table.component';

@Component({
  selector: 'app-results-center',
  standalone: true,
  imports: [IndicatorsTabFilterComponent, ResultsCenterTableComponent, TableFiltersSidebarComponent, TableConfigurationComponent],
  templateUrl: './results-center.component.html',
  styleUrls: ['./results-center.component.scss']
})
export default class ResultsCenterComponent {}
