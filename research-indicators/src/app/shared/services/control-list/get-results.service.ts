import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { PaginatedResult, PaginationMeta, Result, ResultConfig, ResultFilter } from '@interfaces/result/result.interface';
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

  private extractPaginatedData(responseData: unknown): { data: Result[]; pagination: PaginationMeta | null } {
    if (responseData && typeof responseData === 'object' && 'data' in responseData && 'pagination' in responseData) {
      const paginated = responseData as PaginatedResult;
      return {
        data: Array.isArray(paginated.data) ? paginated.data : [],
        pagination: paginated.pagination ?? null
      };
    }
    return {
      data: Array.isArray(responseData) ? responseData : [],
      pagination: null
    };
  }

  updateList = async () => {
    this.loading.set(true);
    try {
      const response = await this.api.GET_Results({});
      const { data } = this.extractPaginatedData(response?.data);
      this.results.set(data);
    } catch {
      this.results.set([]);
    } finally {
      this.loading.set(false);
    }
  };

  getInstance = async (resultFilter: ResultFilter, resultConfig?: ResultConfig): Promise<{ data: WritableSignal<Result[]>; pagination: PaginationMeta | null }> => {
    const newSignal = signal<Result[]>([]);
    let pagination: PaginationMeta | null = null;
    try {
      const response = await this.api.GET_Results(resultFilter, resultConfig);
      const extracted = this.extractPaginatedData(response?.data);
      newSignal.set(extracted.data);
      pagination = extracted.pagination;
    } catch {
      newSignal.set([]);
    }
    return { data: newSignal, pagination };
  };
}
