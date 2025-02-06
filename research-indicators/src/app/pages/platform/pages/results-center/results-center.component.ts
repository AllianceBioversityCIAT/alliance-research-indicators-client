import { Component, inject } from '@angular/core';
import { TableFiltersSidebarComponent } from './components/table-filters-sidebar/table-filters-sidebar.component';
import { IndicatorsTabFilterComponent } from './components/indicators-tab-filter/indicators-tab-filter.component';
import { TableConfigurationComponent } from './components/table-configuration/table-configuration.component';
import { GetResultsService } from '../../../../shared/services/control-list/get-results.service';
import { ResultsCenterService } from './results-center.service';

@Component({
  selector: 'app-results-center',
  standalone: true,
  imports: [TableFiltersSidebarComponent, IndicatorsTabFilterComponent, TableConfigurationComponent],
  templateUrl: './results-center.component.html',
  styleUrl: './results-center.component.scss',
  providers: [
    {
      provide: GetResultsService,
      useClass: GetResultsService
    }
  ]
})
export default class ResultsCenterComponent {
  resultsCenterService = inject(ResultsCenterService);
}
