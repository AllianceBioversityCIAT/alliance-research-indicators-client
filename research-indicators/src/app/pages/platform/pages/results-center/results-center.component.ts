import { Component, inject, ViewChild, signal, OnInit } from '@angular/core';
import { TabMenu, TabMenuModule } from 'primeng/tabmenu';
import { IndicatorsTabFilterComponent } from './components/indicators-tab-filter/indicators-tab-filter.component';
import { TableFiltersSidebarComponent } from './components/table-filters-sidebar/table-filters-sidebar.component';
import { TableConfigurationComponent } from './components/table-configuration/table-configuration.component';
import { ResultsCenterTableComponent } from './components/results-center-table/results-center-table.component';
import { ResultsCenterService } from './results-center.service';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { SectionSidebarComponent } from '../../../../shared/components/section-sidebar/section-sidebar.component';
import { ApiService } from '../../../../shared/services/api.service';
@Component({
  selector: 'app-results-center',
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
export default class ResultsCenterComponent implements OnInit {
  api = inject(ApiService);
  resultsCenterService = inject(ResultsCenterService);
  cache = inject(CacheService);
  @ViewChild('tm') tm!: TabMenu;

  ngOnInit(): void {
    this.resultsCenterService.clearAllFilters();
  }

  showSignal = signal(false);

  toggleSidebar() {
    this.showSignal.update(value => !value);
  }

  applyFilters() {
    this.resultsCenterService.applyFilters();
  }
}
