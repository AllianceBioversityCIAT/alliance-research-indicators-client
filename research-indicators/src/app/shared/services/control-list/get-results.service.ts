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
    this.results.set((await this.api.GET_Results({})).data);
    this.loading.set(false);
  };

  getInstance = async (resultFilter: ResultFilter, resultConfig?: ResultConfig): Promise<WritableSignal<Result[]>> => {
    const newSignal = signal<Result[]>([]);
    const response = await this.api.GET_Results(resultFilter, resultConfig);
    newSignal.set(response.data);
    return newSignal;
  };
}
