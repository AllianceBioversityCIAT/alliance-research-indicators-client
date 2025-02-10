import { inject, Injectable, signal, effect } from '@angular/core';
import { GetResultsService } from '../../../../shared/services/control-list/get-results.service';
import { Result, ResultFilter } from '../../../../shared/interfaces/result/result.interface';

@Injectable({
  providedIn: 'root'
})
export class ResultsCenterService {
  hasFilters = signal(false);
  showFiltersSidebar = signal(false);
  showConfigurationSidebar = signal(false);
  selectedFilter = signal<number | null>(null);
  list = signal<Result[]>([]);
  resultsFilter = signal<ResultFilter>({});

  private getResultsService = inject(GetResultsService);

  onChangeFilters = effect(async () => {
    console.log('onChangeFilters');
    const response = await this.getResultsService.getInstance(this.resultsFilter());
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

  clearFilters(): void {
    this.hasFilters.set(false);
    // TODO: Implement clear filters logic
  }

  showFilterSidebar(): void {
    this.showFiltersSidebar.set(true);
  }

  showConfigSidebar(): void {
    this.showConfigurationSidebar.set(true);
  }
}
