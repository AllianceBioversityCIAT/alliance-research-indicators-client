import { inject, Injectable, signal } from '@angular/core';
import { GetResultsService } from '../../../../shared/services/control-list/get-results.service';
import { Result } from '@interfaces/result/result.interface';
import { IndicatorsIds } from '../../../../shared/enums/indicators-enum';

@Injectable({
  providedIn: 'root'
})
export class ResultsCenterService {
  list = signal<Result[]>([]);
  hasFilters = signal(false);
  showFiltersSidebar = signal(false);
  showConfigurationsSidebar = signal(false);

  private getResultsService = inject(GetResultsService);

  constructor() {
    this.updateList();
  }

  updateList = async (type?: IndicatorsIds) => this.list.set((await this.getResultsService.getInstance(type))());

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
}
