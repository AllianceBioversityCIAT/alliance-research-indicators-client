import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Result } from '@interfaces/result/result.interface';
import { IndicatorsIds } from '../../enums/indicators-enum';
@Injectable({
  providedIn: 'root'
})
export class GetResultsService {
  api = inject(ApiService);
  results: WritableSignal<Result[]> = signal([]);
  isOpenSearch = signal(false);
  constructor() {
    this.updateList();
  }
  updateList = async () => this.results.set((await this.api.GET_Results()).data);
  getInstance = async (type?: IndicatorsIds): Promise<WritableSignal<Result[]>> => {
    const newSignal = signal<Result[]>([]);
    const response = await this.api.GET_Results(type);
    newSignal.set(response.data);
    return newSignal;
  };
}
