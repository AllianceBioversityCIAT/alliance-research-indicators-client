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
import { MultiselectComponent } from '../../../../shared/components/custom-fields/multiselect/multiselect.component';
@Injectable({
  providedIn: 'root'
})
export class ResultsCenterService {
  api = inject(ApiService);
  hasFilters = signal(false);
  showFiltersSidebar = signal(false);
  showConfigurationSidebar = signal(false);
  multiselectRefs = signal<Record<string, MultiselectComponent>>({});
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
      minWidth: 'min-w-[200px]',
      maxWidth: 'max-w-[300px]',
      filter: true,
      getValue: (result: Result) => {
        const title = result.title;
        if (!title || typeof title !== 'string') return title;
        let end = title.length;
        while (end > 0 && title[end - 1] === '-') end--;
        return title.slice(0, end);
      }
    },
    {
      field: 'indicator_id',
      path: 'indicators.name',
      header: 'Indicator',
      hideIf: computed(() =>
        this.api.indicatorTabs
          .lazy()
          .list()
          .some((indicator: GetAllIndicators) => indicator.active === true && indicator.indicator_id !== 0)
      ),
      getValue: (result: Result) => result.indicators?.name ?? '-'
    },
    {
      field: 'status',
      path: 'result_status.name',
      header: 'Status',
      maxWidth: 'max-w-[100px]',
      getValue: (result: Result) => result.result_status?.name ?? '-'
    },
    {
      field: 'project',
      path: 'result_contracts.contract_id',
      header: 'Reporting Project',
      maxWidth: 'max-w-[110px]',
      getValue: (result: Result) => result.result_contracts?.contract_id ?? '-'
    },
    {
      field: 'lever',
      path: 'result_levers.lever.short_name',
      header: 'Primary Lever',
      maxWidth: 'max-w-[100px]',
      getValue: (result: Result) => result.result_levers?.lever?.short_name ?? '-'
    },
    {
      field: 'year',
      path: 'report_year_id',
      header: 'Live Version',
      maxWidth: 'max-w-[100px]',
      getValue: (result: Result) => result.report_year_id?.toString() ?? '-'
    },
    {
      field: 'versions',
      path: 'snapshot_years',
      maxWidth: 'max-w-[120px]',
      header: 'Approved Versions',
      getValue: (result: Result) => (Array.isArray(result.snapshot_years) ? result.snapshot_years : [])
    },
    {
      field: 'creator',
      path: 'created_by_user.first_name',
      header: 'Creator',
      minWidth: 'min-w-[90px]',
      hideFilterIf: computed(() => (this.resultsFilter()['create-user-codes'] ?? []).length > 0),
      filter: true,
      getValue: (result: Result) => (result.created_by_user ? `${result.created_by_user.first_name} ${result.created_by_user.last_name}` : '-')
    },
    {
      field: 'creation_date',
      path: 'created_at',
      header: 'Creation Date',
      minWidth: 'min-w-[100px]',

      getValue: (result: Result) => (result.created_at ? new Date(result.created_at).toLocaleDateString() : '-')
    }
  ]);

  getAllPathsAsArray = computed(() =>
    this.tableColumns()
      .filter(column => column.filter)
      .map(column => column.path)
  );

  resultsFilter = signal<ResultFilter>({ 'indicator-codes': [], 'lever-codes': [], 'create-user-codes': [] });
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

  getActiveFilters = computed(() => {
    const filters: { label: string }[] = [];
    const activeFilters = this.resultsFilter();

    if ((activeFilters['indicator-codes-filter'] ?? []).length > 0) {
      filters.push({ label: 'INDICATOR' });
    }

    if ((activeFilters['status-codes'] ?? []).length > 0) {
      filters.push({ label: 'STATUS' });
    }

    if ((activeFilters['contract-codes'] ?? []).length > 0) {
      filters.push({ label: 'PROJECT' });
    }

    if ((activeFilters['lever-codes'] ?? []).length > 0) {
      filters.push({ label: 'LEVER' });
    }

    if ((activeFilters['years'] ?? []).length > 0) {
      filters.push({ label: 'YEAR' });
    }

    return filters;
  });

  countFiltersSelected = computed(() => {
    const activeFilters = Object.entries(this.resultsFilter()).filter(
      ([key, arr]) => !['create-user-codes', 'indicator-codes-tabs'].includes(key) && Array.isArray(arr) && arr.length > 0
    ).length;
    const totalFilters = activeFilters;
    return totalFilters > 0 ? totalFilters.toString() : undefined;
  });

  onChangeList = effect(
    () => {
      if (!this.api.indicatorTabs.lazy().isLoading()) {
        this.api.indicatorTabs.lazy().list.update(prev => {
          return [
            {
              name: 'All Indicators',
              indicator_id: 0,
              able: true,
              active: true
            },
            ...prev.map(indicator => ({
              ...indicator,
              able: [0, 1, 2, 4, 5].includes(indicator.indicator_id)
            }))
          ];
        });
        this.onChangeList.destroy();
      }
    },
    {
      allowSignalWrites: true
    }
  );

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | undefined {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      SUBMITTED: 'info',
      ACCEPTED: 'success',
      EDITING: 'warning'
    };
    return severityMap[status];
  }

  async main() {
    this.loading.set(true);
    try {
      const response = await this.getResultsService.getInstance(this.resultsFilter(), this.resultsConfig());
      this.list.set(response());
    } catch (error) {
      console.error('Error loading results:', error);
      this.list.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  onActiveItemChange = (event: MenuItem): void => {
    this.myResultsFilterItem.set(event);

    this.searchInput.set('');
    this.tableFilters.set(new TableFilters());

    this.resultsFilter.update(() => ({
      'create-user-codes': event.id === 'my' ? [this.cache.dataCache().user.sec_user_id.toString()] : [],
      'indicator-codes': [],
      'status-codes': [],
      'contract-codes': [],
      'lever-codes': [],
      years: [],
      'indicator-codes-filter': [],
      'indicator-codes-tabs': []
    }));

    this.onSelectFilterTab(0);
    this.cleanMultiselects();

    const table = this.tableRef();
    if (table) {
      table.clear();
      table.sortField = 'result_official_code';
      table.sortOrder = -1;
      table.first = 0;
    }

    // Cargar datos manualmente
    this.main();
  };

  showFilterSidebar(): void {
    this.showFiltersSidebar.set(true);
  }

  showConfigSidebar(): void {
    this.showConfigurationsSidebar.set(true);
  }

  applyFilters = () => {
    const currentTableFilters = this.tableFilters();

    if (!currentTableFilters) {
      return;
    }

    this.resultsFilter.update(prev => ({
      ...prev,
      'lever-codes': (currentTableFilters.levers || []).map((lever: GetLevers) => lever.id),
      'status-codes': (currentTableFilters.statusCodes || []).map((status: GetAllResultStatus) => status.result_status_id),
      years: (currentTableFilters.years || []).map((year: { id: number; name: string }) => year.id),
      'contract-codes': (currentTableFilters.contracts || []).map((contract: GetContracts) => contract.agreement_id),
      'indicator-codes-filter': (currentTableFilters.indicators || []).map((indicator: GetAllIndicators) => indicator.indicator_id)
    }));

    // Cargar datos manualmente después de aplicar filtros
    this.main();
  };

  onSelectFilterTab(indicatorId: number) {
    this.api.indicatorTabs.lazy().list.update(prev =>
      prev.map((item: GetAllIndicators) => ({
        ...item,
        active: item.indicator_id === indicatorId
      }))
    );
    this.resultsFilter.update(prev => ({
      ...prev,
      'indicator-codes-tabs': indicatorId === 0 ? [] : [indicatorId],
      'indicator-codes-filter': []
    }));
    this.tableFilters.update(prev => ({
      ...prev,
      indicators: []
    }));
  }

  cleanFilters() {
    this.cleanMultiselects();

    this.tableFilters.set(new TableFilters());

    this.searchInput.set('');

    const table = this.tableRef();
    if (table) {
      table.clear();
      table.sortField = 'result_official_code';
      table.sortOrder = -1;
    }
  }

  clearAllFilters() {
    this.cleanMultiselects();

    this.tableFilters.set(new TableFilters());

    this.searchInput.set('');

    const table = this.tableRef();
    if (table) {
      table.clear();
      table.sortField = 'result_official_code';
      table.sortOrder = -1;
    }

    this.onSelectFilterTab(0);
  }

  cleanMultiselects() {
    const refs = this.multiselectRefs();
    Object.values(refs).forEach(multiselect => {
      if (multiselect && typeof multiselect.clear === 'function') {
        multiselect.clear();
      }
    });
  }

  resetState() {
    this.clearAllFilters();
    this.list.set([]);
    this.loading.set(true);
    this.showFiltersSidebar.set(false);
    this.showConfigurationSidebar.set(false);
    this.multiselectRefs.set({});
    this.myResultsFilterItem.set(this.myResultsFilterItems[0]);
  }
}
