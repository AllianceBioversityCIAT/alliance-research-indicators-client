import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { PaginationMeta, Result, ResultConfig, ResultFilter } from '@interfaces/result/result.interface';
@Injectable({
  providedIn: 'root'
})
export class GetResultsService {
  api = inject(ApiService);
  results: WritableSignal<Result[]> = signal([]);
  loading = signal(false);
  isOpenSearch = signal(false);
  constructor() {
    this.updateList();
  }

  private extractPaginatedData(response: any): { data: Result[]; pagination: PaginationMeta | null } {
    const payload = response?.data;
    if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
      return { data: payload.data, pagination: payload.pagination ?? null };
    }
    return { data: Array.isArray(payload) ? payload : [], pagination: null };
  }

  updateList = async () => {
    this.loading.set(true);
    try {
      const response = await this.api.GET_Results({});
      const { data } = this.extractPaginatedData(response);
      this.results.set(data);
    } catch {
      this.results.set([]);
    } finally {
      this.loading.set(false);
    }
  };

  getInstance = async (resultFilter: ResultFilter, resultConfig?: ResultConfig): Promise<{ data: WritableSignal<Result[]>; pagination: PaginationMeta | null }> => {
    const newSignal = signal<Result[]>([]);
    try {
      const response = await this.api.GET_Results(resultFilter, resultConfig);
      const { data, pagination } = this.extractPaginatedData(response);
      newSignal.set(data);
      return { data: newSignal, pagination };
    } catch {
      newSignal.set([]);
      return { data: newSignal, pagination: null };
    }
  };
}
