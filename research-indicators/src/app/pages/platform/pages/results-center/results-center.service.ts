import { inject, Injectable, signal, effect, computed } from '@angular/core';
import { GetResultsService } from '../../../../shared/services/control-list/get-results.service';
import { Result, ResultConfig, ResultFilter } from '../../../../shared/interfaces/result/result.interface';
import { MenuItem } from 'primeng/api';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { TableColumn } from './result-center.interface';
import { TableFilters } from './class/table.filters.class';
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
  appliedFilters = signal<ResultFilter>({ 'indicator-codes': [], 'lever-codes': [], 'create-user-codes': [] });
  searchInput = signal('');
  tableColumns = signal<TableColumn[]>([
    {
      field: 'result_platform',
      path: 'platform_code',
      header: 'Platform',
      maxWidth: 'max-w-[80px]',
      filter: true,
      hideIf: () => true,
      getValue: (result: Result) => result.result_platform
    },
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
      minWidth: 'min-w-[165px]',
      maxWidth: 'max-w-[165px]',
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
      minWidth: 'min-w-[155px]',
      maxWidth: 'max-w-[155px]',
      getValue: (result: Result) => result.result_status?.name ?? '-'
    },
    {
      field: 'project',
      path: 'result_contracts.contract_id',
      header: 'Reporting Project',
      maxWidth: 'max-w-[110px]',
      getValue: (result: Result) => {
        if (!result.result_contracts) return '-';
        const contracts = Array.isArray(result.result_contracts) ? result.result_contracts : [result.result_contracts];
        const primaryContract = contracts.find((contract: { is_primary?: number | string; contract_id?: string }) => 
          Number(contract.is_primary) === 1
        );
        return primaryContract?.contract_id ?? '-';
      }
    },
    {
      field: 'lever',
      path: 'primaryLeverSort',
      header: 'Primary Lever',
      maxWidth: 'max-w-[100px]',
      getValue: (result: Result) => {
        if (!result.result_levers || !Array.isArray(result.result_levers)) return '-';
        const primaryLevers = result.result_levers.filter(rl => rl.is_primary === 1);
        if (primaryLevers.length === 0) return '-';
        return primaryLevers.map(rl => rl.lever?.short_name).filter(Boolean).join(', ');
      }
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
      minWidth: 'min-w-[110px]',
      maxWidth: 'max-w-[110px]',

      getValue: (result: Result) => (result.created_at ? new Date(result.created_at).toLocaleDateString() : '-')
    }
  ]);

  getAllPathsAsArray = computed(() =>
    this.tableColumns()
      .filter(column => column.filter)
      .map(column => column.path)
  );

  resultsFilter = signal<ResultFilter>({ 'indicator-codes': [], 'lever-codes': [], 'create-user-codes': [] });
  primaryContractId = signal<string | null>(null);
  resultsConfig = signal<ResultConfig>({
    indicators: true,
    'result-status': true,
    contracts: true,
    'primary-contract': false,
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
    const filters: { label: string; value: string; id?: string | number }[] = [];
    const active = this.appliedFilters();

    if ((active['indicator-codes-tabs'] ?? []).length > 0) {
      filters.push({ label: 'INDICATOR TAB', value: 'Selected' });
    }

    if ((active['indicator-codes-filter'] ?? []).length > 0) {
      const selected = this.tableFilters().indicators as { indicator_id: number; name: string }[];
      selected.forEach(i => {
        if (i) filters.push({ label: 'INDICATOR', value: i.name ?? '', id: i.indicator_id });
      });
    }

    if ((active['status-codes'] ?? []).length > 0) {
      const selected = this.tableFilters().statusCodes as { result_status_id: number; name: string }[];
      selected.forEach(s => {
        if (s) filters.push({ label: 'STATUS', value: s.name ?? '', id: s.result_status_id });
      });
    }

    if ((active['contract-codes'] ?? []).length > 0) {
      const selected = this.tableFilters().contracts as { agreement_id: string; display_label?: string }[];
      selected.forEach(c => {
        if (c) filters.push({ label: 'PROJECT', value: c.display_label || c.agreement_id, id: c.agreement_id });
      });
    }

    if ((active['lever-codes'] ?? []).length > 0) {
      const selected = this.tableFilters().levers as { id: number; name?: string; short_name?: string }[];
      selected.forEach(l => {
        if (l) filters.push({ label: 'LEVER', value: l.short_name || l.name || '', id: l.id });
      });
    }

    if ((active['years'] ?? []).length > 0) {
      const selected = this.tableFilters().years;
      selected.forEach(y => {
        if (y) filters.push({ label: 'YEAR', value: String(y.report_year), id: y.report_year });
      });
    }

    return filters;
  });

  removeFilter(label: string, id?: string | number): void {
    if (label === 'INDICATOR TAB') {
      this.onSelectFilterTab(0);
      return;
    }

    type Updater = (state: TableFilters) => void;
    const mkUpdater =
      <T>(key: keyof TableFilters, pred: (item: T) => boolean): Updater =>
      (state: TableFilters) => {
        const arr = (state[key] as unknown as T[]) ?? [];
        (state as unknown as Record<string, unknown[]>)[key as string] = id != null ? arr.filter(pred) : [];
      };

    const map: Record<string, { update: Updater; ref?: keyof Record<string, MultiselectComponent>; key: keyof TableFilters }> = {
      INDICATOR: { update: mkUpdater<{ indicator_id: number }>('indicators', i => i?.indicator_id !== id), ref: 'indicator', key: 'indicators' },
      STATUS: { update: mkUpdater<{ result_status_id: number }>('statusCodes', s => s?.result_status_id !== id), ref: 'status', key: 'statusCodes' },
      PROJECT: { update: mkUpdater<{ agreement_id: string }>('contracts', c => c?.agreement_id !== id), ref: 'project', key: 'contracts' },
      LEVER: { update: mkUpdater<{ id: number }>('levers', l => l?.id !== id), ref: 'lever', key: 'levers' },
      YEAR: { update: mkUpdater<{ report_year: number }>('years', y => y?.report_year !== id), ref: 'year', key: 'years' }
    };

    const handler = map[label];
    if (!handler) return;

    const currentState = this.tableFilters();
    const currentArray = (currentState[handler.key] as unknown[]) ?? [];
    const willBeEmpty = id != null ? currentArray.length === 1 : true;

    this.tableFilters.update(prev => {
      const next = { ...prev } as TableFilters;
      handler.update(next);
      return next;
    });

    const ref = handler.ref ? this.multiselectRefs()?.[handler.ref] : undefined;
    if (ref) {
      if (willBeEmpty || id == null) {
        if (typeof ref.clear === 'function') {
          ref.clear();
        }
      } else if (id != null && typeof ref.removeById === 'function') {
        ref.removeById(id);
      }
    }

    this.applyFilters();
  }

  countFiltersSelected = computed(() => {
    const rf = this.resultsFilter();
    const total =
      (rf['indicator-codes-filter']?.length ?? 0) +
      (rf['status-codes']?.length ?? 0) +
      (rf['contract-codes']?.length ?? 0) +
      (rf['lever-codes']?.length ?? 0) +
      (rf.years?.length ?? 0);
    return total > 0 ? total.toString() : undefined;
  });

  countTableFiltersSelected = computed(() => {
    const tf = this.tableFilters();
    const total =
      (tf.indicators?.length ?? 0) + (tf.statusCodes?.length ?? 0) + (tf.contracts?.length ?? 0) + (tf.levers?.length ?? 0) + (tf.years?.length ?? 0);
    return total > 0 ? total.toString() : undefined;
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
              able: [0, 1, 2, 3, 4, 5].includes(indicator.indicator_id)
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

  async main() {
    this.loading.set(true);
    try {
      const baseFilter = this.resultsFilter();
      const primaryContractId = this.primaryContractId();
      const finalFilter = primaryContractId
        ? ({ ...baseFilter, 'filter-primary-contract': [primaryContractId] } as ResultFilter)
        : baseFilter;

      const response = await this.getResultsService.getInstance(finalFilter, this.resultsConfig());
      const rawResults = response();

      const enhancedResults = rawResults.map(result => {
        const primaryLevers = Array.isArray(result.result_levers)
          ? result.result_levers.filter(rl => rl.is_primary === 1)
          : [];
        const primaryLeverSort =
          primaryLevers.length === 0
            ? ''
            : primaryLevers
                .map(rl => rl.lever?.short_name || '')
                .filter(Boolean)
                .join(', ')
                .toLowerCase();

        return {
          ...result,
          primaryLeverSort
        } as Result & { primaryLeverSort: string };
      });

      this.list.set(enhancedResults);
    } catch (error) {
      console.error('Error loading results:', error);
      this.list.set([]);
    } finally {
      this.loading.set(false);
    }
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
      'lever-codes': this.tableFilters().levers.map(lever => lever.id),
      'status-codes': this.tableFilters().statusCodes.map(status => status.result_status_id),
      years: this.tableFilters().years.map(year => year.report_year),
      'contract-codes': this.tableFilters().contracts.map(contract => contract.agreement_id),
      'indicator-codes-filter': this.tableFilters().indicators.map(indicator => indicator.indicator_id)
    }));

    this.appliedFilters.update(prev => ({
      ...prev,
      'lever-codes': this.tableFilters().levers.map(lever => lever.id),
      'status-codes': this.tableFilters().statusCodes.map(status => status.result_status_id),
      years: this.tableFilters().years.map(year => year.report_year),
      'contract-codes': this.tableFilters().contracts.map(contract => contract.agreement_id),
      'indicator-codes-filter': this.tableFilters().indicators.map(indicator => indicator.indicator_id)
    }));
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

    this.appliedFilters.update(prev => ({
      ...prev,
      'indicator-codes-tabs': indicatorId === 0 ? [] : [indicatorId],
      'indicator-codes-filter': []
    }));

    this.tableFilters.update(prev => ({
      ...prev,
      indicators: []
    }));
    this.main();
  }

  cleanFilters() {
    this.cleanMultiselects();
    //? clear table filters and reset sort
    const table = this.tableRef();
    if (table) {
      table.clear();
      table.sortField = 'result_official_code';
      table.sortOrder = -1;
    }

    this.tableFilters.update(prev => ({
      ...prev,
      indicators: [],
      statusCodes: [],
      years: [],
      contracts: [],
      levers: []
    }));
  }

  clearAllFilters() {
    this.cleanMultiselects();
    
    this.tableFilters.set(new TableFilters());
    this.tableFilters.update(prev => ({
      ...prev,
      indicators: [],
      statusCodes: [],
      years: [],
      contracts: [],
      levers: []
    }));

    this.resultsFilter.update(prev => ({
      ...prev,
      'indicator-codes-filter': [],
      'indicator-codes-tabs': []
    }));

    this.appliedFilters.update(prev => ({
      ...prev,
      'indicator-codes-filter': [],
      'indicator-codes-tabs': []
    }));

    // clear search input
    this.searchInput.set('');
    
    setTimeout(() => {
      this.cleanMultiselects();
    }, 0);
    
    const table = this.tableRef();
    if (table) {
      table.clear();
      table.sortField = 'result_official_code';
      table.sortOrder = -1;
    }
    this.onSelectFilterTab(0);
  }
  
  clearAllFiltersWithPreserve(preserveIndicatorCodes: readonly number[]): void {
    this.tableFilters.set(new TableFilters());
    this.tableFilters.update(prev => ({
      ...prev,
      indicators: [],
      statusCodes: [],
      years: [],
      contracts: [],
      levers: []
    }));

    const preserved = [...preserveIndicatorCodes];

    const withPreservedIndicators = (prev: ResultFilter) => ({
      ...prev,
      'indicator-codes-filter': [],
      'indicator-codes-tabs': preserved,
      'indicator-codes': preserved,
      'create-user-codes': []
    });

    this.resultsFilter.update(withPreservedIndicators);
    this.appliedFilters.update(withPreservedIndicators);

    // clear search input
    this.searchInput.set('');
    this.cleanMultiselects();
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
        try {
          multiselect.clear();
        } catch (error) {
          console.warn('Error clearing multiselect:', error);
        }
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
