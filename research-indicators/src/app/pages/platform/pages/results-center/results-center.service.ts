import { inject, Injectable, signal, effect } from '@angular/core';
import { GetResultsService } from '../../../../shared/services/control-list/get-results.service';
import { Result, ResultConfig, ResultFilter } from '../../../../shared/interfaces/result/result.interface';
import { MenuItem } from 'primeng/api';
import { CacheService } from '../../../../shared/services/cache/cache.service';
@Injectable({
  providedIn: 'root'
})
export class ResultsCenterService {
  hasFilters = signal(false);
  showFiltersSidebar = signal(false);
  showConfigurationSidebar = signal(false);
  list = signal<Result[]>([]);
  resultsFilter = signal<ResultFilter>({ indicatorsCodes: [] });
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
    this.resultsFilter.update(prev => ({ ...prev, userCodes: event.id === 'my' ? [this.cache.dataCache().user.sec_user_id.toString()] : [] }));

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

  applyFilters(): void {
    this.hasFilters.set(true);
    this.confirmFiltersSignal.set(true); // Se activa la señal cuando se confirman los filtros
  }
}
