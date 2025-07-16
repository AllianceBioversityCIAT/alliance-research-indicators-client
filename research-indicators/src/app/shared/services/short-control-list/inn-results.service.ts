import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { Result, ResultFilter } from '@shared/interfaces/result/result.interface';

@Injectable({
  providedIn: 'root'
})
export class InnResultsService {
  apiService = inject(ApiService);
  loading = signal(true);
  resultsFilter = signal<ResultFilter>({ 'indicator-codes': [2], 'lever-codes': [], 'create-user-codes': [] });

  list = signal<Result[]>([]);
  isOpenSearch = signal(false);

  constructor() {
    this.main();
  }

  async main() {
    this.loading.set(true);
    try {
      const response = await this.apiService.GET_Results(this.resultsFilter());
      const data = Array.isArray(response?.data) ? response.data : [];
      this.list.set(data);
      console.log(data);
    } catch {
      this.list.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
