import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Result, ResultConfig, ResultFilter } from '@interfaces/result/result.interface';
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
  updateList = async () => {
    this.loading.set(true);
    try {
      const response = await this.api.GET_Results({});
      const data = Array.isArray(response?.data) ? response.data : [];
      this.results.set(data);
    } catch {
      this.results.set([]);
    } finally {
      this.loading.set(false);
    }
  };

  getInstance = async (resultFilter: ResultFilter, resultConfig?: ResultConfig): Promise<WritableSignal<Result[]>> => {
    const newSignal = signal<Result[]>([]);
    try {
      const response = await this.api.GET_Results(resultFilter, resultConfig);
      const data = Array.isArray(response?.data) ? response.data : [];
      newSignal.set(data);
    } catch {
      newSignal.set([]);
    }
    return newSignal;
  };
}
