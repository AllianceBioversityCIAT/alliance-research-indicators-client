import { inject, Injectable, signal, effect } from '@angular/core';
import { GetResultsService } from '../../../../shared/services/control-list/get-results.service';
import { Result, ResultConfig, ResultFilter } from '../../../../shared/interfaces/result/result.interface';
import { MenuItem } from 'primeng/api';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { TableColumn } from './result-center.interface';

@Injectable({
  providedIn: 'root'
})
export class ResultsCenterService {
  hasFilters = signal(false);
  showFiltersSidebar = signal(false);
  showConfigurationSidebar = signal(false);
  list = signal<Result[]>([]);
  tableFilters = signal({ levers: [], statusCodes: [], years: [], contracts: [], indicators: [] });

  tableColumns = signal<TableColumn[]>([
    {
      field: 'result_official_code',
      header: 'Code',
      getValue: (result: Result) => result.result_official_code
    },
    {
      field: 'title',
      header: 'Title',
      getValue: (result: Result) => result.title
    },
    {
      field: 'indicator_id',
      header: 'Indicator',
      getValue: (result: Result) => result.indicators?.name || '-'
    },
    {
      field: 'status',
      header: 'Status',
      getValue: (result: Result) => result.result_status?.name || '-'
    },
    {
      field: 'project',
      header: 'Project',
      getValue: (result: Result) => result.result_contracts?.contract_id || '-'
    },
    {
      field: 'lever',
      header: 'Lever',
      getValue: (result: Result) => result.result_levers?.lever?.short_name || '-'
    },
    {
      field: 'year',
      header: 'Year',
      getValue: (result: Result) => result.report_year_id?.toString() || '-'
    },
    {
      field: 'creator',
      header: 'Creator',
      getValue: (result: Result) => (result.created_by_user ? `${result.created_by_user.first_name} ${result.created_by_user.last_name}` : '-')
    },
    {
      field: 'creation_date',
      header: 'Creation date',
      getValue: (result: Result) => (result.created_at ? new Date(result.created_at).toLocaleDateString() : '-')
    }
  ]);

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

  onChangeFilters = effect(async () => {
    const response = await this.getResultsService.getInstance(this.resultsFilter(), this.resultsConfig());
    this.list.set(response());
  });

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

  onActiveItemChange = (event: MenuItem): void =>
    this.resultsFilter.update(prev => ({
      ...prev,
      'create-user-codes': event.id === 'my' ? [this.cache.dataCache().user.sec_user_id.toString()] : []
    }));

  applySidebarFilters(): void {
    // this.applyFilters();
  }

  applySidebarConfigurations(): void {
    // this.applyConfigurations();
  }

  clearFilters(): void {
    this.hasFilters.set(false);
    // TODO: Implement clear filters logic
  }

  showFilterSidebar(): void {
    this.showFiltersSidebar.set(true);
  }

  showConfigSidebar(): void {
    this.showConfigurationsSidebar.set(true);
  }

  clearAllFilters() {}

  applyFilters(): void {
    this.hasFilters.set(true);
    this.confirmFiltersSignal.set(true); // Se activa la señal cuando se confirman los filtros
  }
}
