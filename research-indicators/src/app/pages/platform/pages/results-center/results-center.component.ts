import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { IndicatorsTabFilterComponent } from './components/indicators-tab-filter/indicators-tab-filter.component';
import { TableFiltersSidebarComponent } from './components/table-filters-sidebar/table-filters-sidebar.component';
import { TableConfigurationComponent } from './components/table-configuration/table-configuration.component';
import { ResultsCenterTableComponent } from './components/results-center-table/results-center-table.component';
import { ResultsCenterService } from './results-center.service';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { SectionSidebarComponent } from '../../../../shared/components/section-sidebar/section-sidebar.component';
import { ApiService } from '../../../../shared/services/api.service';
import { ActionsService } from '../../../../shared/services/actions.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-results-center',
  imports: [
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
  actions = inject(ActionsService);

  // Pin functionality
  pinnedTab = signal<string>('all');
  loadingPin = signal(false);
  tableId = 'result-table';

  orderedFilterItems = computed(() => {
    const pinnedTab = this.pinnedTab();
    if (pinnedTab === 'my') {
      return [
        {
          id: 'my',
          label: 'My Results'
        },
        {
          id: 'all',
          label: 'All Results'
        }
      ];
    } else {
      return [
        {
          id: 'all',
          label: 'All Results'
        },
        {
          id: 'my',
          label: 'My Results'
        }
      ];
    }
  });

  ngOnInit(): void {
    this.resultsCenterService.resetState();
    this.loadPinnedTab();
  }

  showSignal = signal(false);

  toggleSidebar() {
    this.showSignal.update(value => !value);
  }

  applyFilters() {
    this.resultsCenterService.applyFilters();
  }

  // Pin functionality methods
  async loadPinnedTab() {
    this.loadingPin.set(true);
    const response = await this.api.GET_Configuration(this.tableId, 'tab');
    if (response?.data) {
      const pinValue = response.data as unknown as { all: string; self: string };

      const allPinned = pinValue.all === '1';
      const selfPinned = pinValue.self === '1';

      if (allPinned) {
        this.pinnedTab.set('all');
        this.resultsCenterService.myResultsFilterItem.set(this.resultsCenterService.myResultsFilterItems[0]);
        this.loadAllResults();
      } else if (selfPinned) {
        this.pinnedTab.set('my');
        this.resultsCenterService.myResultsFilterItem.set(this.resultsCenterService.myResultsFilterItems[1]);
        this.loadMyResults();
      } else {
        this.loadAllResults();
      }
    } else {
      this.pinnedTab.set('all');
      this.resultsCenterService.myResultsFilterItem.set(this.resultsCenterService.myResultsFilterItems[0]);
      this.loadAllResults();
    }
    this.loadingPin.set(false);
  }

  onActiveItemChange = (event: MenuItem): void => {
    this.resultsCenterService.myResultsFilterItem.set(event);
    this.resultsCenterService.clearAllFilters();
    if (event.id === 'my') {
      this.loadMyResults();
    } else {
      this.loadAllResults();
    }
  };

  loadMyResults() {
    this.resultsCenterService.resultsFilter.update(() => ({
      'create-user-codes': [this.cache.dataCache().user.sec_user_id.toString()],
      'indicator-codes': [],
      'status-codes': [],
      'contract-codes': [],
      'lever-codes': [],
      years: [],
      'indicator-codes-filter': [],
      'indicator-codes-tabs': []
    }));
    this.resultsCenterService.main();
  }

  loadAllResults() {
    this.resultsCenterService.resultsFilter.update(() => ({
      'create-user-codes': [],
      'indicator-codes': [],
      'status-codes': [],
      'contract-codes': [],
      'lever-codes': [],
      years: [],
      'indicator-codes-filter': [],
      'indicator-codes-tabs': []
    }));
    this.resultsCenterService.main();
  }

  async togglePin(tabId: string) {
    try {
      this.loadingPin.set(true);
      const newPinnedTab = this.pinnedTab() === tabId ? 'all' : tabId;
      const pinValue = newPinnedTab === 'all' ? { all: true, self: false } : { all: false, self: true };

      await this.api.PATCH_Configuration(this.tableId, 'tab', pinValue);
      this.pinnedTab.set(newPinnedTab);

      if (newPinnedTab === 'all') {
        this.resultsCenterService.myResultsFilterItem.set(this.resultsCenterService.myResultsFilterItems[0]);
      } else {
        this.resultsCenterService.myResultsFilterItem.set(this.resultsCenterService.myResultsFilterItems[1]);
      }

      setTimeout(() => {
        this.resultsCenterService.cleanMultiselects();
      }, 0);
    } catch (error) {
      console.error('Error updating pinned tab:', error);
    } finally {
      this.actions.showToast({
        severity: 'success',
        summary: 'Results',
        detail: `${tabId === 'all' ? 'All Results' : 'My Results'} tab pinned successfully`
      });
      this.loadingPin.set(false);
      this.loadPinnedTab();
    }
  }

  isPinned(tabId: string): boolean {
    return this.pinnedTab() === tabId;
  }

  onPinIconClick(tabId: string, event: Event) {
    event.stopPropagation();
    this.togglePin(tabId);
  }
}
