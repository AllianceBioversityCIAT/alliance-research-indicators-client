import { inject, Injectable, signal, effect, computed } from '@angular/core';
import { GetResultsService } from '../../../../shared/services/control-list/get-results.service';
import { Result, ResultConfig, ResultFilter } from '../../../../shared/interfaces/result/result.interface';
import { MenuItem } from 'primeng/api';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { TableColumn } from './result-center.interface';
import { TableFilters } from './class/table.filters.class';
import { GetLevers } from '../../../../shared/interfaces/get-levers.interface';
import { GetAllResultStatus } from '../../../../shared/interfaces/get-all-result-status.interface';
import { GetContracts } from '../../../../shared/interfaces/get-contracts.interface';
import { GetAllIndicators } from '../../../../shared/interfaces/get-all-indicators.interface';
import { Table } from 'primeng/table';
import { ApiService } from '../../../../shared/services/api.service';
@Injectable({
  providedIn: 'root'
})
export class ResultsCenterService {
  api = inject(ApiService);
  hasFilters = signal(false);
  showFiltersSidebar = signal(false);
  showConfigurationSidebar = signal(false);
  myResultsFilterItems: MenuItem[] = [
    { id: 'all', label: 'All Results' },
    { id: 'my', label: 'My Results' }
  ];
  myResultsFilterItem = signal<MenuItem | undefined>(this.myResultsFilterItems[0]);
  loading = signal(false);
  list = signal<Result[]>([]);
  tableFilters = signal(new TableFilters());
  searchInput = signal('');
  tableColumns = signal<TableColumn[]>([
    {
      field: 'result_official_code',
      path: 'result_official_code',
      header: 'Code',
      filter: true,
      getValue: (result: Result) => result.result_official_code
    },
    {
      field: 'title',
      path: 'title',
      header: 'Title',
      filter: true,
      getValue: (result: Result) => result.title
    },
    {
      field: 'indicator_id',
      path: 'indicators.name',
      header: 'Indicator',
      hideIf: computed(() =>
        this.api.indicatorTabs.list().some((indicator: GetAllIndicators) => indicator.active === true && indicator.indicator_id !== 0)
      ),
      getValue: (result: Result) => result.indicators?.name || '-'
    },
    {
      field: 'status',
      path: 'result_status.name',
      header: 'Status',
      getValue: (result: Result) => result.result_status?.name || '-'
    },
    {
      field: 'project',
      path: 'result_contracts.contract_id',
      header: 'Project',
      getValue: (result: Result) => result.result_contracts?.contract_id || '-'
    },
    {
      field: 'lever',
      path: 'result_levers.lever.short_name',
      header: 'Lever',
      getValue: (result: Result) => result.result_levers?.lever?.short_name || '-'
    },
    {
      field: 'year',
      path: 'report_year_id',
      header: 'Year',
      getValue: (result: Result) => result.report_year_id?.toString() || '-'
    },
    {
      field: 'creator',
      path: 'created_by_user.first_name',
      header: 'Creator',
      filter: true,
      getValue: (result: Result) => (result.created_by_user ? `${result.created_by_user.first_name} ${result.created_by_user.last_name}` : '-')
    },
    {
      field: 'creation_date',
      path: 'created_at',
      header: 'Creation date',
      getValue: (result: Result) => (result.created_at ? new Date(result.created_at).toLocaleDateString() : '-')
    }
  ]);

  getAllPathsAsArray = computed(() =>
    this.tableColumns()
      .filter(column => column.filter)
      .map(column => column.path)
  );

  resultsFilter = signal<ResultFilter>({ 'indicator-codes': [], 'lever-codes': [] });
  resultsConfig = signal<ResultConfig>({
    indicators: true,
    'result-status': true,
    contracts: true,
    'primary-contract': true,
    'primary-lever': true,
    levers: true,
    'audit-data': true,
    'audit-data-object': true
  });
  showConfigurationsSidebar = signal(false);
  confirmFiltersSignal = signal(false);

  getResultsService = inject(GetResultsService);
  cache = inject(CacheService);

  tableRef = signal<Table | undefined>(undefined);

  onChangeFilters = effect(
    async () => {
      this.loading.set(true);
      const response = await this.getResultsService.getInstance(this.resultsFilter(), this.resultsConfig());
      this.list.set(response());
      this.loading.set(false);
    },
    {
      allowSignalWrites: true
    }
  );

  constructor() {
    this.mapAllIndicators();
  }

  countFiltersSelected = computed(() => {
    const activeFilters = Object.values(this.resultsFilter()).filter(arr => Array.isArray(arr) && arr.length > 0).length;
    const searchFilterActive = this.searchInput().length > 0 ? 1 : 0;
    const totalFilters = activeFilters + searchFilterActive;
    return totalFilters > 0 ? totalFilters.toString() : undefined;
  });

  async mapAllIndicators() {
    this.api.indicatorTabs.list.update(prev => [
      {
        name: 'All Indicators',
        indicator_id: 0,
        active: true
      },
      ...prev
    ]);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | undefined {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      SUBMITTED: 'info',
      ACCEPTED: 'success',
      EDITING: 'warning'
    };
    return severityMap[status];
  }

  onActiveItemChange = (event: MenuItem): void => {
    this.myResultsFilterItem.set(event);
    return this.resultsFilter.update(prev => ({
      ...prev,
      'create-user-codes': event.id === 'my' ? [this.cache.dataCache().user.sec_user_id.toString()] : []
    }));
  };

  showFilterSidebar(): void {
    this.showFiltersSidebar.set(true);
  }

  showConfigSidebar(): void {
    this.showConfigurationsSidebar.set(true);
  }

  applyFilters = () => {
    this.resultsFilter.update(prev => ({
      ...prev,
      'lever-codes': this.tableFilters().levers.map((lever: GetLevers) => lever.id),
      'status-codes': this.tableFilters().statusCodes.map((status: GetAllResultStatus) => status.result_status_id),
      years: this.tableFilters().years.map((year: { id: number; name: string }) => year.id),
      'contract-codes': this.tableFilters().contracts.map((contract: GetContracts) => contract.agreement_id),
      'indicator-codes-filter': this.tableFilters().indicators.map((indicator: GetAllIndicators) => indicator.indicator_id)
    }));
  };

  onSelectFilterTab(indicatorId: number) {
    this.api.indicatorTabs.list.update(prev =>
      prev.map((item: GetAllIndicators) => ({
        ...item,
        active: item.indicator_id === indicatorId
      }))
    );
    this.resultsFilter.update(prev => ({
      ...prev,
      'indicator-codes-tabs': indicatorId === 0 ? [] : [indicatorId]
    }));
    this.resultsFilter()['indicator-codes-filter'] = [];
    this.tableFilters.update(prev => ({
      ...prev,
      indicators: []
    }));
  }

  clearAllFilters() {
    //? Clear all filters and apply them again
    this.tableFilters.set(new TableFilters());
    this.applyFilters();
    //? clear search input
    this.searchInput.set('');
    //? clear table filters and reset sort
    const table = this.tableRef();
    if (table) {
      table.clear();
      table.sortField = 'result_official_code';
      table.sortOrder = -1;
    }
    //? clear indicators tab filter, keeping first one active
    this.onSelectFilterTab(0);
    //? clear my results filter item
    this.myResultsFilterItem.set(this.myResultsFilterItems[0]);
  }
}
