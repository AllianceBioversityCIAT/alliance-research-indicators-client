import { inject, Injectable, signal, effect } from '@angular/core';
import { GetResultsService } from '../../../../shared/services/control-list/get-results.service';
import { Result, ResultConfig, ResultFilter } from '../../../../shared/interfaces/result/result.interface';

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

  private getResultsService = inject(GetResultsService);

  onChangeFilters = effect(async () => {
    console.log('onChangeFilters');
    const response = await this.getResultsService.getInstance(this.resultsFilter(), this.resultsConfig());
    this.list.set(response());
    console.log(this.list());
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
    console.log('Filtros aplicados');
    this.hasFilters.set(true);
    this.confirmFiltersSignal.set(true); // Se activa la señal cuando se confirman los filtros
  }
}
