import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { Result, ResultConfig, ResultFilter } from '@shared/interfaces/result/result.interface';

@Injectable({
  providedIn: 'root'
})
export class OicrResultsService {
  apiService = inject(ApiService);
  loading = signal(true);
  resultsFilter = signal<ResultFilter>({ 'indicator-codes': [5], 'lever-codes': [], 'create-user-codes': [] });
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

  list = signal<Result[]>([]);
  isOpenSearch = signal(false);

  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    try {
      const response = await this.apiService.GET_Results(this.resultsFilter(), this.resultsConfig());
      const data = Array.isArray(response?.data) ? response.data : [];
      const dataWithLabel = data.map((item: Result) => ({
        ...item,
        select_label: `${item.result_official_code || ''} - ${item.title || ''}`.trim()
      }));
      this.list.set(dataWithLabel);
    } catch {
      this.list.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
